package com.localbizradar.api.sync.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import java.util.Optional;

import com.localbizradar.api.common.error.BadRequestException;
import com.localbizradar.api.region.domain.Region;
import com.localbizradar.api.region.repository.RegionRepository;
import com.localbizradar.api.sync.config.StoreOpenApiProperties;
import com.localbizradar.api.sync.config.StoreSyncProperties;
import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.dto.StoreOpenApiSyncRequest;
import com.localbizradar.api.sync.dto.StoreOpenApiSyncResponse;
import com.localbizradar.api.sync.openapi.client.StoreOpenApiClient;
import com.localbizradar.api.sync.openapi.dto.StoreOpenApiItem;
import com.localbizradar.api.sync.openapi.dto.StoreOpenApiPage;
import com.localbizradar.api.sync.openapi.mapper.StoreOpenApiMapper;
import com.localbizradar.api.sync.repository.SyncLogRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class StoreOpenApiSyncServiceTest {

	@Mock
	private StoreOpenApiClient storeOpenApiClient;

	@Mock
	private StoreUpsertService storeUpsertService;

	@Mock
	private SyncLogRepository syncLogRepository;

	@Mock
	private RegionRepository regionRepository;

	private StoreOpenApiSyncService storeOpenApiSyncService;

	@BeforeEach
	void setUp() {
		StoreOpenApiProperties properties = openApiProperties("test-key");
		storeOpenApiSyncService = new StoreOpenApiSyncService(
				storeOpenApiClient,
				new StoreOpenApiMapper(),
				storeUpsertService,
				syncLogRepository,
				regionRepository,
				properties,
				storeSyncProperties(),
				new StoreOpenApiScheduleService(properties));
		lenient().when(syncLogRepository.save(any(SyncLog.class))).thenAnswer(invocation -> {
			SyncLog syncLog = invocation.getArgument(0);
			ReflectionTestUtils.setField(syncLog, "id", 10L);
			return syncLog;
		});
		Region gangnamRegion = region("11", "11680", "11680640");
		lenient()
				.when(regionRepository.findFirstBySidoNameAndSigunguNameOrderByDongNameAsc("서울특별시", "강남구"))
				.thenReturn(Optional.of(gangnamRegion));
	}

	@Test
	void dryRunDoesNotUpsertStores() {
		when(storeOpenApiClient.fetchStores(any())).thenReturn(page(validItem("OPEN-001")));

		StoreOpenApiSyncResponse response = storeOpenApiSyncService.syncStores(request(true));

		assertThat(response.status()).isEqualTo(SyncStatus.SUCCESS);
		assertThat(response.dryRun()).isTrue();
		assertThat(response.fetchedRows()).isEqualTo(1);
		assertThat(response.successRows()).isEqualTo(1);
		assertThat(response.insertedRows()).isZero();
		verify(storeUpsertService, never()).upsert(any(StoreUpsertCommand.class), any());
	}

	@Test
	void syncCountsInsertedAndUpdatedRows() {
		when(storeOpenApiClient.fetchStores(any())).thenReturn(new StoreOpenApiPage(
				1,
				50,
				2,
				List.of(validItem("OPEN-001"), validItem("OPEN-002"))));
		when(storeUpsertService.upsert(any(StoreUpsertCommand.class), any()))
				.thenReturn(new StoreUpsertResult(true), new StoreUpsertResult(false));

		StoreOpenApiSyncResponse response = storeOpenApiSyncService.syncStores(request(false));

		assertThat(response.status()).isEqualTo(SyncStatus.SUCCESS);
		assertThat(response.dryRun()).isFalse();
		assertThat(response.successRows()).isEqualTo(2);
		assertThat(response.insertedRows()).isEqualTo(1);
		assertThat(response.updatedRows()).isEqualTo(1);
	}

	@Test
	void missingServiceKeyReturnsValidationError() {
		StoreOpenApiProperties properties = openApiProperties("");
		StoreOpenApiSyncService service = new StoreOpenApiSyncService(
				storeOpenApiClient,
				new StoreOpenApiMapper(),
				storeUpsertService,
				syncLogRepository,
				regionRepository,
				properties,
				storeSyncProperties(),
				new StoreOpenApiScheduleService(properties));

		assertThatThrownBy(() -> service.syncStores(request(true)))
				.isInstanceOf(BadRequestException.class)
				.hasMessageContaining("service key");
		verify(syncLogRepository, never()).save(any(SyncLog.class));
	}

	@Test
	void openApiErrorIsRecordedAsFailedResponse() {
		when(storeOpenApiClient.fetchStores(any()))
				.thenThrow(new BadRequestException("공공데이터 OpenAPI 호출에 실패했습니다."));

		StoreOpenApiSyncResponse response = storeOpenApiSyncService.syncStores(request(true));

		assertThat(response.status()).isEqualTo(SyncStatus.FAILED);
		assertThat(response.failedRows()).isEqualTo(1);
		assertThat(response.message()).contains("OpenAPI 호출");
		verify(syncLogRepository).save(any(SyncLog.class));
	}

	private StoreOpenApiSyncRequest request(boolean dryRun) {
		StoreOpenApiSyncRequest request = new StoreOpenApiSyncRequest();
		request.setSidoName("서울특별시");
		request.setSigunguName("강남구");
		request.setPageNo(1);
		request.setPageSize(50);
		request.setMaxPages(1);
		request.setDryRun(dryRun);
		return request;
	}

	private StoreOpenApiPage page(StoreOpenApiItem item) {
		return new StoreOpenApiPage(1, 50, 1, List.of(item));
	}

	private StoreOpenApiItem validItem(String id) {
		return new StoreOpenApiItem(
				id,
				"오픈API 테스트 카페",
				"",
				"Q",
				"음식",
					"Q12",
					"카페",
					"Q12A01",
					"커피전문점",
					"I56221",
					"커피 전문점",
					"11",
					"서울특별시",
					"11680",
					"강남구",
					"11680640",
					"역삼동",
					"1168010100",
					"역삼동",
					"1168010100100010000",
					"1",
					"대지",
					"1",
					"",
					"서울특별시 강남구 역삼동",
					"116804166001",
					"서울특별시 강남구 테헤란로",
					"1",
					"",
					"1168010100100010000000001",
					"",
					"서울특별시 강남구 테헤란로 1",
					"135000",
					"06200",
					"",
					"",
					"",
					"127.0328920",
					"37.4991240",
					null,
					null);
	}

	private Region region(String sidoCode, String sigunguCode, String dongCode) {
		Region region = org.mockito.Mockito.mock(Region.class);
		lenient().when(region.getSidoCode()).thenReturn(sidoCode);
		lenient().when(region.getSigunguCode()).thenReturn(sigunguCode);
		lenient().when(region.getDongCode()).thenReturn(dongCode);
		return region;
	}

	private StoreOpenApiProperties openApiProperties(String serviceKey) {
		return new StoreOpenApiProperties(
				"https://example.com/openapi",
				serviceKey,
				true,
				false,
				"0 0 3 * * *",
					50,
					2,
					10,
					"signguCd",
					"11680",
					"서울특별시",
				"강남구",
				"SMALL_BUSINESS_OPENAPI");
	}

	private StoreSyncProperties storeSyncProperties() {
		return new StoreSyncProperties(
				5000,
				20 * 1024 * 1024,
				false,
				"SMALL_BUSINESS_CSV",
				20);
	}
}

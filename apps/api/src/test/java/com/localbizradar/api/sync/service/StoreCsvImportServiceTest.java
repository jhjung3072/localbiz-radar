package com.localbizradar.api.sync.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.store.repository.StoreRepository;
import com.localbizradar.api.sync.config.StoreSyncProperties;
import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.dto.StoreCsvImportResponse;
import com.localbizradar.api.sync.mapper.StoreCsvMapper;
import com.localbizradar.api.sync.parser.StoreCsvParser;
import com.localbizradar.api.sync.repository.SyncLogRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class StoreCsvImportServiceTest {

	@Mock
	private StoreRepository storeRepository;

	@Mock
	private SyncLogRepository syncLogRepository;

	private StoreCsvImportService storeCsvImportService;

	@BeforeEach
	void setUp() {
		StoreSyncProperties properties = new StoreSyncProperties(
				5000,
				20 * 1024 * 1024,
				false,
				"SMALL_BUSINESS_CSV",
				20);
		storeCsvImportService = new StoreCsvImportService(
				new StoreCsvParser(),
				new StoreCsvMapper(),
				storeRepository,
				syncLogRepository,
				properties);
		when(syncLogRepository.save(any(SyncLog.class))).thenAnswer(invocation -> {
			SyncLog syncLog = invocation.getArgument(0);
			ReflectionTestUtils.setField(syncLog, "id", 1L);
			return syncLog;
		});
	}

	@Test
	void dryRunDoesNotSaveStores() {
		StoreCsvImportResponse response = storeCsvImportService.importStores(csvFile(validCsv()), true);

		assertThat(response.status()).isEqualTo(SyncStatus.SUCCESS);
		assertThat(response.dryRun()).isTrue();
		assertThat(response.successRows()).isEqualTo(1);
		verify(storeRepository, never()).save(any(Store.class));
	}

	@Test
	void importsValidRowsAndRecordsFailedRows() {
		when(storeRepository.findBySourceSystemAndExternalStoreId("SMALL_BUSINESS_CSV", "LBZ-001"))
				.thenReturn(Optional.empty());
		when(storeRepository.save(any(Store.class))).thenAnswer(invocation -> invocation.getArgument(0));
		String csv = validCsv()
				+ "LBZ-002,, ,Q,음식,Q12,카페,Q12A01,커피전문점,서울특별시,강남구,역삼동,"
				+ "서울특별시 강남구 역삼동,서울특별시 강남구 테헤란로 1,127.0328920,37.4991240\n";

		StoreCsvImportResponse response = storeCsvImportService.importStores(csvFile(csv), false);

		assertThat(response.status()).isEqualTo(SyncStatus.PARTIAL_SUCCESS);
		assertThat(response.successRows()).isEqualTo(1);
		assertThat(response.failedRows()).isEqualTo(1);
		verify(storeRepository).save(any(Store.class));
	}

	private MockMultipartFile csvFile(String content) {
		return new MockMultipartFile(
				"file",
				"stores.csv",
				"text/csv",
				content.getBytes(StandardCharsets.UTF_8));
	}

	private String validCsv() {
		return """
				상가업소번호,상호명,지점명,상권업종대분류코드,상권업종대분류명,상권업종중분류코드,상권업종중분류명,상권업종소분류코드,상권업종소분류명,시도명,시군구명,행정동명,지번주소,도로명주소,경도,위도
				LBZ-001,테스트 커피,,Q,음식,Q12,카페,Q12A01,커피전문점,서울특별시,강남구,역삼동,서울특별시 강남구 역삼동,서울특별시 강남구 테헤란로 1,127.0328920,37.4991240
				""";
	}
}

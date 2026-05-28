package com.localbizradar.api.ops.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.localbizradar.api.master.repository.CategoryMasterRepository;
import com.localbizradar.api.master.repository.RegionMasterRepository;
import com.localbizradar.api.ops.dto.OpsDataQualityResponse;
import com.localbizradar.api.ops.dto.OpsOverviewResponse;
import com.localbizradar.api.ops.dto.OpsSyncSummaryResponse;
import com.localbizradar.api.store.repository.StoreRepository;
import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;
import com.localbizradar.api.sync.repository.SyncLogRepository;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class OpsServiceTest {

	private final StoreRepository storeRepository = mock(StoreRepository.class);
	private final RegionMasterRepository regionMasterRepository = mock(RegionMasterRepository.class);
	private final CategoryMasterRepository categoryMasterRepository = mock(CategoryMasterRepository.class);
	private final SyncLogRepository syncLogRepository = mock(SyncLogRepository.class);
	private final OpsService opsService = new OpsService(
			storeRepository,
			regionMasterRepository,
			categoryMasterRepository,
			syncLogRepository,
			new MockEnvironment().withProperty("spring.profiles.active", "test"),
			"localbiz-radar-api");

	@Test
	void overviewReturnsStoreAndSyncSummary() {
		SyncLog syncLog = finishedLog(SyncType.STORE_OPENAPI_SYNC, SyncStatus.SUCCESS);
		given(storeRepository.count()).willReturn(100L);
		given(storeRepository.countWithCoordinates()).willReturn(98L);
		given(regionMasterRepository.count()).willReturn(10L);
		given(categoryMasterRepository.count()).willReturn(20L);
		given(syncLogRepository.findFirstByOrderByStartedAtDesc()).willReturn(Optional.of(syncLog));
		given(syncLogRepository.countByStatusAndStartedAtGreaterThanEqual(org.mockito.ArgumentMatchers.eq(SyncStatus.FAILED), org.mockito.ArgumentMatchers.any()))
				.willReturn(1L);

		OpsOverviewResponse response = opsService.getOverview();

		assertThat(response.service().name()).isEqualTo("localbiz-radar-api");
		assertThat(response.data().totalStores()).isEqualTo(100);
		assertThat(response.data().storesWithoutCoordinates()).isEqualTo(2);
		assertThat(response.sync().lastSyncStatus()).isEqualTo(SyncStatus.SUCCESS);
		assertThat(response.sync().failedSyncCountLast24h()).isEqualTo(1);
	}

	@Test
	void dataQualityCalculatesCoverageRate() {
		given(storeRepository.count()).willReturn(100L);
		given(storeRepository.countMissingCoordinates()).willReturn(5L);
		given(storeRepository.countMissingRoadAddress()).willReturn(2L);
		given(storeRepository.countMissingLotAddress()).willReturn(3L);
		given(storeRepository.countMissingCategory()).willReturn(1L);
		given(storeRepository.countDuplicateExternalStores()).willReturn(0L);

		OpsDataQualityResponse response = opsService.getDataQuality();

		assertThat(response.coordinateCoverageRate()).isEqualTo(95.0);
		assertThat(response.addressCoverageRate()).isEqualTo(98.0);
		assertThat(response.categoryCoverageRate()).isEqualTo(99.0);
	}

	@Test
	void syncSummaryGroupsByTypeAndStatus() {
		SyncLog success = finishedLog(SyncType.STORE_OPENAPI_SYNC, SyncStatus.SUCCESS);
		SyncLog failed = finishedLog(SyncType.STORE_OPENAPI_SYNC, SyncStatus.FAILED);
		given(syncLogRepository.findByStartedAtGreaterThanEqual(org.mockito.ArgumentMatchers.any()))
				.willReturn(List.of(success, failed));
		given(syncLogRepository.findTop5ByStatusAndFinishedAtGreaterThanEqualOrderByFinishedAtDesc(
				org.mockito.ArgumentMatchers.eq(SyncStatus.FAILED),
				org.mockito.ArgumentMatchers.any()))
				.willReturn(List.of(failed));

		OpsSyncSummaryResponse response = opsService.getSyncSummary(7);

		assertThat(response.totalRuns()).isEqualTo(2);
		assertThat(response.successRuns()).isEqualTo(1);
		assertThat(response.failedRuns()).isEqualTo(1);
		assertThat(response.byType()).hasSize(1);
		assertThat(response.recentFailures()).hasSize(1);
	}

	private SyncLog finishedLog(SyncType syncType, SyncStatus status) {
		LocalDateTime now = LocalDateTime.now();
		SyncLog syncLog = SyncLog.start(syncType, "test", false, now.minusMinutes(2));
		syncLog.finish(status, 10, 9, status == SyncStatus.FAILED ? 1 : 0, 0, "done", null, now);
		return syncLog;
	}
}

package com.localbizradar.api.ops.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import com.localbizradar.api.master.repository.CategoryMasterRepository;
import com.localbizradar.api.master.repository.RegionMasterRepository;
import com.localbizradar.api.ops.dto.OpsDataQualityResponse;
import com.localbizradar.api.ops.dto.OpsOverviewResponse;
import com.localbizradar.api.ops.dto.OpsOverviewResponse.OpsDataSummaryResponse;
import com.localbizradar.api.ops.dto.OpsOverviewResponse.OpsSyncOverviewResponse;
import com.localbizradar.api.ops.dto.OpsOverviewResponse.ServiceStatusResponse;
import com.localbizradar.api.ops.dto.OpsSyncSummaryResponse;
import com.localbizradar.api.ops.dto.OpsSyncSummaryResponse.OpsRecentFailureResponse;
import com.localbizradar.api.ops.dto.OpsSyncSummaryResponse.OpsSyncTypeSummaryResponse;
import com.localbizradar.api.store.repository.StoreRepository;
import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;
import com.localbizradar.api.sync.repository.SyncLogRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OpsService {

	private final StoreRepository storeRepository;
	private final RegionMasterRepository regionMasterRepository;
	private final CategoryMasterRepository categoryMasterRepository;
	private final SyncLogRepository syncLogRepository;
	private final Environment environment;
	private final String serviceName;
	private final LocalDateTime startedAt;

	public OpsService(
			StoreRepository storeRepository,
			RegionMasterRepository regionMasterRepository,
			CategoryMasterRepository categoryMasterRepository,
			SyncLogRepository syncLogRepository,
			Environment environment,
			@Value("${spring.application.name:localbiz-radar-api}") String serviceName
	) {
		this.storeRepository = storeRepository;
		this.regionMasterRepository = regionMasterRepository;
		this.categoryMasterRepository = categoryMasterRepository;
		this.syncLogRepository = syncLogRepository;
		this.environment = environment;
		this.serviceName = serviceName;
		this.startedAt = LocalDateTime.now();
	}

	public OpsOverviewResponse getOverview() {
		LocalDateTime now = LocalDateTime.now();
		long totalStores = storeRepository.count();
		long storesWithCoordinates = storeRepository.countWithCoordinates();
		long storesWithoutCoordinates = Math.max(0, totalStores - storesWithCoordinates);

		SyncLog lastSync = syncLogRepository.findFirstByOrderByStartedAtDesc().orElse(null);
		long failedSyncCountLast24h = syncLogRepository.countByStatusAndStartedAtGreaterThanEqual(
				SyncStatus.FAILED,
				now.minusHours(24));

		return new OpsOverviewResponse(
				new ServiceStatusResponse(
						serviceName,
						"UP",
						resolveProfile(),
						startedAt,
						Duration.between(startedAt, now).toSeconds()),
				new OpsDataSummaryResponse(
						totalStores,
						storesWithCoordinates,
						storesWithoutCoordinates,
						regionMasterRepository.count(),
						categoryMasterRepository.count()),
				new OpsSyncOverviewResponse(
						lastSync == null ? null : lastSync.getSyncType(),
						lastSync == null ? null : lastSync.getStatus(),
						lastSync == null ? null : lastSync.getFinishedAt(),
						failedSyncCountLast24h));
	}

	public OpsSyncSummaryResponse getSyncSummary(int days) {
		LocalDateTime since = LocalDateTime.now().minusDays(days);
		List<SyncLog> syncLogs = syncLogRepository.findByStartedAtGreaterThanEqual(since);

		List<OpsSyncTypeSummaryResponse> byType = Arrays.stream(SyncType.values())
				.map(syncType -> toTypeSummary(syncType, syncLogs))
				.filter(summary -> summary.totalRuns() > 0)
				.sorted(Comparator.comparing(summary -> summary.syncType().name()))
				.toList();

		List<OpsRecentFailureResponse> recentFailures = syncLogRepository
				.findTop5ByStatusAndFinishedAtGreaterThanEqualOrderByFinishedAtDesc(SyncStatus.FAILED, since)
				.stream()
				.map(syncLog -> new OpsRecentFailureResponse(
						syncLog.getId(),
						syncLog.getSyncType(),
						syncLog.getStatus(),
						syncLog.getMessage(),
						syncLog.getFinishedAt()))
				.toList();

		return new OpsSyncSummaryResponse(
				days,
				syncLogs.size(),
				countByStatus(syncLogs, SyncStatus.SUCCESS),
				countByStatus(syncLogs, SyncStatus.PARTIAL_SUCCESS),
				countByStatus(syncLogs, SyncStatus.FAILED),
				byType,
				recentFailures);
	}

	public OpsDataQualityResponse getDataQuality() {
		long totalStores = storeRepository.count();
		long missingCoordinateCount = storeRepository.countMissingCoordinates();
		long missingRoadAddressCount = storeRepository.countMissingRoadAddress();
		long missingLotAddressCount = storeRepository.countMissingLotAddress();
		long missingCategoryCount = storeRepository.countMissingCategory();

		return new OpsDataQualityResponse(
				totalStores,
				missingCoordinateCount,
				missingRoadAddressCount,
				missingLotAddressCount,
				missingCategoryCount,
				storeRepository.countDuplicateExternalStores(),
				coverageRate(totalStores, missingCoordinateCount),
				coverageRate(totalStores, Math.min(missingRoadAddressCount, missingLotAddressCount)),
				coverageRate(totalStores, missingCategoryCount));
	}

	private OpsSyncTypeSummaryResponse toTypeSummary(SyncType syncType, List<SyncLog> syncLogs) {
		List<SyncLog> filteredLogs = syncLogs.stream()
				.filter(syncLog -> syncLog.getSyncType() == syncType)
				.toList();
		return new OpsSyncTypeSummaryResponse(
				syncType,
				filteredLogs.size(),
				countByStatus(filteredLogs, SyncStatus.SUCCESS),
				countByStatus(filteredLogs, SyncStatus.PARTIAL_SUCCESS),
				countByStatus(filteredLogs, SyncStatus.FAILED));
	}

	private long countByStatus(List<SyncLog> syncLogs, SyncStatus status) {
		return syncLogs.stream()
				.filter(syncLog -> syncLog.getStatus() == status)
				.count();
	}

	private double coverageRate(long totalCount, long missingCount) {
		if (totalCount <= 0) {
			return 0;
		}
		double rate = (totalCount - missingCount) * 100.0 / totalCount;
		return Math.round(Math.max(0, Math.min(100, rate)) * 10) / 10.0;
	}

	private String resolveProfile() {
		String[] activeProfiles = environment.getActiveProfiles();
		if (activeProfiles.length == 0) {
			return "default";
		}
		return String.join(",", activeProfiles);
	}
}

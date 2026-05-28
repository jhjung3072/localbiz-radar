package com.localbizradar.api.ops.dto;

import java.time.LocalDateTime;

import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;

public record OpsOverviewResponse(
		ServiceStatusResponse service,
		OpsDataSummaryResponse data,
		OpsSyncOverviewResponse sync
) {

	public record ServiceStatusResponse(
			String name,
			String status,
			String profile,
			LocalDateTime startedAt,
			long uptimeSeconds
	) {
	}

	public record OpsDataSummaryResponse(
			long totalStores,
			long storesWithCoordinates,
			long storesWithoutCoordinates,
			long regionMasterCount,
			long categoryMasterCount
	) {
	}

	public record OpsSyncOverviewResponse(
			SyncType lastSyncType,
			SyncStatus lastSyncStatus,
			LocalDateTime lastSyncFinishedAt,
			long failedSyncCountLast24h
	) {
	}
}

package com.localbizradar.api.sync.dto;

import java.time.LocalDateTime;

import com.localbizradar.api.sync.domain.SyncStatus;

public record StoreOpenApiStatusResponse(
		boolean enabled,
		boolean serviceKeyConfigured,
		boolean baseUrlConfigured,
		boolean schedulerEnabled,
		String cron,
		int defaultPageSize,
		int maxPagesPerRun,
		LocalDateTime lastSyncStartedAt,
		SyncStatus lastSyncStatus
) {
}

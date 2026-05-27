package com.localbizradar.api.sync.dto;

import java.time.LocalDateTime;

import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;

public record SyncLogListItemResponse(
		Long id,
		SyncType syncType,
		String sourceName,
		SyncStatus status,
		boolean dryRun,
		int totalRows,
		int successRows,
		int failedRows,
		int skippedRows,
		LocalDateTime startedAt,
		LocalDateTime finishedAt,
		String message
) {

	public static SyncLogListItemResponse from(SyncLog syncLog) {
		return new SyncLogListItemResponse(
				syncLog.getId(),
				syncLog.getSyncType(),
				syncLog.getSourceName(),
				syncLog.getStatus(),
				syncLog.isDryRun(),
				syncLog.getTotalRows(),
				syncLog.getSuccessRows(),
				syncLog.getFailedRows(),
				syncLog.getSkippedRows(),
				syncLog.getStartedAt(),
				syncLog.getFinishedAt(),
				syncLog.getMessage());
	}
}

package com.localbizradar.api.master.dto;

import java.util.List;

import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;

public record MasterSyncResponse(
		Long syncLogId,
		SyncStatus status,
		boolean dryRun,
		SyncType syncType,
		int requestedCount,
		int fetchedRows,
		int insertedRows,
		int updatedRows,
		int skippedRows,
		int failedRows,
		String message,
		List<MasterSyncErrorResponse> errors
) {
}

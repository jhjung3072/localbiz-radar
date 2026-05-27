package com.localbizradar.api.sync.dto;

import java.util.List;

import com.localbizradar.api.sync.domain.SyncStatus;

public record StoreCsvImportResponse(
		Long syncLogId,
		SyncStatus status,
		boolean dryRun,
		int totalRows,
		int successRows,
		int failedRows,
		int skippedRows,
		String message,
		List<StoreCsvRowErrorResponse> errors
) {
}

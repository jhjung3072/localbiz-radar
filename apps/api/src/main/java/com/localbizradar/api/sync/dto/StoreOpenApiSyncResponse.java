package com.localbizradar.api.sync.dto;

import java.util.List;

import com.localbizradar.api.sync.domain.SyncStatus;

public record StoreOpenApiSyncResponse(
		Long syncLogId,
		SyncStatus status,
		boolean dryRun,
		int requestedPages,
		int fetchedRows,
		int successRows,
		int failedRows,
		int skippedRows,
		int insertedRows,
		int updatedRows,
		String message,
		List<StoreOpenApiRowErrorResponse> errors
) {
}

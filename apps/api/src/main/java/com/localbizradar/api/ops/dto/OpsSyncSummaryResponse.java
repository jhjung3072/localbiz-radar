package com.localbizradar.api.ops.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;

public record OpsSyncSummaryResponse(
		int days,
		long totalRuns,
		long successRuns,
		long partialSuccessRuns,
		long failedRuns,
		List<OpsSyncTypeSummaryResponse> byType,
		List<OpsRecentFailureResponse> recentFailures
) {

	public record OpsSyncTypeSummaryResponse(
			SyncType syncType,
			long totalRuns,
			long successRuns,
			long partialSuccessRuns,
			long failedRuns
	) {
	}

	public record OpsRecentFailureResponse(
			Long syncLogId,
			SyncType syncType,
			SyncStatus status,
			String message,
			LocalDateTime finishedAt
	) {
	}
}

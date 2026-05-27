package com.localbizradar.api.master.dto;

public record MasterSyncErrorResponse(
		String scope,
		String message
) {
}

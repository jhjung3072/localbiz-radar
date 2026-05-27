package com.localbizradar.api.sync.dto;

public record StoreOpenApiRowErrorResponse(
		int pageNo,
		int rowNumber,
		String message
) {
}

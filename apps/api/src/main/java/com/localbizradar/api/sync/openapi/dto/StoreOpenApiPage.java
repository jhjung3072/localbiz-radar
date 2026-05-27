package com.localbizradar.api.sync.openapi.dto;

import java.util.List;

public record StoreOpenApiPage(
		int pageNo,
		int pageSize,
		int totalCount,
		List<StoreOpenApiItem> items
) {
}

package com.localbizradar.api.sync.openapi.dto;

import java.math.BigDecimal;

public record StoreOpenApiRequest(
		String operationPath,
		String divId,
		String key,
		Integer radius,
		BigDecimal cx,
		BigDecimal cy,
		String categoryLargeCode,
		String categoryMediumCode,
		String categorySmallCode,
		int pageNo,
		int pageSize
) {
}

package com.localbizradar.api.analysis.dto;

public record CategoryDistributionItemResponse(
		String categoryCode,
		String categoryName,
		long storeCount,
		double ratio
) {
}

package com.localbizradar.api.analysis.dto;

public record CompetitionResponse(
		long targetStoreCount,
		long sameCategoryStoreCount,
		long totalStoresInArea,
		double competitionIndex,
		int radius,
		String unit,
		String message
) {
}

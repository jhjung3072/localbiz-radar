package com.localbizradar.api.analysis.dto;

public record AnalysisSummaryResponse(
		long totalStores,
		long totalCategories,
		String topCategoryName,
		double competitionIndex,
		double categoryDiversityScore,
		double localBizScore,
		String selectedRegionLabel,
		String selectedCategoryLabel
) {
}

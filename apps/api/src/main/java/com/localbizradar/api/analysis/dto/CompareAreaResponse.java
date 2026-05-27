package com.localbizradar.api.analysis.dto;

public record CompareAreaResponse(
		String regionLabel,
		long totalStores,
		long totalCategories,
		String topCategoryName,
		double competitionIndex,
		double categoryDiversityScore,
		double localBizScore
) {

	public static CompareAreaResponse from(AnalysisSummaryResponse summary) {
		return new CompareAreaResponse(
				summary.selectedRegionLabel(),
				summary.totalStores(),
				summary.totalCategories(),
				summary.topCategoryName(),
				summary.competitionIndex(),
				summary.categoryDiversityScore(),
				summary.localBizScore());
	}
}

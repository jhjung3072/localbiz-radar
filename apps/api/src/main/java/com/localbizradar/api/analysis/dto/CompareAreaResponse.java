package com.localbizradar.api.analysis.dto;

public record CompareAreaResponse(
		String regionLabel,
		long totalStores,
		long categoryStoreCount,
		double categoryShare,
		long totalCategories,
		String topCategoryName,
		double competitionIndex,
		double categoryDiversityScore,
		double densityScore,
		double localBizScore,
		java.util.List<CategoryDistributionItemResponse> topCategories
) {

	public static CompareAreaResponse from(AnalysisSummaryResponse summary) {
		return new CompareAreaResponse(
				summary.selectedRegionLabel(),
				summary.totalStores(),
				summary.totalStores(),
				summary.totalStores() == 0 ? 0 : 100,
				summary.totalCategories(),
				summary.topCategoryName(),
				summary.competitionIndex(),
				summary.categoryDiversityScore(),
				summary.totalStores() == 0 ? 0 : Math.min(100, summary.totalStores() * 8.0),
				summary.localBizScore(),
				java.util.List.of());
	}
}

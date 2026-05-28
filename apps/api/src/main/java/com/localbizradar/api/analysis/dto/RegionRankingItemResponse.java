package com.localbizradar.api.analysis.dto;

public record RegionRankingItemResponse(
		int rank,
		String ctprvnCd,
		String ctprvnNm,
		String signguCd,
		String signguNm,
		String adongCd,
		String adongNm,
		String regionLabel,
		long totalStores,
		long categoryStoreCount,
		double competitionIndex,
		double categoryDiversityScore,
		double densityScore,
		double localBizScore
) {
}

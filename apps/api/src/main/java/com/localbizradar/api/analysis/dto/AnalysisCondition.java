package com.localbizradar.api.analysis.dto;

public record AnalysisCondition(
		String sidoCode,
		String sido,
		String sigunguCode,
		String sigungu,
		String adminDongCode,
		String dong,
		String categoryLargeCode,
		String categoryMediumCode,
		String categorySmallCode
) {
}

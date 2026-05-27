package com.localbizradar.api.analysis.dto;

public record CompareAnalysisResponse(
		CompareAreaResponse base,
		CompareAreaResponse target,
		CompareWinnerResponse winner
) {
}

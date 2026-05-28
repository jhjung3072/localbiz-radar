package com.localbizradar.api.analysis.dto;

public record CompareAnalysisResponse(
		CompareAreaResponse base,
		CompareAreaResponse target,
		CompareWinnerResponse winner,
		java.util.List<MetricComparisonResponse> metricComparisons
) {
	public CompareAnalysisResponse(
			CompareAreaResponse base,
			CompareAreaResponse target,
			CompareWinnerResponse winner
	) {
		this(base, target, winner, java.util.List.of());
	}
}

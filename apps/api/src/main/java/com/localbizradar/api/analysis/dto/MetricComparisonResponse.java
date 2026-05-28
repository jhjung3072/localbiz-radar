package com.localbizradar.api.analysis.dto;

public record MetricComparisonResponse(
		String metricKey,
		String metricName,
		double baseValue,
		double targetValue,
		String winner
) {
}

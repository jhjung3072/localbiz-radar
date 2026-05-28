package com.localbizradar.api.analysis.dto;

public record CompareWinnerResponse(
		String regionLabel,
		double scoreGap,
		String reason
) {
}

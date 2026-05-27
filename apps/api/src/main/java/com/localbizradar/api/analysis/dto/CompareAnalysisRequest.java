package com.localbizradar.api.analysis.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record CompareAnalysisRequest(
		@Valid @NotNull CompareAreaRequest base,
		@Valid @NotNull CompareAreaRequest target
) {
}

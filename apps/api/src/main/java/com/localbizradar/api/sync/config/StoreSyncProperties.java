package com.localbizradar.api.sync.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "localbiz.store-sync")
public record StoreSyncProperties(
		@Min(1) @Max(100_000) int maxRowsPerImport,
		@Positive long maxFileSizeBytes,
		boolean failFast,
		@NotBlank String defaultSourceSystem,
		@Min(1) @Max(100) int maxErrorSummaryCount
) {
	public StoreSyncProperties {
		if (maxRowsPerImport == 0) {
			maxRowsPerImport = 5000;
		}
		if (maxFileSizeBytes == 0) {
			maxFileSizeBytes = 20 * 1024 * 1024;
		}
		if (defaultSourceSystem == null || defaultSourceSystem.isBlank()) {
			defaultSourceSystem = "SMALL_BUSINESS_CSV";
		}
		if (maxErrorSummaryCount == 0) {
			maxErrorSummaryCount = 20;
		}
	}
}

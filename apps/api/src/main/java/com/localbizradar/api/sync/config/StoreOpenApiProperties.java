package com.localbizradar.api.sync.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "localbiz.store-openapi")
public record StoreOpenApiProperties(
		String baseUrl,
		String serviceKey,
		String defaultType,
		boolean enabled,
		boolean schedulerEnabled,
		@NotBlank String cron,
		@Min(1) @Max(1000) int defaultPageSize,
		@Min(1) @Max(10) int maxPagesPerRun,
		@Positive int requestTimeoutSeconds,
		@PositiveOrZero int requestIntervalMillis,
		@Pattern(regexp = "ctprvnCd|signguCd|adongCd") String defaultDivId,
		@NotBlank String defaultRegionKey,
		@NotBlank String defaultSidoName,
		String defaultSigunguName,
		@NotBlank String defaultSourceSystem
) {
	public StoreOpenApiProperties {
		if (cron == null || cron.isBlank()) {
			cron = "0 0 3 * * *";
		}
		if (defaultType == null || defaultType.isBlank()) {
			defaultType = "xml";
		}
		if (defaultPageSize == 0) {
			defaultPageSize = 50;
		}
		if (maxPagesPerRun == 0) {
			maxPagesPerRun = 1;
		}
		if (requestTimeoutSeconds == 0) {
			requestTimeoutSeconds = 10;
		}
		if (defaultDivId == null || defaultDivId.isBlank()) {
			defaultDivId = "signguCd";
		}
		if (defaultRegionKey == null || defaultRegionKey.isBlank()) {
			defaultRegionKey = "11680";
		}
		if (defaultSidoName == null || defaultSidoName.isBlank()) {
			defaultSidoName = "서울특별시";
		}
		if (defaultSourceSystem == null || defaultSourceSystem.isBlank()) {
			defaultSourceSystem = "SMALL_BUSINESS_OPENAPI";
		}
	}
}

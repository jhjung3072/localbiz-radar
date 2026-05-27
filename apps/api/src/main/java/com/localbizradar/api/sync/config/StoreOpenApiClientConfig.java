package com.localbizradar.api.sync.config;

import java.time.Duration;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class StoreOpenApiClientConfig {

	@Bean
	RestClient storeOpenApiRestClient(
			RestClient.Builder builder,
			RestTemplateBuilder restTemplateBuilder,
			StoreOpenApiProperties properties
	) {
		return builder
				.requestFactory(restTemplateBuilder
						.connectTimeout(Duration.ofSeconds(properties.requestTimeoutSeconds()))
						.readTimeout(Duration.ofSeconds(properties.requestTimeoutSeconds()))
						.buildRequestFactory())
				.build();
	}
}

package com.localbizradar.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	OpenAPI localBizRadarOpenApi() {
		return new OpenAPI()
				.info(new Info()
						.title("LocalBiz Radar API")
						.version("v1")
						.description("LocalBiz Radar의 지역 상권 분석용 내부 API입니다."));
	}
}

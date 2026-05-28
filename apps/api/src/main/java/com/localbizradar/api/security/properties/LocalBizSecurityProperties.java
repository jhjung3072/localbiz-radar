package com.localbizradar.api.security.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "localbiz.security")
public record LocalBizSecurityProperties(
		@Valid Admin admin,
		@Valid Jwt jwt,
		@Valid Cookie cookie
) {

	public record Admin(
			@NotBlank String username,
			@NotBlank String password,
			@NotBlank String displayName
	) {
	}

	public record Jwt(
			@NotBlank String issuer,
			@NotBlank String accessTokenSecret,
			@NotBlank String refreshTokenSecret,
			@Positive long accessTokenValidMinutes,
			@Positive long refreshTokenValidDays
	) {
	}

	public record Cookie(
			@NotBlank String accessTokenName,
			@NotBlank String refreshTokenName,
			boolean httpOnly,
			boolean secure,
			@NotBlank String sameSite,
			@NotBlank String path,
			@Positive long accessTokenMaxAgeSeconds,
			@Positive long refreshTokenMaxAgeSeconds
	) {
	}
}

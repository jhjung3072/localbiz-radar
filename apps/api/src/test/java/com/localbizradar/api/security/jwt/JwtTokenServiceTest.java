package com.localbizradar.api.security.jwt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.localbizradar.api.security.properties.LocalBizSecurityProperties;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtException;

class JwtTokenServiceTest {

	private final JwtTokenService jwtTokenService = new JwtTokenService(properties());

	@Test
	void createsAndValidatesAccessToken() {
		TokenResult token = jwtTokenService.createAccessToken("admin");

		TokenClaims claims = jwtTokenService.validateAccessToken(token.token());

		assertThat(claims.username()).isEqualTo("admin");
		assertThat(claims.role()).isEqualTo("ADMIN");
		assertThat(claims.tokenId()).isEqualTo(token.tokenId());
	}

	@Test
	void rejectsRefreshTokenAsAccessToken() {
		TokenResult token = jwtTokenService.createRefreshToken("admin");

		assertThatThrownBy(() -> jwtTokenService.validateAccessToken(token.token()))
				.isInstanceOf(JwtException.class);
	}

	private LocalBizSecurityProperties properties() {
		return new LocalBizSecurityProperties(
				new LocalBizSecurityProperties.Admin("admin", "admin1234", "LocalBiz Admin"),
				new LocalBizSecurityProperties.Jwt(
						"localbiz-radar",
						"test-access-token-secret-change-me-change-me",
						"test-refresh-token-secret-change-me-change-me",
						15,
						7),
				new LocalBizSecurityProperties.Cookie(
						"LOCALBIZ_ACCESS_TOKEN",
						"LOCALBIZ_REFRESH_TOKEN",
						true,
						false,
						"Lax",
						"/",
						900,
						604800));
	}
}

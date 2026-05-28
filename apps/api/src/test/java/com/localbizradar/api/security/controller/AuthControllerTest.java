package com.localbizradar.api.security.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import com.localbizradar.api.security.dto.AdminUserResponse;
import com.localbizradar.api.security.dto.AuthResponse;
import com.localbizradar.api.security.jwt.TokenResult;
import com.localbizradar.api.security.service.AuthCookieService;
import com.localbizradar.api.security.service.AuthService;
import com.localbizradar.api.security.service.AuthSession;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.ResponseCookie;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private AuthService authService;

	@MockitoBean
	private AuthCookieService authCookieService;

	@Test
	void loginSetsHttpOnlyCookiesAndDoesNotReturnTokens() throws Exception {
		TokenResult accessToken = token("access-token-value", "access-id", 900);
		TokenResult refreshToken = token("refresh-token-value", "refresh-id", 604800);
		AuthResponse response = new AuthResponse(
				new AdminUserResponse("admin", "LocalBiz Admin", "ADMIN"),
				900,
				604800);
		given(authService.login(any(), any()))
				.willReturn(new AuthSession(response, accessToken, refreshToken));
		given(authCookieService.accessTokenCookie(accessToken))
				.willReturn(ResponseCookie.from("LOCALBIZ_ACCESS_TOKEN", accessToken.token())
						.httpOnly(true)
						.path("/")
						.maxAge(900)
						.build());
		given(authCookieService.refreshTokenCookie(refreshToken))
				.willReturn(ResponseCookie.from("LOCALBIZ_REFRESH_TOKEN", refreshToken.token())
						.httpOnly(true)
						.path("/")
						.maxAge(604800)
						.build());

		mockMvc.perform(post("/api/auth/login")
						.contentType("application/json")
						.content("""
								{"username":"admin","password":"admin1234"}
								"""))
				.andExpect(status().isOk())
				.andExpect(cookie().httpOnly("LOCALBIZ_ACCESS_TOKEN", true))
				.andExpect(cookie().httpOnly("LOCALBIZ_REFRESH_TOKEN", true))
				.andExpect(jsonPath("$.user.username").value("admin"))
				.andExpect(content().string(not(containsString(accessToken.token()))))
				.andExpect(content().string(not(containsString(refreshToken.token()))));
	}

	private TokenResult token(String token, String tokenId, long expiresInSeconds) {
		Instant issuedAt = Instant.now();
		return new TokenResult(token, tokenId, issuedAt, issuedAt.plusSeconds(expiresInSeconds), expiresInSeconds);
	}
}

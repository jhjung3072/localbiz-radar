package com.localbizradar.api.security.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.lenient;

import java.util.Optional;

import com.localbizradar.api.security.domain.AdminRefreshToken;
import com.localbizradar.api.security.dto.LoginRequest;
import com.localbizradar.api.security.jwt.JwtTokenService;
import com.localbizradar.api.security.properties.LocalBizSecurityProperties;
import com.localbizradar.api.security.repository.AdminRefreshTokenRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	@Mock
	private AdminRefreshTokenRepository refreshTokenRepository;

	private AuthService authService;

	@BeforeEach
	void setUp() {
		LocalBizSecurityProperties properties = properties();
		authService = new AuthService(
				properties,
				new BCryptPasswordEncoder(),
				new JwtTokenService(properties),
				new TokenHashService(),
				refreshTokenRepository);
		lenient().when(refreshTokenRepository.save(any(AdminRefreshToken.class)))
				.thenAnswer(invocation -> invocation.getArgument(0));
	}

	@Test
	void loginIssuesTokensWithoutPuttingTokenInResponse() {
		AuthSession session = authService.login(
				new LoginRequest("admin", "admin1234"),
				request());

		assertThat(session.response().user().username()).isEqualTo("admin");
		assertThat(session.response().accessTokenExpiresIn()).isEqualTo(900);
		assertThat(session.response().toString()).doesNotContain(session.accessToken().token());
		assertThat(session.response().toString()).doesNotContain(session.refreshToken().token());
	}

	@Test
	void rejectsWrongPassword() {
		assertThatThrownBy(() -> authService.login(
				new LoginRequest("admin", "wrong-password"),
				request()))
				.isInstanceOf(AuthException.class)
				.hasMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
	}

	@Test
	void refreshRotatesRefreshTokenAndRevokesPreviousToken() {
		AuthSession loginSession = authService.login(
				new LoginRequest("admin", "admin1234"),
				request());
		ArgumentCaptor<AdminRefreshToken> captor = ArgumentCaptor.forClass(AdminRefreshToken.class);
		org.mockito.Mockito.verify(refreshTokenRepository).save(captor.capture());
		AdminRefreshToken storedToken = captor.getValue();
		given(refreshTokenRepository.findByTokenId(loginSession.refreshToken().tokenId()))
				.willReturn(Optional.of(storedToken));

		AuthSession refreshed = authService.refresh(loginSession.refreshToken().token(), request());

		assertThat(refreshed.refreshToken().tokenId()).isNotEqualTo(loginSession.refreshToken().tokenId());
		assertThat(storedToken.isRevoked()).isTrue();
		assertThat(storedToken.getReplacedByTokenId()).isEqualTo(refreshed.refreshToken().tokenId());
	}

	@Test
	void revokedRefreshTokenCannotBeUsedAgain() {
		AuthSession loginSession = authService.login(
				new LoginRequest("admin", "admin1234"),
				request());
		ArgumentCaptor<AdminRefreshToken> captor = ArgumentCaptor.forClass(AdminRefreshToken.class);
		org.mockito.Mockito.verify(refreshTokenRepository).save(captor.capture());
		AdminRefreshToken storedToken = captor.getValue();
		storedToken.revoke(null, java.time.LocalDateTime.now(java.time.ZoneOffset.UTC));
		given(refreshTokenRepository.findByTokenId(loginSession.refreshToken().tokenId()))
				.willReturn(Optional.of(storedToken));

		assertThatThrownBy(() -> authService.refresh(loginSession.refreshToken().token(), request()))
				.isInstanceOf(AuthException.class)
				.hasMessage("다시 로그인이 필요합니다.");
	}

	private MockHttpServletRequest request() {
		MockHttpServletRequest request = new MockHttpServletRequest();
		request.addHeader("User-Agent", "JUnit");
		request.setRemoteAddr("127.0.0.1");
		return request;
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

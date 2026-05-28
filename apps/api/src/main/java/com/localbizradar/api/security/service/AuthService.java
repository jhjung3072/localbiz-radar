package com.localbizradar.api.security.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Objects;

import jakarta.servlet.http.HttpServletRequest;

import com.localbizradar.api.security.domain.AdminRefreshToken;
import com.localbizradar.api.security.dto.AdminUserResponse;
import com.localbizradar.api.security.dto.AuthResponse;
import com.localbizradar.api.security.dto.LoginRequest;
import com.localbizradar.api.security.jwt.JwtTokenService;
import com.localbizradar.api.security.jwt.TokenClaims;
import com.localbizradar.api.security.jwt.TokenResult;
import com.localbizradar.api.security.properties.LocalBizSecurityProperties;
import com.localbizradar.api.security.repository.AdminRefreshTokenRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private static final String ROLE_ADMIN = "ADMIN";

	private final LocalBizSecurityProperties properties;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenService jwtTokenService;
	private final TokenHashService tokenHashService;
	private final AdminRefreshTokenRepository refreshTokenRepository;
	private final String encodedAdminPassword;

	public AuthService(
			LocalBizSecurityProperties properties,
			PasswordEncoder passwordEncoder,
			JwtTokenService jwtTokenService,
			TokenHashService tokenHashService,
			AdminRefreshTokenRepository refreshTokenRepository
	) {
		this.properties = properties;
		this.passwordEncoder = passwordEncoder;
		this.jwtTokenService = jwtTokenService;
		this.tokenHashService = tokenHashService;
		this.refreshTokenRepository = refreshTokenRepository;
		this.encodedAdminPassword = passwordEncoder.encode(properties.admin().password());
	}

	@Transactional
	public AuthSession login(LoginRequest request, HttpServletRequest httpRequest) {
		if (!properties.admin().username().equals(request.username())
				|| !passwordEncoder.matches(request.password(), encodedAdminPassword)) {
			throw new AuthException("아이디 또는 비밀번호가 올바르지 않습니다.");
		}

		return issueSession(request.username(), httpRequest);
	}

	@Transactional
	public AuthSession refresh(String refreshToken, HttpServletRequest httpRequest) {
		TokenClaims claims = validateRefreshToken(refreshToken);
		LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
		AdminRefreshToken storedToken = refreshTokenRepository.findByTokenId(claims.tokenId())
				.orElseThrow(() -> new AuthException("다시 로그인이 필요합니다."));

		if (storedToken.isRevoked()
				|| storedToken.isExpired(now)
				|| !storedToken.getUsername().equals(claims.username())
				|| !Objects.equals(storedToken.getTokenHash(), tokenHashService.hash(refreshToken))) {
			throw new AuthException("다시 로그인이 필요합니다.");
		}

		AuthSession nextSession = issueSession(claims.username(), httpRequest);
		storedToken.revoke(nextSession.refreshToken().tokenId(), now);
		refreshTokenRepository.save(storedToken);
		return nextSession;
	}

	@Transactional
	public void logout(String refreshToken) {
		try {
			TokenClaims claims = jwtTokenService.validateRefreshToken(refreshToken);
			String tokenHash = tokenHashService.hash(refreshToken);
			refreshTokenRepository.findByTokenId(claims.tokenId())
					.filter(token -> Objects.equals(token.getTokenHash(), tokenHash))
					.filter(token -> !token.isRevoked())
					.ifPresent(token -> {
						token.revoke(null, LocalDateTime.now(ZoneOffset.UTC));
						refreshTokenRepository.save(token);
					});
		} catch (JwtException ignored) {
			// 로그아웃은 쿠키 삭제를 우선하므로 유효하지 않은 refresh token은 조용히 무시합니다.
		}
	}

	public AdminUserResponse currentAdmin(String username) {
		if (!properties.admin().username().equals(username)) {
			throw new AuthException("로그인이 필요합니다.");
		}
		return adminUser();
	}

	private AuthSession issueSession(String username, HttpServletRequest httpRequest) {
		TokenResult accessToken = jwtTokenService.createAccessToken(username);
		TokenResult refreshToken = jwtTokenService.createRefreshToken(username);
		LocalDateTime issuedAt = LocalDateTime.ofInstant(refreshToken.issuedAt(), ZoneOffset.UTC);
		LocalDateTime expiresAt = LocalDateTime.ofInstant(refreshToken.expiresAt(), ZoneOffset.UTC);
		AdminRefreshToken storedToken = AdminRefreshToken.issue(
				refreshToken.tokenId(),
				username,
				tokenHashService.hash(refreshToken.token()),
				issuedAt,
				expiresAt,
				truncate(httpRequest.getHeader("User-Agent"), 500),
				truncate(extractIpAddress(httpRequest), 80));
		refreshTokenRepository.save(storedToken);

		AuthResponse response = new AuthResponse(
				adminUser(),
				accessToken.expiresInSeconds(),
				refreshToken.expiresInSeconds());
		return new AuthSession(response, accessToken, refreshToken);
	}

	private TokenClaims validateRefreshToken(String refreshToken) {
		try {
			return jwtTokenService.validateRefreshToken(refreshToken);
		} catch (JwtException exception) {
			throw new AuthException("다시 로그인이 필요합니다.");
		}
	}

	private AdminUserResponse adminUser() {
		return new AdminUserResponse(
				properties.admin().username(),
				properties.admin().displayName(),
				ROLE_ADMIN);
	}

	private String extractIpAddress(HttpServletRequest request) {
		String forwardedFor = request.getHeader("X-Forwarded-For");
		if (forwardedFor != null && !forwardedFor.isBlank()) {
			return forwardedFor.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}

	private String truncate(String value, int maxLength) {
		if (value == null || value.length() <= maxLength) {
			return value;
		}
		return value.substring(0, maxLength);
	}
}

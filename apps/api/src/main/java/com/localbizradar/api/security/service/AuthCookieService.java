package com.localbizradar.api.security.service;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import com.localbizradar.api.security.jwt.TokenResult;
import com.localbizradar.api.security.properties.LocalBizSecurityProperties;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class AuthCookieService {

	private final LocalBizSecurityProperties properties;

	public AuthCookieService(LocalBizSecurityProperties properties) {
		this.properties = properties;
	}

	public ResponseCookie accessTokenCookie(TokenResult token) {
		return tokenCookie(
				properties.cookie().accessTokenName(),
				token.token(),
				properties.cookie().accessTokenMaxAgeSeconds());
	}

	public ResponseCookie refreshTokenCookie(TokenResult token) {
		return tokenCookie(
				properties.cookie().refreshTokenName(),
				token.token(),
				properties.cookie().refreshTokenMaxAgeSeconds());
	}

	public ResponseCookie deleteAccessTokenCookie() {
		return deleteCookie(properties.cookie().accessTokenName());
	}

	public ResponseCookie deleteRefreshTokenCookie() {
		return deleteCookie(properties.cookie().refreshTokenName());
	}

	public Optional<String> extractAccessToken(HttpServletRequest request) {
		return extractCookieValue(request, properties.cookie().accessTokenName());
	}

	public Optional<String> extractRefreshToken(HttpServletRequest request) {
		return extractCookieValue(request, properties.cookie().refreshTokenName());
	}

	private ResponseCookie tokenCookie(String name, String value, long maxAgeSeconds) {
		return ResponseCookie.from(name, value)
				.httpOnly(properties.cookie().httpOnly())
				.secure(properties.cookie().secure())
				.sameSite(properties.cookie().sameSite())
				.path(properties.cookie().path())
				.maxAge(Duration.ofSeconds(maxAgeSeconds))
				.build();
	}

	private ResponseCookie deleteCookie(String name) {
		return ResponseCookie.from(name, "")
				.httpOnly(properties.cookie().httpOnly())
				.secure(properties.cookie().secure())
				.sameSite(properties.cookie().sameSite())
				.path(properties.cookie().path())
				.maxAge(Duration.ZERO)
				.build();
	}

	private Optional<String> extractCookieValue(HttpServletRequest request, String name) {
		if (request.getCookies() == null) {
			return Optional.empty();
		}

		return Arrays.stream(request.getCookies())
				.filter(cookie -> name.equals(cookie.getName()))
				.map(Cookie::getValue)
				.filter(value -> !value.isBlank())
				.findFirst();
	}
}

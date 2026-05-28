package com.localbizradar.api.security.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.localbizradar.api.security.dto.AdminUserResponse;
import com.localbizradar.api.security.dto.AuthResponse;
import com.localbizradar.api.security.dto.LoginRequest;
import com.localbizradar.api.security.dto.LogoutResponse;
import com.localbizradar.api.security.service.AuthCookieService;
import com.localbizradar.api.security.service.AuthException;
import com.localbizradar.api.security.service.AuthService;
import com.localbizradar.api.security.service.AuthSession;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "관리자 HttpOnly Cookie 인증 API")
@Validated
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final AuthCookieService authCookieService;

	public AuthController(AuthService authService, AuthCookieService authCookieService) {
		this.authService = authService;
		this.authCookieService = authCookieService;
	}

	@Operation(
			summary = "관리자 로그인",
			description = "관리자 계정을 검증하고 accessToken/refreshToken을 HttpOnly Cookie로 설정합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "로그인 성공"),
					@ApiResponse(responseCode = "401", description = "로그인 실패")
			}
	)
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(
			@Valid @RequestBody LoginRequest request,
			HttpServletRequest httpRequest
	) {
		return withTokenCookies(authService.login(request, httpRequest));
	}

	@Operation(summary = "토큰 재발급")
	@PostMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
		String refreshToken = authCookieService.extractRefreshToken(request)
				.orElseThrow(() -> new AuthException("다시 로그인이 필요합니다."));
		return withTokenCookies(authService.refresh(refreshToken, request));
	}

	@Operation(summary = "현재 관리자 조회")
	@GetMapping("/me")
	public AdminUserResponse me(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new AuthException("로그인이 필요합니다.");
		}
		return authService.currentAdmin(authentication.getName());
	}

	@Operation(summary = "관리자 로그아웃")
	@PostMapping("/logout")
	public ResponseEntity<LogoutResponse> logout(HttpServletRequest request) {
		authCookieService.extractRefreshToken(request)
				.ifPresent(authService::logout);
		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE, authCookieService.deleteAccessTokenCookie().toString())
				.header(HttpHeaders.SET_COOKIE, authCookieService.deleteRefreshTokenCookie().toString())
				.body(new LogoutResponse("로그아웃되었습니다."));
	}

	private ResponseEntity<AuthResponse> withTokenCookies(AuthSession session) {
		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE, authCookieService.accessTokenCookie(session.accessToken()).toString())
				.header(HttpHeaders.SET_COOKIE, authCookieService.refreshTokenCookie(session.refreshToken()).toString())
				.body(session.response());
	}
}

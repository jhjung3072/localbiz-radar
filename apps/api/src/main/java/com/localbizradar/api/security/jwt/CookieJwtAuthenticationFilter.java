package com.localbizradar.api.security.jwt;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.localbizradar.api.security.service.AuthCookieService;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@ConditionalOnBean(AuthCookieService.class)
public class CookieJwtAuthenticationFilter extends OncePerRequestFilter {

	private final AuthCookieService authCookieService;
	private final JwtTokenService jwtTokenService;

	public CookieJwtAuthenticationFilter(
			AuthCookieService authCookieService,
			JwtTokenService jwtTokenService
	) {
		this.authCookieService = authCookieService;
		this.jwtTokenService = jwtTokenService;
	}

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain
	) throws ServletException, IOException {
		authCookieService.extractAccessToken(request).ifPresent(token -> authenticate(token, request));
		filterChain.doFilter(request, response);
	}

	private void authenticate(String token, HttpServletRequest request) {
		try {
			TokenClaims claims = jwtTokenService.validateAccessToken(token);
			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
					claims.username(),
					null,
					List.of(new SimpleGrantedAuthority("ROLE_" + claims.role())));
			SecurityContextHolder.getContext().setAuthentication(authentication);
		} catch (JwtException exception) {
			SecurityContextHolder.clearContext();
			request.setAttribute("localbiz.auth.error", exception.getClass().getSimpleName());
		}
	}
}

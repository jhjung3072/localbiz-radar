package com.localbizradar.api.security.dto;

public record AuthResponse(
		AdminUserResponse user,
		long accessTokenExpiresIn,
		long refreshTokenExpiresIn
) {
}

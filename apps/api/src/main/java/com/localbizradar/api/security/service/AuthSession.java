package com.localbizradar.api.security.service;

import com.localbizradar.api.security.dto.AuthResponse;
import com.localbizradar.api.security.jwt.TokenResult;

public record AuthSession(
		AuthResponse response,
		TokenResult accessToken,
		TokenResult refreshToken
) {
}

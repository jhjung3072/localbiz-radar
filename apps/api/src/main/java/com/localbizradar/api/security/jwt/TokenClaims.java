package com.localbizradar.api.security.jwt;

import java.time.Instant;

public record TokenClaims(
		String username,
		String role,
		String tokenId,
		Instant issuedAt,
		Instant expiresAt
) {
}

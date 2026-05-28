package com.localbizradar.api.security.jwt;

import java.time.Instant;

public record TokenResult(
		String token,
		String tokenId,
		Instant issuedAt,
		Instant expiresAt,
		long expiresInSeconds
) {
}

package com.localbizradar.api.security.dto;

public record AdminUserResponse(
		String username,
		String displayName,
		String role
) {
}

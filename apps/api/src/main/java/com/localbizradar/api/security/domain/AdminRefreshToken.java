package com.localbizradar.api.security.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_refresh_tokens")
public class AdminRefreshToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "token_id", nullable = false, unique = true, length = 80)
	private String tokenId;

	@Column(nullable = false, length = 80)
	private String username;

	@Column(name = "token_hash", nullable = false, length = 120)
	private String tokenHash;

	@Column(name = "issued_at", nullable = false)
	private LocalDateTime issuedAt;

	@Column(name = "expires_at", nullable = false)
	private LocalDateTime expiresAt;

	@Column(name = "revoked_at")
	private LocalDateTime revokedAt;

	@Column(name = "replaced_by_token_id", length = 80)
	private String replacedByTokenId;

	@Column(name = "user_agent", length = 500)
	private String userAgent;

	@Column(name = "ip_address", length = 80)
	private String ipAddress;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	protected AdminRefreshToken() {
	}

	public static AdminRefreshToken issue(
			String tokenId,
			String username,
			String tokenHash,
			LocalDateTime issuedAt,
			LocalDateTime expiresAt,
			String userAgent,
			String ipAddress
	) {
		AdminRefreshToken refreshToken = new AdminRefreshToken();
		refreshToken.tokenId = tokenId;
		refreshToken.username = username;
		refreshToken.tokenHash = tokenHash;
		refreshToken.issuedAt = issuedAt;
		refreshToken.expiresAt = expiresAt;
		refreshToken.userAgent = userAgent;
		refreshToken.ipAddress = ipAddress;
		refreshToken.createdAt = issuedAt;
		refreshToken.updatedAt = issuedAt;
		return refreshToken;
	}

	public void revoke(String replacedByTokenId, LocalDateTime revokedAt) {
		this.revokedAt = revokedAt;
		this.replacedByTokenId = replacedByTokenId;
		this.updatedAt = revokedAt;
	}

	public boolean isRevoked() {
		return revokedAt != null;
	}

	public boolean isExpired(LocalDateTime now) {
		return !expiresAt.isAfter(now);
	}

	public Long getId() {
		return id;
	}

	public String getTokenId() {
		return tokenId;
	}

	public String getUsername() {
		return username;
	}

	public String getTokenHash() {
		return tokenHash;
	}

	public LocalDateTime getIssuedAt() {
		return issuedAt;
	}

	public LocalDateTime getExpiresAt() {
		return expiresAt;
	}

	public LocalDateTime getRevokedAt() {
		return revokedAt;
	}

	public String getReplacedByTokenId() {
		return replacedByTokenId;
	}

	public String getUserAgent() {
		return userAgent;
	}

	public String getIpAddress() {
		return ipAddress;
	}
}

package com.localbizradar.api.security.repository;

import java.util.Optional;

import com.localbizradar.api.security.domain.AdminRefreshToken;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRefreshTokenRepository extends JpaRepository<AdminRefreshToken, Long> {

	Optional<AdminRefreshToken> findByTokenId(String tokenId);

	Optional<AdminRefreshToken> findFirstByUsernameOrderByIssuedAtDesc(String username);
}

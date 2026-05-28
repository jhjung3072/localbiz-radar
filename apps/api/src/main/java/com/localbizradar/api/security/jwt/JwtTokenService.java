package com.localbizradar.api.security.jwt;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import com.localbizradar.api.security.properties.LocalBizSecurityProperties;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

	private static final String ROLE_ADMIN = "ADMIN";
	private static final String TOKEN_TYPE_CLAIM = "tokenType";
	private static final String ROLE_CLAIM = "role";

	private final LocalBizSecurityProperties properties;
	private final JwtEncoder accessTokenEncoder;
	private final JwtEncoder refreshTokenEncoder;
	private final JwtDecoder accessTokenDecoder;
	private final JwtDecoder refreshTokenDecoder;

	public JwtTokenService(LocalBizSecurityProperties properties) {
		this.properties = properties;
		SecretKey accessSecretKey = secretKey(properties.jwt().accessTokenSecret());
		SecretKey refreshSecretKey = secretKey(properties.jwt().refreshTokenSecret());
		this.accessTokenEncoder = new NimbusJwtEncoder(new ImmutableSecret<>(accessSecretKey));
		this.refreshTokenEncoder = new NimbusJwtEncoder(new ImmutableSecret<>(refreshSecretKey));
		this.accessTokenDecoder = NimbusJwtDecoder
				.withSecretKey(accessSecretKey)
				.macAlgorithm(MacAlgorithm.HS256)
				.build();
		this.refreshTokenDecoder = NimbusJwtDecoder
				.withSecretKey(refreshSecretKey)
				.macAlgorithm(MacAlgorithm.HS256)
				.build();
	}

	public TokenResult createAccessToken(String username) {
		return createToken(
				accessTokenEncoder,
				username,
				JwtTokenType.ACCESS,
				Duration.ofMinutes(properties.jwt().accessTokenValidMinutes()));
	}

	public TokenResult createRefreshToken(String username) {
		return createToken(
				refreshTokenEncoder,
				username,
				JwtTokenType.REFRESH,
				Duration.ofDays(properties.jwt().refreshTokenValidDays()));
	}

	public TokenClaims validateAccessToken(String token) {
		return validateToken(accessTokenDecoder, token, JwtTokenType.ACCESS);
	}

	public TokenClaims validateRefreshToken(String token) {
		return validateToken(refreshTokenDecoder, token, JwtTokenType.REFRESH);
	}

	private TokenResult createToken(
			JwtEncoder encoder,
			String username,
			JwtTokenType tokenType,
			Duration ttl
	) {
		Instant issuedAt = Instant.now();
		Instant expiresAt = issuedAt.plus(ttl);
		String tokenId = UUID.randomUUID().toString();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(properties.jwt().issuer())
				.subject(username)
				.id(tokenId)
				.issuedAt(issuedAt)
				.expiresAt(expiresAt)
				.claim(ROLE_CLAIM, ROLE_ADMIN)
				.claim(TOKEN_TYPE_CLAIM, tokenType.name())
				.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
		return new TokenResult(token, tokenId, issuedAt, expiresAt, ttl.toSeconds());
	}

	private TokenClaims validateToken(JwtDecoder decoder, String token, JwtTokenType expectedType) {
		Jwt jwt = decoder.decode(token);
		if (!properties.jwt().issuer().equals(jwt.getClaimAsString("iss"))) {
			throw new JwtException("Invalid issuer");
		}
		if (!expectedType.name().equals(jwt.getClaimAsString(TOKEN_TYPE_CLAIM))) {
			throw new JwtException("Invalid token type");
		}
		return new TokenClaims(
				jwt.getSubject(),
				jwt.getClaimAsString(ROLE_CLAIM),
				jwt.getId(),
				jwt.getIssuedAt(),
				jwt.getExpiresAt());
	}

	private SecretKey secretKey(String secret) {
		return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
	}
}

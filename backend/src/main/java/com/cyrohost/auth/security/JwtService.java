package com.cyrohost.auth.security;

import com.cyrohost.auth.config.AuthProperties;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final AuthProperties properties;
    private final byte[] secret;

    public JwtService(AuthProperties properties) {
        this.properties = properties;
        this.secret = properties.jwtSecret().getBytes(StandardCharsets.UTF_8);
    }

    public String issue(UUID userId, UUID sessionId, String role, Instant expiresAt) {
        String authority = "ADMIN".equals(role) ? "ADMIN" : "USER";
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(properties.issuer())
                .subject(userId.toString())
                .claim("sid", sessionId.toString())
                .claim("role", authority)
                .jwtID(UUID.randomUUID().toString())
                .issueTime(Date.from(Instant.now()))
                .expirationTime(Date.from(expiresAt))
                .build();
        try {
            SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            jwt.sign(new MACSigner(secret));
            return jwt.serialize();
        } catch (JOSEException exception) {
            throw new IllegalStateException("Could not sign the access token.", exception);
        }
    }

    public AccessClaims parse(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            if (!JWSAlgorithm.HS256.equals(jwt.getHeader().getAlgorithm()) || !jwt.verify(new MACVerifier(secret))) {
                throw new IllegalArgumentException("signature");
            }
            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            if (!properties.issuer().equals(claims.getIssuer())) {
                throw new IllegalArgumentException("issuer");
            }
            Date expiration = claims.getExpirationTime();
            if (expiration == null || expiration.toInstant().isBefore(Instant.now().minusSeconds(30))) {
                throw new IllegalArgumentException("expired");
            }
            return new AccessClaims(UUID.fromString(claims.getSubject()), UUID.fromString(claims.getStringClaim("sid")));
        } catch (ParseException | JOSEException | IllegalArgumentException exception) {
            throw new IllegalArgumentException("invalid access token");
        }
    }

    public record AccessClaims(UUID userId, UUID sessionId) {
    }
}

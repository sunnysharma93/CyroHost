package com.cyrohost.auth.security;

import com.cyrohost.auth.dto.AuthDtos.UserResponse;

import java.time.Instant;
import java.util.UUID;

public record IssuedSession(
        UserResponse user,
        UUID sessionId,
        String accessToken,
        String refreshToken,
        Instant refreshExpiresAt
) {
}

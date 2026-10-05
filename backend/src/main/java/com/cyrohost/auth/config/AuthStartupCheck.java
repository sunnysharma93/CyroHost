package com.cyrohost.auth.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class AuthStartupCheck {

    private static final Logger log = LoggerFactory.getLogger(AuthStartupCheck.class);

    private final AuthProperties properties;

    public AuthStartupCheck(AuthProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void requireSecret() {
        String secret = properties.jwtSecret();
        if (secret == null || secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be set to at least 32 bytes.");
        }
        if (properties.frontendOrigin() == null || properties.frontendOrigin().isBlank()) {
            throw new IllegalStateException("FRONTEND_ORIGIN must be set.");
        }
        if (properties.frontendOrigin().startsWith("https://") && !properties.cookieSecure()) {
            log.warn("FRONTEND_ORIGIN is HTTPS while COOKIE_SECURE is false. Session cookies will not be marked Secure.");
        }
    }
}

package com.cyrohost.auth.security;

import com.cyrohost.auth.config.AuthProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
public class AuthCookies {

    public static final String ACCESS = "cyro_access";
    public static final String REFRESH = "cyro_refresh";
    public static final String CSRF = "cyro_csrf";
    public static final String OAUTH_STATE = "cyro_oauth_state";
    public static final String OAUTH_NONCE = "cyro_oauth_nonce";
    public static final String OAUTH_VERIFIER = "cyro_oauth_verifier";
    public static final String ACCOUNT = "cyro_account";

    private final AuthProperties properties;

    public AuthCookies(AuthProperties properties) {
        this.properties = properties;
    }

    public void writeSession(HttpServletResponse response, IssuedSession session) {
        write(response, ACCESS, session.accessToken(), Duration.ofMinutes(properties.accessTokenMinutes()), "/", true);
        write(response, REFRESH, session.refreshToken(), Duration.between(Instant.now(), session.refreshExpiresAt()), "/api/auth", true);
    }

    public void clearSession(HttpServletResponse response) {
        write(response, ACCESS, "", Duration.ZERO, "/", true);
        write(response, REFRESH, "", Duration.ZERO, "/api/auth", true);
        write(response, ACCOUNT, "", Duration.ZERO, "/", true);
    }

    public void writeCsrf(HttpServletResponse response, String token) {
        write(response, CSRF, token, Duration.ofHours(8), "/", true);
    }

    public void writeOAuth(HttpServletResponse response, String state, String nonce, String verifier) {
        Duration life = Duration.ofMinutes(10);
        write(response, OAUTH_STATE, state, life, "/api/auth", true);
        write(response, OAUTH_NONCE, nonce, life, "/api/auth", true);
        write(response, OAUTH_VERIFIER, verifier, life, "/api/auth", true);
    }

    public void clearOAuth(HttpServletResponse response) {
        write(response, OAUTH_STATE, "", Duration.ZERO, "/api/auth", true);
        write(response, OAUTH_NONCE, "", Duration.ZERO, "/api/auth", true);
        write(response, OAUTH_VERIFIER, "", Duration.ZERO, "/api/auth", true);
    }

    public void writeAccount(HttpServletResponse response, String accountId) {
        write(response, ACCOUNT, accountId, Duration.ofDays(30), "/", true);
    }

    public void clearAccount(HttpServletResponse response) {
        write(response, ACCOUNT, "", Duration.ZERO, "/", true);
    }

    public String read(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void write(HttpServletResponse response, String name, String value, Duration maxAge, String path, boolean httpOnly) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(properties.cookieSecure())
                .sameSite("Lax")
                .path(path)
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}

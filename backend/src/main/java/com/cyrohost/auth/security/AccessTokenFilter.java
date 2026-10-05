package com.cyrohost.auth.security;

import com.cyrohost.auth.entity.AccountStatus;
import com.cyrohost.auth.repository.RefreshSessionRepository;
import com.cyrohost.auth.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

public class AccessTokenFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AuthCookies cookies;
    private final RefreshSessionRepository sessions;
    private final UserRepository users;

    public AccessTokenFilter(
            JwtService jwtService,
            AuthCookies cookies,
            RefreshSessionRepository sessions,
            UserRepository users
    ) {
        this.jwtService = jwtService;
        this.cookies = cookies;
        this.sessions = sessions;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = cookies.read(request, AuthCookies.ACCESS);
        if (token != null) {
            try {
                JwtService.AccessClaims claims = jwtService.parse(token);
                var session = sessions.findById(claims.sessionId()).orElse(null);
                var user = users.findById(claims.userId()).orElse(null);
                boolean live = session != null
                        && session.getRevokedAt() == null
                        && session.getExpiresAt().isAfter(Instant.now())
                        && session.getUserId().equals(claims.userId())
                        && user != null
                        && user.getStatus() == AccountStatus.ACTIVE;
                if (live) {
                    String role = "ADMIN".equals(user.getPlatformRole()) ? "ROLE_ADMIN" : "ROLE_USER";
                    var authentication = new UsernamePasswordAuthenticationToken(
                            claims.userId(),
                            null,
                            List.of(new SimpleGrantedAuthority(role))
                    );
                    authentication.setDetails(claims.sessionId());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (IllegalArgumentException ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}

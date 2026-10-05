package com.cyrohost.console.security;

import com.cyrohost.console.entity.ApiToken;
import com.cyrohost.console.repository.AccountMemberRepository;
import com.cyrohost.console.repository.ApiTokenRepository;
import com.cyrohost.auth.security.TokenHasher;
import com.cyrohost.console.security.AccountGuard.TokenContext;
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

public class ApiTokenFilter extends OncePerRequestFilter {

    private final ApiTokenRepository tokens;
    private final AccountMemberRepository members;

    public ApiTokenFilter(ApiTokenRepository tokens, AccountMemberRepository members) {
        this.tokens = tokens;
        this.members = members;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer cyro_")) {
                String raw = header.substring("Bearer ".length()).trim();
                ApiToken token = tokens.findByTokenHash(TokenHasher.sha256(raw)).orElse(null);
                boolean live = token != null
                        && token.getRevokedAt() == null
                        && (token.getExpiresAt() == null || token.getExpiresAt().isAfter(Instant.now()))
                        && members.findByAccountIdAndUserIdAndStatus(token.getAccountId(), token.getCreatedBy(), "ACTIVE").isPresent();
                if (live) {
                    var authentication = new UsernamePasswordAuthenticationToken(
                            token.getCreatedBy(),
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );
                    authentication.setDetails(new TokenContext(token.getAccountId(), token.getScopes()));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}

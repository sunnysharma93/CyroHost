package com.cyrohost.auth.security;

import com.cyrohost.auth.dto.ErrorBody;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class CsrfCookieFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-CSRF-Token";

    private final AuthCookies cookies;
    private final ObjectMapper json;

    public CsrfCookieFilter(AuthCookies cookies, ObjectMapper json) {
        this.cookies = cookies;
        this.json = json;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String method = request.getMethod();
        String authorization = request.getHeader("Authorization");
        if ("GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method)
                || (authorization != null && authorization.startsWith("Bearer "))) {
            filterChain.doFilter(request, response);
            return;
        }
        String cookie = cookies.read(request, AuthCookies.CSRF);
        String header = request.getHeader(HEADER);
        if (!TokenHasher.equals(cookie, header)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            json.writeValue(response.getWriter(), new ErrorBody("csrf_failed", "Refresh the page and try again."));
            return;
        }
        filterChain.doFilter(request, response);
    }
}

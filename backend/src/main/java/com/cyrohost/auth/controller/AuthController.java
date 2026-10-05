package com.cyrohost.auth.controller;

import com.cyrohost.auth.config.AuthProperties;
import com.cyrohost.auth.config.OAuthProperties;
import com.cyrohost.auth.dto.AuthDtos.CsrfResponse;
import com.cyrohost.auth.dto.AuthDtos.ForgotPasswordRequest;
import com.cyrohost.auth.dto.AuthDtos.ForgotResponse;
import com.cyrohost.auth.dto.AuthDtos.LoginRequest;
import com.cyrohost.auth.dto.AuthDtos.MessageResponse;
import com.cyrohost.auth.dto.AuthDtos.ProviderStatus;
import com.cyrohost.auth.dto.AuthDtos.RegisterRequest;
import com.cyrohost.auth.dto.AuthDtos.ResetPasswordRequest;
import com.cyrohost.auth.dto.AuthDtos.UserResponse;
import com.cyrohost.auth.security.AuthCookies;
import com.cyrohost.auth.security.IssuedSession;
import com.cyrohost.auth.security.LoginRateLimiter;
import com.cyrohost.auth.security.TokenHasher;
import com.cyrohost.auth.service.AuthService;
import com.cyrohost.auth.service.OAuthService;
import com.cyrohost.auth.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.util.UUID;

@RestController
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService resets;
    private final OAuthService oauthService;
    private final AuthCookies cookies;
    private final AuthProperties properties;
    private final OAuthProperties oauth;
    private final LoginRateLimiter rateLimiter;

    public AuthController(
            AuthService authService,
            PasswordResetService resets,
            OAuthService oauthService,
            AuthCookies cookies,
            AuthProperties properties,
            OAuthProperties oauth,
            LoginRateLimiter rateLimiter
    ) {
        this.authService = authService;
        this.resets = resets;
        this.oauthService = oauthService;
        this.cookies = cookies;
        this.properties = properties;
        this.oauth = oauth;
        this.rateLimiter = rateLimiter;
    }

    @GetMapping("/api/auth/csrf")
    public CsrfResponse csrf(HttpServletRequest request, HttpServletResponse response) {
        String current = cookies.read(request, AuthCookies.CSRF);
        if (current == null || current.length() < 20) {
            current = TokenHasher.random();
            cookies.writeCsrf(response, current);
        }
        return new CsrfResponse(current);
    }

    @PostMapping("/api/auth/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest http, HttpServletResponse response) {
        rateLimiter.consume(http.getRemoteAddr(), "register", 12);
        IssuedSession session = authService.register(request, http.getRemoteAddr(), http.getHeader("User-Agent"));
        cookies.writeSession(response, session);
        return ResponseEntity.status(HttpStatus.CREATED).body(session.user());
    }

    @PostMapping("/api/auth/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest http, HttpServletResponse response) {
        rateLimiter.check(http.getRemoteAddr(), request.email());
        try {
            IssuedSession session = authService.login(request, http.getRemoteAddr(), http.getHeader("User-Agent"));
            cookies.writeSession(response, session);
            return session.user();
        } catch (RuntimeException exception) {
            if (exception instanceof com.cyrohost.auth.exception.ApiException api && "invalid_credentials".equals(api.getCode())) {
                rateLimiter.recordFailure(http.getRemoteAddr(), request.email());
            }
            throw exception;
        }
    }

    @PostMapping("/api/auth/refresh")
    public UserResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        IssuedSession session = authService.refresh(cookies.read(request, AuthCookies.REFRESH));
        cookies.writeSession(response, session);
        return session.user();
    }

    @PostMapping("/api/auth/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(cookies.read(request, AuthCookies.REFRESH), request.getRemoteAddr());
        cookies.clearSession(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/auth/me")
    public UserResponse me(Authentication authentication) {
        return authService.me((UUID) authentication.getPrincipal());
    }

    @PostMapping("/api/auth/forgot-password")
    public ForgotResponse forgot(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest http) {
        rateLimiter.consume(http.getRemoteAddr(), "forgot", 8);
        String raw = resets.request(request.email());
        return new ForgotResponse(PasswordResetService.PUBLIC_MESSAGE, TokenHasher.exposedDevToken(properties.exposeDevResetToken(), raw));
    }

    @PostMapping("/api/auth/reset-password")
    public MessageResponse reset(@Valid @RequestBody ResetPasswordRequest request) {
        resets.reset(request);
        return new MessageResponse(PasswordResetService.UPDATED_MESSAGE);
    }

    @GetMapping("/api/auth/oauth/providers")
    public ProviderStatus providers() {
        return new ProviderStatus(oauth.configured("google"), oauth.configured("facebook"), oauth.configured("apple"));
    }

    @GetMapping("/api/auth/oauth/{provider}/start")
    public RedirectView start(@PathVariable String provider, HttpServletResponse response) {
        return redirect(oauthService.start(provider.toLowerCase(), response));
    }

    @GetMapping("/api/auth/oauth/{provider}/callback")
    public RedirectView callback(
            @PathVariable String provider,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(name = "error", required = false) String providerError,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return redirect(oauthService.callback(provider.toLowerCase(), code, state, providerError, request, response));
    }

    private static RedirectView redirect(String url) {
        RedirectView view = new RedirectView(url);
        view.setExposeModelAttributes(false);
        return view;
    }
}

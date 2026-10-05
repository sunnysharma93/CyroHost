package com.cyrohost.auth.service;

import com.cyrohost.auth.config.AuthProperties;
import com.cyrohost.auth.dto.AuthDtos.ResetPasswordRequest;
import com.cyrohost.auth.entity.AccountStatus;
import com.cyrohost.auth.entity.PasswordResetToken;
import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.auth.exception.ApiException;
import com.cyrohost.auth.repository.PasswordResetTokenRepository;
import com.cyrohost.auth.repository.RefreshSessionRepository;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.security.Emails;
import com.cyrohost.auth.security.Passwords;
import com.cyrohost.auth.security.TokenHasher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class PasswordResetService {

    public static final String PUBLIC_MESSAGE = "If an account exists for that email, reset instructions will be sent.";
    public static final String UPDATED_MESSAGE = "Password updated. Sign in with the new password.";

    private final UserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final RefreshSessionRepository sessions;
    private final PasswordEncoder encoder;
    private final MailService mail;
    private final AuthProperties properties;

    public PasswordResetService(
            UserRepository users,
            PasswordResetTokenRepository tokens,
            RefreshSessionRepository sessions,
            PasswordEncoder encoder,
            MailService mail,
            AuthProperties properties
    ) {
        this.users = users;
        this.tokens = tokens;
        this.sessions = sessions;
        this.encoder = encoder;
        this.mail = mail;
        this.properties = properties;
    }

    @Transactional
    public String request(String email) {
        UserAccount user = users.findByEmail(Emails.normalize(email)).orElse(null);
        if (user == null || user.getStatus() != AccountStatus.ACTIVE || user.getPasswordHash() == null) {
            return null;
        }
        String raw = TokenHasher.random();
        PasswordResetToken token = new PasswordResetToken();
        token.setId(UUID.randomUUID());
        token.setUserId(user.getId());
        token.setTokenHash(TokenHasher.sha256(raw));
        token.setExpiresAt(Instant.now().plus(properties.resetMinutes(), ChronoUnit.MINUTES));
        tokens.save(token);
        mail.sendReset(user.getEmail(), raw);
        return raw;
    }

    @Transactional
    public void reset(ResetPasswordRequest request) {
        PasswordResetToken token = tokens.findByTokenHash(TokenHasher.sha256(request.token())).orElseThrow(this::invalid);
        if (token.getUsedAt() != null || !token.getExpiresAt().isAfter(Instant.now())) {
            throw invalid();
        }
        UserAccount user = users.findById(token.getUserId()).orElseThrow(this::invalid);
        Passwords.check(request.password(), request.confirmPassword(), user.getEmail());
        user.setPasswordHash(encoder.encode(request.password()));
        token.setUsedAt(Instant.now());
        sessions.revokeActiveForUser(user.getId(), Instant.now());
    }

    private ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "invalid_reset", "This reset link is invalid or has expired.");
    }
}

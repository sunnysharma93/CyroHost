package com.cyrohost.auth.service;

import com.cyrohost.auth.config.AuthProperties;
import com.cyrohost.auth.dto.AuthDtos.LoginRequest;
import com.cyrohost.auth.dto.AuthDtos.RegisterRequest;
import com.cyrohost.auth.dto.AuthDtos.UserResponse;
import com.cyrohost.auth.entity.AccountStatus;
import com.cyrohost.auth.entity.RefreshSession;
import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.auth.exception.ApiException;
import com.cyrohost.auth.exception.FieldValidationException;
import com.cyrohost.auth.repository.RefreshSessionRepository;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.security.Emails;
import com.cyrohost.auth.security.IssuedSession;
import com.cyrohost.auth.security.JwtService;
import com.cyrohost.auth.security.Passwords;
import com.cyrohost.auth.security.TokenHasher;
import com.cyrohost.console.service.AccountProvisioner;
import com.cyrohost.console.service.AuditRecorder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    public static final String INVALID_CREDENTIALS = "Email or password is incorrect.";

    private final UserRepository users;
    private final RefreshSessionRepository sessions;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final AuthProperties properties;
    private final SessionRevoker revoker;
    private final AccountProvisioner accounts;
    private final AuditRecorder audit;
    private final AdminNotifier notices;
    private final String dummyHash;

    public AuthService(
            UserRepository users,
            RefreshSessionRepository sessions,
            PasswordEncoder encoder,
            JwtService jwt,
            AuthProperties properties,
            SessionRevoker revoker,
            AccountProvisioner accounts,
            AuditRecorder audit,
            AdminNotifier notices
    ) {
        this.users = users;
        this.sessions = sessions;
        this.encoder = encoder;
        this.jwt = jwt;
        this.properties = properties;
        this.revoker = revoker;
        this.accounts = accounts;
        this.audit = audit;
        this.notices = notices;
        this.dummyHash = encoder.encode("dummy-password-not-a-credential");
    }

    @Transactional
    public IssuedSession register(RegisterRequest request, String ip, String userAgent) {
        String email = Emails.normalize(request.email());
        String name = request.fullName().trim().replaceAll("\\s+", " ");
        if (name.length() < 2 || name.length() > 80) {
            throw new FieldValidationException(Map.of("fullName", "Enter your full name."));
        }
        if (!Boolean.TRUE.equals(request.acceptedTerms())) {
            throw new FieldValidationException(Map.of("acceptedTerms", "Accept the Terms and Privacy Policy to create an account."));
        }
        Passwords.check(request.password(), request.confirmPassword(), email);
        if (users.existsByEmail(email)) {
            throw taken();
        }
        UserAccount user = new UserAccount();
        user.setId(UUID.randomUUID());
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(request.password()));
        user.setStatus(AccountStatus.ACTIVE);
        user.setPlatformRole("USER");
        try {
            users.saveAndFlush(user);
            accounts.ensure(user);
            audit.record(user.getId(), user.getId(), "register", "account", user.getId().toString(), "email", ip, userAgent);
        } catch (DataIntegrityViolationException exception) {
            throw taken();
        }
        String requestId = user.getId().toString();
        notices.registration(user.getFullName(), user.getEmail(), user.getPlatformRole(), "Email", ip, userAgent, requestId);
        return issue(user, false);
    }

    @Transactional
    public IssuedSession login(LoginRequest request, String ip, String userAgent) {
        String email = Emails.normalize(request.email());
        UserAccount user = users.findByEmail(email).orElse(null);
        String hash = user == null || user.getPasswordHash() == null ? dummyHash : user.getPasswordHash();
        boolean matches = encoder.matches(request.password(), hash);
        if (user == null || user.getPasswordHash() == null || !matches || user.getStatus() != AccountStatus.ACTIVE) {
            String requestId = UUID.randomUUID().toString();
            String attempted = email.length() > 80 ? email.substring(0, 80) : email;
            audit.recordSeparate(null, null, "failed_login", "session", attempted, "invalid_credentials", ip, userAgent);
            notices.failedLogin(email, ip, userAgent, "invalid_credentials", requestId);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "invalid_credentials", INVALID_CREDENTIALS);
        }
        accounts.ensure(user);
        user.setLastLoginAt(Instant.now());
        String role = roleOf(user);
        audit.record(user.getId(), user.getId(), "login", "session", user.getId().toString(), "role=" + role, ip, userAgent);
        notices.login(user.getFullName(), user.getEmail(), role, "Email", ip, userAgent, user.getId().toString());
        return issue(user, Boolean.TRUE.equals(request.rememberMe()));
    }

    @Transactional
    public IssuedSession refresh(String rawRefresh) {
        if (rawRefresh == null || rawRefresh.isBlank()) {
            throw unauthorized();
        }
        RefreshSession session = sessions.findByTokenHashForUpdate(TokenHasher.sha256(rawRefresh)).orElseThrow(this::unauthorized);
        if (session.getRevokedAt() != null) {
            revoker.revokeActive(session.getUserId());
            throw unauthorized();
        }
        if (!session.getExpiresAt().isAfter(Instant.now())) {
            throw unauthorized();
        }
        UserAccount user = users.findById(session.getUserId()).filter(item -> item.getStatus() == AccountStatus.ACTIVE).orElseThrow(this::unauthorized);
        IssuedSession next = issue(user, session.isRememberMe());
        session.setRevokedAt(Instant.now());
        session.setReplacedBy(next.sessionId());
        return next;
    }

    @Transactional
    public void logout(String rawRefresh, String ip) {
        if (rawRefresh == null || rawRefresh.isBlank()) {
            return;
        }
        sessions.findByTokenHash(TokenHasher.sha256(rawRefresh)).ifPresent(session -> {
            if (session.getRevokedAt() == null) {
                session.setRevokedAt(Instant.now());
                audit.record(session.getUserId(), session.getUserId(), "logout", "session", session.getId().toString(), null, ip);
            }
        });
    }

    @Transactional(readOnly = true)
    public UserResponse me(UUID userId) {
        return users.findById(userId)
                .filter(user -> user.getStatus() == AccountStatus.ACTIVE)
                .map(this::toResponse)
                .orElseThrow(this::unauthorized);
    }

    @Transactional
    public IssuedSession issue(UserAccount user, boolean remember) {
        Instant now = Instant.now();
        int days = remember ? properties.rememberDays() : properties.refreshDays();
        RefreshSession session = new RefreshSession();
        session.setId(UUID.randomUUID());
        session.setUserId(user.getId());
        String raw = TokenHasher.random();
        session.setTokenHash(TokenHasher.sha256(raw));
        session.setExpiresAt(now.plus(days, ChronoUnit.DAYS));
        session.setRememberMe(remember);
        sessions.save(session);
        Instant accessExpiry = now.plus(properties.accessTokenMinutes(), ChronoUnit.MINUTES);
        String access = jwt.issue(user.getId(), session.getId(), roleOf(user), accessExpiry);
        return new IssuedSession(toResponse(user), session.getId(), access, raw, session.getExpiresAt());
    }

    private RefreshSession currentSession(String rawRefresh) {
        if (rawRefresh == null || rawRefresh.isBlank()) {
            throw unauthorized();
        }
        return sessions.findByTokenHash(TokenHasher.sha256(rawRefresh)).orElseThrow(this::unauthorized);
    }

    private UserResponse toResponse(UserAccount user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getStatus().name(), roleOf(user));
    }

    private static String roleOf(UserAccount user) {
        return "ADMIN".equals(user.getPlatformRole()) ? "ADMIN" : "USER";
    }

    private ApiException taken() {
        return new ApiException(HttpStatus.CONFLICT, "email_taken", "An account with this email already exists.");
    }

    private ApiException unauthorized() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "invalid_credentials", "Sign in to continue.");
    }
}

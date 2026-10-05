package com.cyrohost.auth.service;

import com.cyrohost.auth.config.AuthProperties;
import com.cyrohost.auth.config.OAuthProperties;
import com.cyrohost.auth.entity.AccountStatus;
import com.cyrohost.auth.entity.IdentityAccount;
import com.cyrohost.auth.entity.OAuthTransaction;
import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.auth.exception.ApiException;
import com.cyrohost.auth.repository.IdentityAccountRepository;
import com.cyrohost.auth.repository.OAuthTransactionRepository;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.security.AuthCookies;
import com.cyrohost.auth.security.Emails;
import com.cyrohost.auth.security.IssuedSession;
import com.cyrohost.auth.security.TokenHasher;
import com.cyrohost.console.service.AccountProvisioner;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.ECDSASigner;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.interfaces.ECPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuthService {

    private final OAuthProperties oauth;
    private final AuthProperties auth;
    private final OAuthTransactionRepository transactions;
    private final IdentityAccountRepository identities;
    private final UserRepository users;
    private final AuthService authService;
    private final AccountProvisioner accounts;
    private final AdminNotifier notices;
    private final AuthCookies cookies;
    private final ObjectMapper json;
    private final RestClient http;
    private final Map<String, CachedJwks> jwksCache = new ConcurrentHashMap<>();
    private volatile String appleSecret;
    private volatile Instant appleSecretExpiry = Instant.EPOCH;

    public OAuthService(
            OAuthProperties oauth,
            AuthProperties auth,
            OAuthTransactionRepository transactions,
            IdentityAccountRepository identities,
            UserRepository users,
            AuthService authService,
            AccountProvisioner accounts,
            AdminNotifier notices,
            AuthCookies cookies,
            ObjectMapper json,
            RestClient.Builder http
    ) {
        this.oauth = oauth;
        this.auth = auth;
        this.transactions = transactions;
        this.identities = identities;
        this.users = users;
        this.authService = authService;
        this.accounts = accounts;
        this.notices = notices;
        this.cookies = cookies;
        this.json = json;
        this.http = http.build();
    }

    @Transactional
    public String start(String provider, HttpServletResponse response) {
        if (!oauth.configured(provider)) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "oauth_not_configured", providerLabel(provider) + " login setup is pending.");
        }
        String state = TokenHasher.random();
        String nonce = TokenHasher.random();
        String verifier = TokenHasher.random();
        OAuthTransaction transaction = new OAuthTransaction();
        transaction.setId(UUID.randomUUID());
        transaction.setProvider(provider);
        transaction.setStateHash(TokenHasher.sha256(state));
        transaction.setNonceHash(TokenHasher.sha256(nonce));
        transaction.setVerifierHash(TokenHasher.sha256(verifier));
        transaction.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        transactions.save(transaction);
        cookies.writeOAuth(response, state, nonce, verifier);
        return authorizationUrl(provider, state, nonce, challenge(verifier));
    }

    @Transactional
    public String callback(String provider, String code, String state, String providerError, HttpServletRequest request, HttpServletResponse response) {
        try {
            if (providerError != null || code == null || state == null) {
                return failure("provider");
            }
            String cookieState = cookies.read(request, AuthCookies.OAUTH_STATE);
            String nonce = cookies.read(request, AuthCookies.OAUTH_NONCE);
            String verifier = cookies.read(request, AuthCookies.OAUTH_VERIFIER);
            if (!TokenHasher.equals(cookieState, state) || nonce == null || verifier == null) {
                return failure("oauth_state");
            }
            OAuthTransaction transaction = transactions.findByStateHash(TokenHasher.sha256(state)).orElse(null);
            if (transaction == null
                    || transaction.getUsedAt() != null
                    || !transaction.getExpiresAt().isAfter(Instant.now())
                    || !provider.equals(transaction.getProvider())
                    || !TokenHasher.sha256(nonce).equals(transaction.getNonceHash())
                    || !TokenHasher.sha256(verifier).equals(transaction.getVerifierHash())) {
                return failure("oauth_state");
            }
            if (!oauth.configured(provider)) {
                return failure("oauth_not_configured");
            }
            transaction.setUsedAt(Instant.now());
            VerifiedIdentity identity = exchange(provider, code, verifier, nonce);
            Resolved resolved = resolveUser(provider, identity);
            UserAccount user = resolved.user();
            IssuedSession session = authService.issue(user, false);
            cookies.writeSession(response, session);
            String method = provider.substring(0, 1).toUpperCase() + provider.substring(1);
            String ip = request.getRemoteAddr();
            String agent = request.getHeader("User-Agent");
            if (resolved.created()) {
                notices.registration(user.getFullName(), user.getEmail(), "USER", method, ip, agent, user.getId().toString());
            } else {
                user.setLastLoginAt(Instant.now());
                String role = "ADMIN".equals(user.getPlatformRole()) ? "ADMIN" : "USER";
                notices.login(user.getFullName(), user.getEmail(), role, method, ip, agent, user.getId().toString());
            }
            return auth.frontendOrigin() + "/login?oauth=complete";
        } catch (EmailAlreadyRegistered exception) {
            return failure("email_exists");
        } catch (RuntimeException exception) {
            return failure("provider");
        } finally {
            cookies.clearOAuth(response);
        }
    }

    private Resolved resolveUser(String provider, VerifiedIdentity identity) {
        var linked = identities.findByProviderAndProviderSubject(provider, identity.subject());
        if (linked.isPresent()) {
            UserAccount existing = users.findById(linked.get().getUserId())
                    .filter(user -> user.getStatus() == AccountStatus.ACTIVE)
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "invalid_credentials", "Sign in to continue."));
            return new Resolved(existing, false);
        }
        if (identity.email() != null && users.findByEmail(identity.email()).isPresent()) {
            throw new EmailAlreadyRegistered();
        }
        UserAccount user = new UserAccount();
        user.setId(UUID.randomUUID());
        user.setFullName(identity.name());
        user.setEmail(identity.email());
        user.setStatus(AccountStatus.ACTIVE);
        user.setPlatformRole("USER");
        users.save(user);
        IdentityAccount account = new IdentityAccount();
        account.setId(UUID.randomUUID());
        account.setUserId(user.getId());
        account.setProvider(provider);
        account.setProviderSubject(identity.subject());
        account.setEmailAtProvider(identity.email());
        identities.save(account);
        accounts.ensure(user);
        return new Resolved(user, true);
    }

    private record Resolved(UserAccount user, boolean created) {
    }

    private VerifiedIdentity exchange(String provider, String code, String verifier, String nonce) {
        try {
            Spec spec = spec(provider);
            var form = new LinkedMultiValueMap<String, String>();
            form.add("grant_type", "authorization_code");
            form.add("code", code);
            form.add("redirect_uri", redirectUri(provider));
            form.add("client_id", spec.clientId());
            form.add("code_verifier", verifier);
            form.add("client_secret", clientSecret(provider, spec));
            String body = http.post()
                    .uri(spec.token())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(String.class);
            JsonNode parsed = json.readTree(body);
            if (parsed == null || !parsed.hasNonNull("id_token")) {
                throw new IllegalStateException("missing id token");
            }
            return verify(parsed.get("id_token").asText(), spec, nonce);
        } catch (RuntimeException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalStateException("The provider response could not be verified.", exception);
        }
    }

    private VerifiedIdentity verify(String idToken, Spec spec, String nonce) throws Exception {
        SignedJWT jwt = SignedJWT.parse(idToken);
        if (!JWSAlgorithm.RS256.equals(jwt.getHeader().getAlgorithm())) {
            throw new IllegalStateException("algorithm");
        }
        var jwk = jwks(spec).getKeyByKeyId(jwt.getHeader().getKeyID());
        if (jwk == null) {
            throw new IllegalStateException("key");
        }
        RSAKey key = jwk.toRSAKey();
        if (!jwt.verify(new RSASSAVerifier(key))) {
            throw new IllegalStateException("signature");
        }
        JWTClaimsSet claims = jwt.getJWTClaimsSet();
        if (!spec.issuer().equals(claims.getIssuer()) || claims.getAudience() == null || !claims.getAudience().contains(spec.clientId())) {
            throw new IllegalStateException("issuer");
        }
        if (claims.getExpirationTime() == null || claims.getExpirationTime().toInstant().isBefore(Instant.now().minusSeconds(60))) {
            throw new IllegalStateException("expired");
        }
        if (!TokenHasher.equals(nonce, claims.getStringClaim("nonce")) || claims.getSubject() == null || claims.getSubject().isBlank()) {
            throw new IllegalStateException("nonce");
        }
        boolean verified = claimTrue(claims, "email_verified");
        String email = verified ? claims.getStringClaim("email") : null;
        if (email != null) {
            email = Emails.normalize(email);
        }
        String name = claims.getStringClaim("name");
        if (name == null || name.isBlank()) {
            name = "CyroHost member";
        }
        if (name.length() > 80) {
            name = name.substring(0, 80);
        }
        return new VerifiedIdentity(claims.getSubject(), email, name.trim());
    }

    private JWKSet jwks(Spec spec) throws Exception {
        CachedJwks cached = jwksCache.get(spec.jwks());
        if (cached != null && cached.expires().isAfter(Instant.now())) {
            return cached.set();
        }
        String body = http.get().uri(spec.jwks()).retrieve().body(String.class);
        JWKSet set = JWKSet.parse(body);
        jwksCache.put(spec.jwks(), new CachedJwks(set, Instant.now().plus(1, ChronoUnit.HOURS)));
        return set;
    }

    private String authorizationUrl(String provider, String state, String nonce, String challenge) {
        Spec spec = spec(provider);
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(spec.authorization())
                .queryParam("client_id", spec.clientId())
                .queryParam("redirect_uri", redirectUri(provider))
                .queryParam("response_type", "code")
                .queryParam("scope", spec.scope())
                .queryParam("state", state)
                .queryParam("nonce", nonce)
                .queryParam("code_challenge", challenge)
                .queryParam("code_challenge_method", "S256");
        if ("apple".equals(provider)) {
            builder.queryParam("response_mode", "query");
        }
        return builder.build().encode().toUriString();
    }

    private String clientSecret(String provider, Spec spec) throws Exception {
        if (!"apple".equals(provider)) {
            return spec.clientSecret();
        }
        if (appleSecret != null && appleSecretExpiry.isAfter(Instant.now().plusSeconds(30))) {
            return appleSecret;
        }
        String pem = oauth.apple().privateKey().replace("\\n", "\n");
        String body = pem.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replaceAll("\\s", "");
        byte[] decoded = Base64.getDecoder().decode(body);
        ECPrivateKey key = (ECPrivateKey) KeyFactory.getInstance("EC").generatePrivate(new PKCS8EncodedKeySpec(decoded));
        Instant now = Instant.now();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(oauth.apple().teamId())
                .subject(oauth.apple().clientId())
                .audience("https://appleid.apple.com")
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plus(5, ChronoUnit.MINUTES)))
                .build();
        SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.ES256).keyID(oauth.apple().keyId()).build(), claims);
        jwt.sign(new ECDSASigner(key));
        appleSecret = jwt.serialize();
        appleSecretExpiry = now.plus(4, ChronoUnit.MINUTES);
        return appleSecret;
    }

    private Spec spec(String provider) {
        return switch (provider) {
            case "google" -> new Spec(
                    "https://accounts.google.com/o/oauth2/v2/auth",
                    "https://oauth2.googleapis.com/token",
                    "https://www.googleapis.com/oauth2/v3/certs",
                    "https://accounts.google.com",
                    oauth.google().clientId(),
                    oauth.google().clientSecret(),
                    "openid email profile"
            );
            case "facebook" -> new Spec(
                    "https://www.facebook.com/v19.0/dialog/oauth",
                    "https://graph.facebook.com/v19.0/oauth/access_token",
                    "https://www.facebook.com/.well-known/oauth/openid/jwks/",
                    "https://www.facebook.com",
                    oauth.facebook().clientId(),
                    oauth.facebook().clientSecret(),
                    "openid email"
            );
            case "apple" -> new Spec(
                    "https://appleid.apple.com/auth/authorize",
                    "https://appleid.apple.com/auth/token",
                    "https://appleid.apple.com/auth/keys",
                    "https://appleid.apple.com",
                    oauth.apple().clientId(),
                    "",
                    "openid email name"
            );
            default -> throw new ApiException(HttpStatus.NOT_FOUND, "unknown_provider", "That sign-in provider is not available.");
        };
    }

    private String redirectUri(String provider) {
        String base = auth.publicBaseUrl().endsWith("/") ? auth.publicBaseUrl().substring(0, auth.publicBaseUrl().length() - 1) : auth.publicBaseUrl();
        return base + "/api/auth/oauth/" + provider + "/callback";
    }

    private String failure(String reason) {
        return auth.frontendOrigin() + "/login?oauth=error&reason=" + URLEncoder.encode(reason, StandardCharsets.UTF_8);
    }

    private static String challenge(String verifier) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private static boolean claimTrue(JWTClaimsSet claims, String name) throws Exception {
        Object value = claims.getClaim(name);
        return Boolean.TRUE.equals(value) || "true".equals(value);
    }

    private static String providerLabel(String provider) {
        return switch (provider) {
            case "google" -> "Google";
            case "facebook" -> "Facebook";
            case "apple" -> "Apple";
            default -> "Social";
        };
    }

    private record Spec(String authorization, String token, String jwks, String issuer, String clientId, String clientSecret, String scope) {
    }

    private record VerifiedIdentity(String subject, String email, String name) {
    }

    private record CachedJwks(JWKSet set, Instant expires) {
    }

    private static final class EmailAlreadyRegistered extends RuntimeException {
    }
}

package com.cyrohost.auth;

import com.cyrohost.auth.repository.PasswordResetTokenRepository;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.security.TokenHasher;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("cyro.auth.jwt-secret", () -> "test-secret-test-secret-test-secret");
        registry.add("cyro.auth.expose-dev-reset-token", () -> "true");
        registry.add("cyro.auth.cookie-secure", () -> "false");
        registry.add("cyro.auth.frontend-origin", () -> "http://localhost:3000");
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    UserRepository users;

    @Autowired
    PasswordResetTokenRepository resetTokens;

    @Test
    void productionConfigDoesNotExposeResetTokens() throws Exception {
        String yaml = new String(java.util.Objects.requireNonNull(getClass().getResourceAsStream("/application.yml")).readAllBytes());
        assertThat(yaml).contains("expose-dev-reset-token: ${EXPOSE_DEV_RESET_TOKEN:false}");
        assertThat(TokenHasher.exposedDevToken(false, "secret-token")).isNull();
    }

    @Test
    void registersAndRejectsDuplicatesAndInvalidData() throws Exception {
        Csrf csrf = csrf();
        MvcResult created = mvc.perform(post("/api/auth/register")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Amina Shah","email":"Amina@Example.com","password":"Correct-horse-1","confirmPassword":"Correct-horse-1","acceptedTerms":true}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("amina@example.com"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andReturn();
        assertThat(created.getResponse().getContentAsString()).doesNotContain("$2a$").doesNotContain("passwordHash");
        assertThat(headerValue(created, "cyro_access")).contains("HttpOnly");
        assertThat(headerValue(created, "cyro_refresh")).contains("HttpOnly");

        mvc.perform(post("/api/auth/register")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Amina Shah","email":"amina@example.com","password":"Correct-horse-1","confirmPassword":"Correct-horse-1","acceptedTerms":true}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An account with this email already exists."));

        mvc.perform(post("/api/auth/register")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"A","email":"not-an-email","password":"short","confirmPassword":"other","acceptedTerms":false}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("validation_failed"))
                .andExpect(jsonPath("$.fields.email").exists())
                .andExpect(jsonPath("$.fields.acceptedTerms").exists());
    }

    @Test
    void loginAcceptsValidCredentialsAndRejectsInvalidOnes() throws Exception {
        Csrf csrf = csrf();
        register(csrf, "login@example.com", "Login Person");
        MvcResult ok = mvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"login@example.com","password":"Correct-horse-1","rememberMe":true}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("login@example.com"))
                .andReturn();
        Cookie access = cookie(ok, "cyro_access");
        mvc.perform(get("/api/auth/me").cookie(access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Login Person"));

        mvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"login@example.com","password":"wrong-password-1"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email or password is incorrect."));

        mvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"missing@example.com","password":"Correct-horse-1"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email or password is incorrect."));
    }

    @Test
    void protectsMeAndRejectsAnonymousAccess() throws Exception {
        Csrf csrf = csrf();
        MvcResult created = register(csrf, "private@example.com", "Private User");
        mvc.perform(get("/api/auth/me").cookie(cookie(created, "cyro_access")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("private@example.com"));
        mvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("unauthorized"));
    }

    @Test
    void resetTokenExpiresAndCannotBeReused() throws Exception {
        Csrf csrf = csrf();
        register(csrf, "reset@example.com", "Reset User");
        String first = forgot(csrf, "reset@example.com");
        var expired = resetTokens.findByTokenHash(TokenHasher.sha256(first)).orElseThrow();
        expired.setExpiresAt(Instant.now().minusSeconds(60));
        resetTokens.saveAndFlush(expired);
        mvc.perform(post("/api/auth/reset-password")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resetBody(first, "Newer-password-2")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("This reset link is invalid or has expired."));

        String second = forgot(csrf, "reset@example.com");
        mvc.perform(post("/api/auth/reset-password")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resetBody(second, "Newer-password-2")))
                .andExpect(status().isOk());
        mvc.perform(post("/api/auth/reset-password")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resetBody(second, "Newer-password-3")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("This reset link is invalid or has expired."));

        mvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"reset@example.com","password":"Correct-horse-1"}
                                """))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"reset@example.com","password":"Newer-password-2"}
                                """))
                .andExpect(status().isOk());
    }

    @Test
    void rotatesRefreshTokensAndLogoutInvalidatesTheSession() throws Exception {
        Csrf csrf = csrf();
        MvcResult created = register(csrf, "session@example.com", "Session User");
        Cookie refreshA = cookie(created, "cyro_refresh");
        MvcResult rotated = mvc.perform(post("/api/auth/refresh").cookie(csrf.cookie(), refreshA).header("X-CSRF-Token", csrf.token()))
                .andExpect(status().isOk())
                .andReturn();
        Cookie refreshB = cookie(rotated, "cyro_refresh");
        assertThat(refreshB.getValue()).isNotEqualTo(refreshA.getValue());
        MvcResult rotatedAgain = mvc.perform(post("/api/auth/refresh").cookie(csrf.cookie(), refreshB).header("X-CSRF-Token", csrf.token()))
                .andExpect(status().isOk())
                .andReturn();
        Cookie refreshC = cookie(rotatedAgain, "cyro_refresh");
        mvc.perform(post("/api/auth/refresh").cookie(csrf.cookie(), refreshA).header("X-CSRF-Token", csrf.token()))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/refresh").cookie(csrf.cookie(), refreshC).header("X-CSRF-Token", csrf.token()))
                .andExpect(status().isUnauthorized());

        MvcResult loggedIn = register(csrf, "logout@example.com", "Logout User");
        Cookie access = cookie(loggedIn, "cyro_access");
        Cookie refresh = cookie(loggedIn, "cyro_refresh");
        mvc.perform(post("/api/auth/logout").cookie(csrf.cookie(), refresh).header("X-CSRF-Token", csrf.token()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/auth/me").cookie(access)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/refresh").cookie(csrf.cookie(), refresh).header("X-CSRF-Token", csrf.token()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void socialLoginDoesNotTrustABrowserSuppliedEmail() throws Exception {
        long before = users.count();
        Csrf csrf = csrf();
        mvc.perform(post("/api/auth/oauth/google/start")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"person@example.com\",\"provider\":\"google\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/oauth/google/start"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("oauth_not_configured"));
        mvc.perform(get("/api/auth/oauth/google/callback").param("code", "browser-code").param("state", "browser-state"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("reason=oauth_state")));
        assertThat(users.count()).isEqualTo(before);
    }

    private MvcResult register(Csrf csrf, String email, String name) throws Exception {
        return mvc.perform(post("/api/auth/register")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"" + name + "\",\"email\":\"" + email + "\",\"password\":\"Correct-horse-1\",\"confirmPassword\":\"Correct-horse-1\",\"acceptedTerms\":true}"))
                .andExpect(status().isCreated())
                .andReturn();
    }

    private String forgot(Csrf csrf, String email) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/forgot-password")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account exists for that email, reset instructions will be sent."))
                .andReturn();
        JsonNode body = json.readTree(result.getResponse().getContentAsString());
        assertThat(body.hasNonNull("devResetToken")).isTrue();
        assertThat(body.has("token")).isFalse();
        assertThat(body.has("resetToken")).isFalse();
        return body.get("devResetToken").asText();
    }

    private static String resetBody(String token, String password) {
        return "{\"token\":\"" + token + "\",\"password\":\"" + password + "\",\"confirmPassword\":\"" + password + "\"}";
    }

    private Csrf csrf() throws Exception {
        MvcResult result = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        String token = json.readTree(result.getResponse().getContentAsString()).get("csrfToken").asText();
        return new Csrf(token, cookie(result, "cyro_csrf"));
    }

    private static Cookie cookie(MvcResult result, String name) {
        for (String header : result.getResponse().getHeaders("Set-Cookie")) {
            if (header.startsWith(name + "=")) {
                return new Cookie(name, header.substring(name.length() + 1).split(";", 2)[0]);
            }
        }
        throw new AssertionError("Missing cookie " + name);
    }

    private static String headerValue(MvcResult result, String name) {
        return result.getResponse().getHeaders("Set-Cookie").stream()
                .filter(header -> header.startsWith(name + "="))
                .findFirst()
                .orElseThrow();
    }

    private record Csrf(String token, Cookie cookie) {
    }
}

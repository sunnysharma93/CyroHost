package com.cyrohost.auth;

import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.service.AdminBootstrap;
import com.cyrohost.console.entity.AuditEvent;
import com.cyrohost.console.entity.NotificationEvent;
import com.cyrohost.console.repository.AuditEventRepository;
import com.cyrohost.console.repository.NotificationEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminRoleTest {

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
        registry.add("cyro.auth.cookie-secure", () -> "false");
        registry.add("cyro.auth.frontend-origin", () -> "http://localhost:3000");
        registry.add("cyro.auth.admin-email", () -> "sunnysharma12@gmail.com");
        registry.add("cyro.auth.admin-password", () -> "Admin-bootstrap-1");
        registry.add("cyro.auth.admin-upgrade-existing", () -> "false");
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    UserRepository users;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    AdminBootstrap bootstrap;

    @Autowired
    AuditEventRepository audits;

    @Autowired
    NotificationEventRepository notifications;

    @Test
    void bootstrapCreatesOneAdminAndDoesNotResetThePassword() {
        var admin = users.findByEmail("sunnysharma12@gmail.com").orElseThrow();
        assertThat(admin.getPlatformRole()).isEqualTo("ADMIN");
        assertThat(admin.getPasswordHash()).startsWith("$2");
        assertThat(admin.getPasswordHash()).doesNotContain("Admin-bootstrap-1");
        assertThat(encoder.matches("Admin-bootstrap-1", admin.getPasswordHash())).isTrue();
        String hash = admin.getPasswordHash();
        long count = users.countByPlatformRole("ADMIN");
        bootstrap.ensureAdmin(false);
        var again = users.findByEmail("sunnysharma12@gmail.com").orElseThrow();
        assertThat(again.getPasswordHash()).isEqualTo(hash);
        assertThat(users.countByPlatformRole("ADMIN")).isEqualTo(count);
        again.setPlatformRole("USER");
        users.saveAndFlush(again);
        bootstrap.ensureAdmin(false);
        assertThat(users.findByEmail("sunnysharma12@gmail.com").orElseThrow().getPlatformRole()).isEqualTo("USER");
        bootstrap.ensureAdmin(true);
        var upgraded = users.findByEmail("sunnysharma12@gmail.com").orElseThrow();
        assertThat(upgraded.getPlatformRole()).isEqualTo("ADMIN");
        assertThat(upgraded.getPasswordHash()).isEqualTo(hash);
    }

    @Test
    void roleChangesAreServerEnforced() throws Exception {
        Csrf csrf = csrf();
        MvcResult registered = mvc.perform(post("/api/auth/register")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Role Seeker","email":"seeker@example.com","password":"Correct-horse-1","confirmPassword":"Correct-horse-1","acceptedTerms":true,"platformRole":"ADMIN","role":"ADMIN"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.platformRole").value("USER"))
                .andReturn();
        assertThat(users.findByEmail("seeker@example.com").orElseThrow().getPlatformRole()).isEqualTo("USER");

        MvcResult second = register(csrf, "second@example.com", "Second User");
        Cookie userAccess = cookie(registered, "cyro_access");
        String secondId = json.readTree(second.getResponse().getContentAsString()).get("id").asText();
        mvc.perform(get("/api/admin/users").cookie(userAccess)).andExpect(status().isForbidden());
        mvc.perform(patch("/api/admin/users/" + secondId + "/role")
                        .cookie(csrf.cookie(), userAccess)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isForbidden());

        MvcResult adminLogin = mvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"sunnysharma12@gmail.com","password":"Admin-bootstrap-1"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.platformRole").value("ADMIN"))
                .andReturn();
        Cookie adminAccess = cookie(adminLogin, "cyro_access");
        assertThat(jwtPayload(adminAccess.getValue())).contains("\"role\":\"ADMIN\"");
        mvc.perform(get("/api/admin/users").cookie(adminAccess))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.adminCount").value(1));
        mvc.perform(get("/api/admin/vps-requests").cookie(adminAccess)).andExpect(status().isOk());
        mvc.perform(get("/api/admin/activity").cookie(adminAccess)).andExpect(status().isOk());

        String seekerId = json.readTree(registered.getResponse().getContentAsString()).get("id").asText();
        mvc.perform(patch("/api/admin/users/" + seekerId + "/role")
                        .cookie(csrf.cookie(), adminAccess)
                        .header("X-CSRF-Token", csrf.token())
                        .header("User-Agent", "JUnit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.platformRole").value("ADMIN"));

        MvcResult userLogin = mvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"second@example.com","password":"Correct-horse-1"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.platformRole").value("USER"))
                .andReturn();
        assertThat(jwtPayload(cookie(userLogin, "cyro_access").getValue())).contains("\"role\":\"USER\"");

        var admin = users.findByEmail("sunnysharma12@gmail.com").orElseThrow();
        mvc.perform(patch("/api/admin/users/" + admin.getId() + "/role")
                        .cookie(csrf.cookie(), adminAccess)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"USER\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.platformRole").value("USER"));
        mvc.perform(patch("/api/admin/users/" + seekerId + "/role")
                        .cookie(csrf.cookie(), cookie(registered, "cyro_access"))
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"USER\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("last_admin"));

        Cookie seekerAccess = cookie(mvc.perform(post("/api/auth/refresh")
                        .cookie(csrf.cookie(), cookie(registered, "cyro_refresh"))
                        .header("X-CSRF-Token", csrf.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.platformRole").value("ADMIN"))
                .andReturn(), "cyro_access");
        mvc.perform(patch("/api/admin/users/" + admin.getId() + "/role")
                        .cookie(csrf.cookie(), seekerAccess)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isOk());
        mvc.perform(patch("/api/admin/users/" + seekerId + "/role")
                        .cookie(csrf.cookie(), seekerAccess)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"USER\"}"))
                .andExpect(status().isOk());
        mvc.perform(patch("/api/admin/users/" + admin.getId() + "/role")
                        .cookie(csrf.cookie(), adminAccess)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"USER\"}"))
                .andExpect(status().isConflict());

        assertThat(audits.findAll()).anyMatch(event -> roleChange(event, "seeker@example.com", "USER", "ADMIN"));
        assertThat(notifications.findAll(PageRequest.of(0, 50)).getContent())
                .anyMatch(event -> "login".equals(event.getKind()) && "[CyroHost] User Login Activity".equals(event.getSubject()));
        assertThat(notifications.findAll(PageRequest.of(0, 50)).getContent())
                .anyMatch(event -> "ADMIN_ROLE_CHANGED".equals(event.getKind()));
        assertThat(audits.findAll()).anyMatch(event -> "login".equals(event.getAction()) && event.getMetadata() != null && event.getMetadata().contains("role=ADMIN"));
        assertThat(audits.findAll()).anyMatch(event -> "login".equals(event.getAction()) && event.getMetadata() != null && event.getMetadata().contains("role=USER"));
    }

    @Test
    void configDoesNotEmbedTheAdminPassword() throws Exception {
        String yaml = new String(java.util.Objects.requireNonNull(getClass().getResourceAsStream("/application.yml")).readAllBytes());
        assertThat(yaml).contains("admin-password: ${CYROHOST_ADMIN_PASSWORD:}");
        assertThat(yaml).doesNotContain("Admin-bootstrap-1");
    }

    private static boolean roleChange(AuditEvent event, String target, String from, String to) {
        return "ADMIN_ROLE_CHANGED".equals(event.getAction())
                && event.getMetadata() != null
                && event.getMetadata().contains("target=" + target)
                && event.getMetadata().contains("from=" + from)
                && event.getMetadata().contains("to=" + to)
                && !event.getMetadata().toLowerCase().contains("password");
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

    private static String jwtPayload(String token) {
        String body = token.split("\\.")[1];
        return new String(Base64.getUrlDecoder().decode(body), StandardCharsets.UTF_8);
    }

    private record Csrf(String token, Cookie cookie) {
    }
}

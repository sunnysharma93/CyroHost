package com.cyrohost.console;

import com.cyrohost.auth.AuthApplication;
import com.cyrohost.console.catalog.PublishedCatalog;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = AuthApplication.class)
@AutoConfigureMockMvc
class ConsoleOwnershipTest {

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
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Test
    void publishedPlansMatchThePublicPriceList() {
        assertThat(PublishedCatalog.PLANS).extracting(PublishedCatalog.Plan::price)
                .containsExactly("₹604", "₹806", "₹1,009", "₹1,590", "₹2,168", "₹2,554", "₹3,903", "₹4,867", "₹7,758");
        assertThat(PublishedCatalog.plan("nano").orElseThrow().windows()).isFalse();
        assertThat(PublishedCatalog.OPERATING_SYSTEMS).extracting(PublishedCatalog.OsTemplate::id).containsExactly("linux", "windows");
    }

    @Test
    void customerCannotOpenAnotherCustomersResources() throws Exception {
        Csrf csrf = csrf();
        Cookie owner = register(csrf, "owner.console@example.com", "Owner Console");
        Cookie other = register(csrf, "other.console@example.com", "Other Console");

        MvcResult created = mvc.perform(post("/api/servers")
                        .cookie(csrf.cookie(), owner)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"web-01","hostname":"web-01","planId":"micro","regionId":"india","os":"linux"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("requested"))
                .andExpect(jsonPath("$.ip").doesNotExist())
                .andExpect(jsonPath("$.provider").value("not_connected"))
                .andReturn();
        String serverId = json.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mvc.perform(get("/api/servers/" + serverId).cookie(other))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/servers").param("q", "web-01").cookie(other))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
        mvc.perform(delete("/api/servers/" + serverId).cookie(csrf.cookie(), other).header("X-CSRF-Token", csrf.token()))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/servers/" + serverId + "/start").cookie(csrf.cookie(), owner).header("X-CSRF-Token", csrf.token()))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("provider_not_connected"));
        mvc.perform(get("/api/servers/" + serverId).cookie(owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("requested"));

        MvcResult ticket = mvc.perform(post("/api/support/tickets")
                        .cookie(csrf.cookie(), owner)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"subject":"Need a region check","category":"servers","priority":"normal","body":"Please confirm India is still the published region."}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        String ticketId = json.readTree(ticket.getResponse().getContentAsString()).get("id").asText();
        mvc.perform(get("/api/support/tickets/" + ticketId).cookie(other)).andExpect(status().isNotFound());
        mvc.perform(get("/api/billing/invoices").cookie(other))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.provider").value("not_configured"));

        MvcResult token = mvc.perform(post("/api/account/tokens")
                        .cookie(csrf.cookie(), owner)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Deploy script","scope":"read"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();
        JsonNode tokenBody = json.readTree(token.getResponse().getContentAsString());
        String raw = tokenBody.get("token").asText();
        String tokenId = tokenBody.get("id").asText();
        String listed = mvc.perform(get("/api/account/tokens").cookie(owner))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertThat(listed).doesNotContain(raw);
        mvc.perform(post("/api/account/tokens/" + tokenId + "/revoke").cookie(csrf.cookie(), other).header("X-CSRF-Token", csrf.token()))
                .andExpect(status().isNotFound());

        mvc.perform(get("/api/dashboard").cookie(owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.servers.pending").value(1))
                .andExpect(jsonPath("$.servers.running").value(0))
                .andExpect(jsonPath("$.usage.connected").value(false));
    }

    @Test
    void vpsRequestStaysWithItsOwnerAndAdminActionsAreChecked() throws Exception {
        Csrf csrf = csrf();
        Cookie owner = register(csrf, "vps.owner@example.com", "Vps Owner");
        Cookie other = register(csrf, "vps.other@example.com", "Vps Other");
        MvcResult adminCreated = mvc.perform(post("/api/auth/register")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Console Admin","email":"admin.console@example.com","password":"Correct-horse-1","confirmPassword":"Correct-horse-1","acceptedTerms":true,"role":"ADMIN"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.platformRole").value("USER"))
                .andReturn();
        Cookie admin = cookie(adminCreated, "cyro_access");
        String adminId = json.readTree(adminCreated.getResponse().getContentAsString()).get("id").asText();
        MvcResult boss = mvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"sunnysharma12@gmail.com","password":"Admin-bootstrap-1"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        mvc.perform(patch("/api/admin/users/" + adminId + "/role")
                        .cookie(csrf.cookie(), cookie(boss, "cyro_access"))
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isOk());

        mvc.perform(get("/api/admin/overview").cookie(owner)).andExpect(status().isForbidden());
        mvc.perform(post("/api/vps-requests")
                        .cookie(csrf.cookie(), owner)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"planId":"nano","regionId":"india","osId":"windows","serverName":"bad"}
                                """))
                .andExpect(status().isBadRequest());

        MvcResult created = mvc.perform(post("/api/vps-requests")
                        .cookie(csrf.cookie(), owner)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"planId":"micro","regionId":"mumbai","osId":"linux","serverName":"app-01","hostname":"app-01","sshPublicKey":"ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAITestKeyOnlyForUnitTest customer","additionalRequirements":"Need a review"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.provisioned").value(false))
                .andExpect(jsonPath("$.emailStatus").value("NOT_CONFIGURED"))
                .andExpect(jsonPath("$.requestNumber").exists())
                .andReturn();
        JsonNode body = json.readTree(created.getResponse().getContentAsString());
        String id = body.get("id").asText();
        String number = body.get("requestNumber").asText();
        MvcResult duplicate = mvc.perform(post("/api/vps-requests")
                        .cookie(csrf.cookie(), owner)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"planId":"micro","regionId":"mumbai","osId":"linux","serverName":"app-01","hostname":"app-01","sshPublicKey":"ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAITestKeyOnlyForUnitTest customer","additionalRequirements":"Need a review"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.duplicate").value(true))
                .andExpect(jsonPath("$.id").value(id))
                .andReturn();
        assertThat(duplicate.getResponse().getContentAsString()).doesNotContain("ssh-ed25519");
        String whatsapp = body.get("whatsappUrl").asText();
        assertThat(whatsapp).startsWith("https://wa.me/919528839776?text=");
        assertThat(java.net.URLDecoder.decode(whatsapp.substring(whatsapp.indexOf("text=") + 5), java.nio.charset.StandardCharsets.UTF_8))
                .contains(number)
                .contains("app-01")
                .doesNotContain("ssh-ed25519")
                .doesNotContain("password");
        assertThat(created.getResponse().getContentAsString()).doesNotContain("ssh-ed25519");

        mvc.perform(get("/api/vps-requests/" + id).cookie(other)).andExpect(status().isNotFound());
        mvc.perform(patch("/api/admin/vps-requests/" + id)
                        .cookie(csrf.cookie(), admin)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"UNDER_REVIEW\",\"adminNotes\":\"Checking region availability\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNDER_REVIEW"));
        mvc.perform(patch("/api/admin/vps-requests/" + id)
                        .cookie(csrf.cookie(), admin)
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACTIVE\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("invalid_status"));
        mvc.perform(get("/api/vps-requests/" + id).cookie(owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNDER_REVIEW"))
                .andExpect(jsonPath("$.adminNotes").doesNotExist())
                .andExpect(jsonPath("$.sshPublicKey").doesNotExist());
        String catalog = mvc.perform(get("/api/catalog").cookie(owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plans[0].price").value("₹604"))
                .andReturn().getResponse().getContentAsString();
        assertThat(catalog).contains("\"id\":\"mumbai\"").contains("ENQUIRY_ONLY");
    }

    private Cookie register(Csrf csrf, String email, String name) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/register")
                        .cookie(csrf.cookie())
                        .header("X-CSRF-Token", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"" + name + "\",\"email\":\"" + email + "\",\"password\":\"Correct-horse-1\",\"confirmPassword\":\"Correct-horse-1\",\"acceptedTerms\":true}"))
                .andExpect(status().isCreated())
                .andReturn();
        return cookie(result, "cyro_access");
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

    private record Csrf(String token, Cookie cookie) {
    }
}

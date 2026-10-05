package com.cyrohost.console.controller;

import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.auth.exception.ApiException;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.security.AuthCookies;
import com.cyrohost.console.security.AccountGuard;
import com.cyrohost.console.security.AccountGuard.AccountAccess;
import com.cyrohost.console.service.CustomerConsoleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
public class CustomerConsoleController {

    private final AccountGuard guard;
    private final CustomerConsoleService console;
    private final UserRepository users;
    private final AuthCookies cookies;

    public CustomerConsoleController(AccountGuard guard, CustomerConsoleService console, UserRepository users, AuthCookies cookies) {
        this.guard = guard;
        this.console = console;
        this.users = users;
        this.cookies = cookies;
    }

    @GetMapping("/api/catalog")
    public Map<String, Object> catalog(HttpServletRequest request) {
        guard.require(request);
        return console.catalog();
    }

    @GetMapping("/api/dashboard")
    public Map<String, Object> dashboard(HttpServletRequest request) {
        AccountAccess access = guard.require(request);
        return console.dashboard(access, user(access));
    }

    @GetMapping("/api/servers")
    public Map<String, Object> servers(
            HttpServletRequest request,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return console.servers(guard.require(request), q, status, page, size, sort, direction);
    }

    @PostMapping("/api/servers")
    public Map<String, Object> createServer(HttpServletRequest request, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        return console.createServer(access, body, request.getRemoteAddr());
    }

    @GetMapping("/api/servers/{id}")
    public Map<String, Object> server(HttpServletRequest request, @PathVariable UUID id) {
        return console.server(guard.require(request), id);
    }

    @GetMapping("/api/servers/{id}/activity")
    public Map<String, Object> serverActivity(HttpServletRequest request, @PathVariable UUID id) {
        return console.serverActivity(guard.require(request), id);
    }

    @PatchMapping("/api/servers/{id}")
    public Map<String, Object> updateServer(HttpServletRequest request, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        return console.updateServer(access, id, body, request.getRemoteAddr());
    }

    @DeleteMapping("/api/servers/{id}")
    public Map<String, Object> cancelServer(HttpServletRequest request, @PathVariable UUID id) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        console.cancelServer(access, id, request.getRemoteAddr());
        return Map.of("status", "cancelled");
    }

    @PostMapping("/api/servers/{id}/{action}")
    public Map<String, Object> power(HttpServletRequest request, @PathVariable UUID id, @PathVariable String action) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        console.power(access, id, action, request.getRemoteAddr());
        return Map.of("status", action);
    }

    @GetMapping("/api/server-groups")
    public Map<String, Object> groups(HttpServletRequest request) {
        return console.groups(guard.require(request));
    }

    @PostMapping("/api/server-groups")
    public Map<String, Object> createGroup(HttpServletRequest request, @Valid @RequestBody NameBody body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        return console.createGroup(access, body.name(), request.getRemoteAddr());
    }

    @PatchMapping("/api/server-groups/{id}")
    public Map<String, Object> renameGroup(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody NameBody body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        return console.renameGroup(access, id, body.name(), request.getRemoteAddr());
    }

    @DeleteMapping("/api/server-groups/{id}")
    public Map<String, Object> deleteGroup(HttpServletRequest request, @PathVariable UUID id) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "admin");
        console.deleteGroup(access, id, request.getRemoteAddr());
        return Map.of("deleted", true);
    }

    @PostMapping("/api/server-groups/{id}/servers")
    public Map<String, Object> assign(HttpServletRequest request, @PathVariable UUID id, @RequestBody IdBody body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        return console.assignServer(access, id, body.serverId(), request.getRemoteAddr());
    }

    @DeleteMapping("/api/server-groups/{id}/servers/{serverId}")
    public Map<String, Object> unassign(HttpServletRequest request, @PathVariable UUID id, @PathVariable UUID serverId) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        console.unassignServer(access, id, serverId, request.getRemoteAddr());
        return Map.of("removed", true);
    }

    @GetMapping("/api/support/tickets")
    public Map<String, Object> tickets(HttpServletRequest request) {
        return console.tickets(guard.require(request));
    }

    @PostMapping("/api/support/tickets")
    public Map<String, Object> createTicket(HttpServletRequest request, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "support");
        return console.createTicket(access, body, request.getRemoteAddr());
    }

    @GetMapping("/api/support/tickets/{id}")
    public Map<String, Object> ticket(HttpServletRequest request, @PathVariable UUID id) {
        return console.ticket(guard.require(request), id);
    }

    @PostMapping("/api/support/tickets/{id}/messages")
    public Map<String, Object> reply(HttpServletRequest request, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "support");
        return console.reply(access, id, body.get("body"), request.getRemoteAddr());
    }

    @PostMapping("/api/support/tickets/{id}/status")
    public Map<String, Object> ticketStatus(HttpServletRequest request, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "support");
        return console.ticketStatus(access, id, body.get("status"), request.getRemoteAddr());
    }

    @GetMapping("/api/network/dns/zones")
    public Map<String, Object> zones(HttpServletRequest request) {
        return console.zones(guard.require(request));
    }

    @PostMapping("/api/network/dns/zones")
    public Map<String, Object> createZone(HttpServletRequest request, @Valid @RequestBody NameBody body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        return console.createZone(access, body.name(), request.getRemoteAddr());
    }

    @GetMapping("/api/network/dns/zones/{id}")
    public Map<String, Object> zone(HttpServletRequest request, @PathVariable UUID id) {
        return console.zone(guard.require(request), id);
    }

    @DeleteMapping("/api/network/dns/zones/{id}")
    public Map<String, Object> deleteZone(HttpServletRequest request, @PathVariable UUID id) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "admin");
        return console.deleteZone(access, id, request.getRemoteAddr());
    }

    @PostMapping("/api/network/dns/zones/{id}/records")
    public Map<String, Object> addRecord(HttpServletRequest request, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        return console.addRecord(access, id, body, request.getRemoteAddr());
    }

    @PatchMapping("/api/network/dns/zones/{id}/records/{recordId}")
    public Map<String, Object> updateRecord(HttpServletRequest request, @PathVariable UUID id, @PathVariable UUID recordId, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        return console.updateRecord(access, id, recordId, body, request.getRemoteAddr());
    }

    @DeleteMapping("/api/network/dns/zones/{id}/records/{recordId}")
    public Map<String, Object> deleteRecord(HttpServletRequest request, @PathVariable UUID id, @PathVariable UUID recordId) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        console.deleteRecord(access, id, recordId, request.getRemoteAddr());
        return Map.of("deleted", true);
    }

    @GetMapping({"/api/network/addresses", "/api/network/cdn", "/api/network/proxy", "/api/network/ddos", "/api/storage/objects", "/api/storage/volumes", "/api/dedicated"})
    public Map<String, Object> provider(HttpServletRequest request) {
        guard.require(request);
        String path = request.getRequestURI();
        String segment = path.substring(path.lastIndexOf('/') + 1);
        String area = "objects".equals(segment) ? "storage" : segment;
        return console.providerState(area);
    }

    @GetMapping("/api/billing/invoices")
    public Map<String, Object> invoices(HttpServletRequest request) {
        return console.invoices(guard.require(request));
    }

    @GetMapping("/api/billing/invoices/{id}")
    public Map<String, Object> invoice(HttpServletRequest request, @PathVariable UUID id) {
        return console.invoice(guard.require(request), id);
    }

    @GetMapping("/api/billing/wallet")
    public Map<String, Object> wallet(HttpServletRequest request) {
        guard.require(request);
        return console.wallet();
    }

    @PostMapping("/api/billing/wallet/top-up")
    public void topUp(HttpServletRequest request) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "billing");
        console.topUp();
    }

    @GetMapping("/api/billing/offers")
    public Map<String, Object> offers(HttpServletRequest request) {
        guard.require(request);
        return console.offers();
    }

    @PostMapping("/api/billing/offers/apply")
    public Map<String, Object> applyOffer(HttpServletRequest request, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "billing");
        return console.applyOffer(body.get("code"));
    }

    @GetMapping("/api/account/profile")
    public Map<String, Object> profile(HttpServletRequest request) {
        AccountAccess access = guard.require(request);
        return console.profile(user(access), access);
    }

    @PatchMapping("/api/account/profile")
    public Map<String, Object> updateProfile(HttpServletRequest request, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        return console.updateProfile(user(access), access, body, request.getRemoteAddr());
    }

    @PostMapping("/api/account/password")
    public Map<String, String> password(HttpServletRequest request, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        console.changePassword(user(access), access, body.get("currentPassword"), body.get("password"), body.get("confirmPassword"), request.getRemoteAddr());
        return Map.of("message", "Password updated.");
    }

    @GetMapping("/api/account/sessions")
    public Map<String, Object> sessions(HttpServletRequest request) {
        return console.sessions(guard.require(request));
    }

    @PostMapping("/api/account/sessions/revoke-others")
    public Map<String, String> revokeOthers(HttpServletRequest request) {
        AccountAccess access = guard.require(request);
        console.revokeOthers(access, request.getRemoteAddr());
        return Map.of("message", "Other sessions were signed out.");
    }

    @GetMapping("/api/account/members")
    public Map<String, Object> members(HttpServletRequest request) {
        AccountAccess access = guard.require(request);
        return console.members(access, user(access));
    }

    @PostMapping("/api/account/members")
    public Map<String, Object> invite(HttpServletRequest request, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "admin");
        return console.invite(access, body.get("email"), body.get("role"), request.getRemoteAddr());
    }

    @PostMapping("/api/account/invitations/{id}/accept")
    public Map<String, Object> accept(HttpServletRequest request, @PathVariable UUID id) {
        AccountAccess access = guard.require(request);
        return console.acceptInvite(user(access), id, request.getRemoteAddr());
    }

    @DeleteMapping("/api/account/members/{id}")
    public Map<String, Boolean> removeMember(HttpServletRequest request, @PathVariable UUID id) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "admin");
        console.removeMember(access, id, request.getRemoteAddr());
        return Map.of("deleted", true);
    }

    @PostMapping("/api/account/active")
    public Map<String, String> active(HttpServletRequest request, HttpServletResponse response, @RequestBody IdBody body) {
        AccountAccess access = guard.require(request);
        if (body.accountId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "validation_failed", "Choose an account.");
        }
        AccountAccess selected = guard.select(access.userId(), body.accountId());
        cookies.writeAccount(response, selected.accountId().toString());
        return Map.of("accountId", selected.accountId().toString(), "role", selected.role());
    }

    @GetMapping("/api/account/tokens")
    public Map<String, Object> tokens(HttpServletRequest request) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "admin");
        return console.tokens(access);
    }

    @PostMapping("/api/account/tokens")
    public Map<String, Object> createToken(HttpServletRequest request, @RequestBody TokenBody body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "admin");
        return console.createToken(access, body.name(), body.scope(), body.days(), request.getRemoteAddr());
    }

    @PostMapping("/api/account/tokens/{id}/revoke")
    public Map<String, Boolean> revokeToken(HttpServletRequest request, @PathVariable UUID id) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "admin");
        console.revokeToken(access, id, request.getRemoteAddr());
        return Map.of("revoked", true);
    }

    private UserAccount user(AccountAccess access) {
        return users.findById(access.userId()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "unauthorized", "Sign in to continue."));
    }

    public record NameBody(@NotBlank String name) {
    }

    public record IdBody(UUID serverId, UUID accountId) {
    }

    public record TokenBody(String name, String scope, Integer days) {
    }
}

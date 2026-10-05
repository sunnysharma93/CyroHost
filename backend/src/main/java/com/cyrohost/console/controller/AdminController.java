package com.cyrohost.console.controller;

import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.console.service.AdminPlatformService;
import jakarta.servlet.http.HttpServletRequest;
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
public class AdminController {

    private final AdminPlatformService admin;

    public AdminController(AdminPlatformService admin) {
        this.admin = admin;
    }

    @GetMapping("/api/admin/overview")
    public Map<String, Object> overview(HttpServletRequest request) {
        admin.require(request);
        return admin.overview();
    }

    @GetMapping("/api/admin/users")
    public Map<String, Object> users(HttpServletRequest request, @RequestParam(defaultValue = "") String q, @RequestParam(defaultValue = "0") int page) {
        admin.require(request);
        return admin.users(q, page);
    }

    @PatchMapping("/api/admin/users/{id}/role")
    public Map<String, Object> changeRole(HttpServletRequest request, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        UserAccount actor = admin.require(request);
        return admin.changeRole(actor, id, body.get("role"), request.getRemoteAddr(), request.getHeader("User-Agent"));
    }

    @GetMapping("/api/admin/customers")
    public Map<String, Object> customers(HttpServletRequest request, @RequestParam(defaultValue = "") String q, @RequestParam(defaultValue = "0") int page) {
        admin.require(request);
        return admin.customers(q, page);
    }

    @GetMapping("/api/admin/customers/{id}")
    public Map<String, Object> customer(HttpServletRequest request, @PathVariable UUID id) {
        admin.require(request);
        return admin.customer(id);
    }

    @GetMapping("/api/admin/vps-requests")
    public Map<String, Object> vpsRequests(
            HttpServletRequest request,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page
    ) {
        admin.require(request);
        return admin.vpsRequests(status, q, page);
    }

    @GetMapping("/api/admin/vps-requests/{id}")
    public Map<String, Object> vpsRequest(HttpServletRequest request, @PathVariable UUID id) {
        admin.require(request);
        return admin.vpsRequest(id);
    }

    @PatchMapping("/api/admin/vps-requests/{id}")
    public Map<String, Object> updateVps(HttpServletRequest request, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        UserAccount actor = admin.require(request);
        return admin.updateVps(actor, id, body, request.getRemoteAddr());
    }

    @GetMapping("/api/admin/catalog")
    public Map<String, Object> catalog(HttpServletRequest request) {
        admin.require(request);
        return admin.plans();
    }

    @PostMapping("/api/admin/plans")
    public Map<String, Object> createPlan(HttpServletRequest request, @RequestBody Map<String, String> body) {
        UserAccount actor = admin.require(request);
        return admin.savePlan(actor, null, body, true, request.getRemoteAddr());
    }

    @PatchMapping("/api/admin/plans/{id}")
    public Map<String, Object> updatePlan(HttpServletRequest request, @PathVariable String id, @RequestBody Map<String, String> body) {
        UserAccount actor = admin.require(request);
        return admin.savePlan(actor, id, body, false, request.getRemoteAddr());
    }

    @PostMapping("/api/admin/regions")
    public Map<String, Object> createRegion(HttpServletRequest request, @RequestBody Map<String, String> body) {
        UserAccount actor = admin.require(request);
        return admin.saveRegion(actor, null, body, true, request.getRemoteAddr());
    }

    @PatchMapping("/api/admin/regions/{id}")
    public Map<String, Object> updateRegion(HttpServletRequest request, @PathVariable String id, @RequestBody Map<String, String> body) {
        UserAccount actor = admin.require(request);
        return admin.saveRegion(actor, id, body, false, request.getRemoteAddr());
    }

    @PostMapping("/api/admin/operating-systems")
    public Map<String, Object> createOs(HttpServletRequest request, @RequestBody Map<String, String> body) {
        UserAccount actor = admin.require(request);
        return admin.saveOs(actor, null, body, true, request.getRemoteAddr());
    }

    @PatchMapping("/api/admin/operating-systems/{id}")
    public Map<String, Object> updateOs(HttpServletRequest request, @PathVariable String id, @RequestBody Map<String, String> body) {
        UserAccount actor = admin.require(request);
        return admin.saveOs(actor, id, body, false, request.getRemoteAddr());
    }

    @GetMapping("/api/admin/activity")
    public Map<String, Object> activity(HttpServletRequest request, @RequestParam(defaultValue = "0") int page) {
        admin.require(request);
        return admin.activity(page);
    }

    @GetMapping("/api/admin/support/tickets")
    public Map<String, Object> tickets(HttpServletRequest request, @RequestParam(defaultValue = "0") int page) {
        admin.require(request);
        return admin.tickets(page);
    }

    @GetMapping("/api/admin/support/tickets/{id}")
    public Map<String, Object> ticket(HttpServletRequest request, @PathVariable UUID id) {
        admin.require(request);
        return admin.ticket(id);
    }

    @PostMapping("/api/admin/support/tickets/{id}/messages")
    public Map<String, Object> reply(HttpServletRequest request, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        UserAccount actor = admin.require(request);
        return admin.reply(actor, id, body, request.getRemoteAddr());
    }

    @PatchMapping("/api/admin/support/tickets/{id}")
    public Map<String, Object> updateTicket(HttpServletRequest request, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        UserAccount actor = admin.require(request);
        return admin.updateTicket(actor, id, body, request.getRemoteAddr());
    }

    @GetMapping("/api/admin/enquiries")
    public Map<String, Object> enquiries(HttpServletRequest request) {
        admin.require(request);
        return admin.enquiries();
    }

    @GetMapping("/api/admin/billing")
    public Map<String, Object> billing(HttpServletRequest request) {
        admin.require(request);
        return admin.billing();
    }

    @GetMapping("/api/admin/infrastructure")
    public Map<String, Object> infrastructure(HttpServletRequest request) {
        admin.require(request);
        return admin.infrastructure();
    }

    @GetMapping("/api/admin/notifications")
    public Map<String, Object> notifications(HttpServletRequest request, @RequestParam(defaultValue = "0") int page) {
        admin.require(request);
        return admin.notifications(page);
    }
}

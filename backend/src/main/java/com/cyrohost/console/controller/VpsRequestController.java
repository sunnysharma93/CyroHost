package com.cyrohost.console.controller;

import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.auth.exception.ApiException;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.console.security.AccountGuard;
import com.cyrohost.console.security.AccountGuard.AccountAccess;
import com.cyrohost.console.service.VpsRequestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
public class VpsRequestController {

    private final AccountGuard guard;
    private final VpsRequestService requests;
    private final UserRepository users;

    public VpsRequestController(AccountGuard guard, VpsRequestService requests, UserRepository users) {
        this.guard = guard;
        this.requests = requests;
        this.users = users;
    }

    @PostMapping("/api/vps-requests")
    public Map<String, Object> create(HttpServletRequest request, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        return requests.create(user(access), access, body, request.getRemoteAddr());
    }

    @GetMapping("/api/vps-requests")
    public Map<String, Object> list(HttpServletRequest request) {
        AccountAccess access = guard.require(request);
        return requests.mine(access.userId());
    }

    @GetMapping("/api/vps-requests/{id}")
    public Map<String, Object> one(HttpServletRequest request, @PathVariable UUID id) {
        AccountAccess access = guard.require(request);
        return requests.mineOne(access.userId(), id);
    }

    @PostMapping("/api/vps-requests/{id}/cancel")
    public Map<String, Object> cancel(HttpServletRequest request, @PathVariable UUID id) {
        AccountAccess access = guard.require(request);
        guard.allow(access, "operate");
        return requests.cancel(user(access), access, id, request.getRemoteAddr());
    }

    @PostMapping("/api/enquiries")
    public Map<String, Object> enquire(HttpServletRequest request, @RequestBody Map<String, String> body) {
        AccountAccess access = guard.require(request);
        return requests.enquire(user(access), body, request.getRemoteAddr());
    }

    private UserAccount user(AccountAccess access) {
        return users.findById(access.userId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "invalid_credentials", "Sign in to continue."));
    }
}

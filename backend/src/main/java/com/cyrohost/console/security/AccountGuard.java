package com.cyrohost.console.security;

import com.cyrohost.auth.exception.ApiException;
import com.cyrohost.auth.security.AuthCookies;
import com.cyrohost.console.entity.Account;
import com.cyrohost.console.entity.AccountMember;
import com.cyrohost.console.repository.AccountMemberRepository;
import com.cyrohost.console.repository.AccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;

@Component
public class AccountGuard {

    private final AccountRepository accounts;
    private final AccountMemberRepository members;
    private final AuthCookies cookies;

    public AccountGuard(AccountRepository accounts, AccountMemberRepository members, AuthCookies cookies) {
        this.accounts = accounts;
        this.members = members;
        this.cookies = cookies;
    }

    public AccountAccess require(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UUID userId)) {
            throw unauthorized();
        }
        if (authentication.getDetails() instanceof TokenContext token) {
            AccountMember member = members.findByAccountIdAndUserIdAndStatus(token.accountId(), userId, "ACTIVE")
                    .orElseThrow(this::unauthorized);
            return new AccountAccess(member.getAccountId(), userId, member.getRole(), null, token.scopes(), true);
        }
        UUID sessionId = authentication.getDetails() instanceof UUID id ? id : null;
        UUID requested = parse(cookies.read(request, AuthCookies.ACCOUNT));
        if (requested != null) {
            AccountMember member = members.findByAccountIdAndUserIdAndStatus(requested, userId, "ACTIVE").orElse(null);
            if (member != null) {
                return new AccountAccess(member.getAccountId(), userId, member.getRole(), sessionId, null, false);
            }
        }
        Account owned = accounts.findByOwnerUserId(userId).orElseThrow(this::unauthorized);
        return new AccountAccess(owned.getId(), userId, "OWNER", sessionId, null, false);
    }

    public AccountAccess select(UUID userId, UUID accountId) {
        AccountMember member = members.findByAccountIdAndUserIdAndStatus(accountId, userId, "ACTIVE")
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "forbidden", "You cannot open that account."));
        return new AccountAccess(member.getAccountId(), userId, member.getRole(), null, null, false);
    }

    public void allow(AccountAccess access, String action) {
        boolean roleOk = switch (action) {
            case "read" -> true;
            case "operate" -> Set.of("OWNER", "ADMIN", "MEMBER").contains(access.role());
            case "support" -> Set.of("OWNER", "ADMIN", "MEMBER", "BILLING").contains(access.role());
            case "billing" -> Set.of("OWNER", "ADMIN", "BILLING").contains(access.role());
            case "admin" -> Set.of("OWNER", "ADMIN").contains(access.role());
            case "owner" -> "OWNER".equals(access.role());
            default -> false;
        };
        boolean scopeOk = !access.token() || "read".equals(action) || (access.scopes() != null && access.scopes().contains("write"));
        if (!roleOk || !scopeOk) {
            throw new ApiException(HttpStatus.FORBIDDEN, "forbidden", "You cannot change that resource.");
        }
    }

    private static UUID parse(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private ApiException unauthorized() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "unauthorized", "Sign in to continue.");
    }

    public record AccountAccess(UUID accountId, UUID userId, String role, UUID sessionId, String scopes, boolean token) {
    }

    public record TokenContext(UUID accountId, String scopes) {
    }
}

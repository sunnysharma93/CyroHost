package com.cyrohost.console.service;

import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.auth.exception.ApiException;
import com.cyrohost.auth.exception.FieldValidationException;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.service.AdminNotifier;
import com.cyrohost.console.entity.AuditEvent;
import com.cyrohost.console.entity.CatalogOperatingSystem;
import com.cyrohost.console.entity.CatalogPlan;
import com.cyrohost.console.entity.CatalogRegion;
import com.cyrohost.console.entity.Invoice;
import com.cyrohost.console.entity.NotificationEvent;
import com.cyrohost.console.entity.Offer;
import com.cyrohost.console.entity.SupportMessage;
import com.cyrohost.console.entity.SupportTicket;
import com.cyrohost.console.entity.VpsRequest;
import com.cyrohost.console.provider.Providers.InfrastructureProvider;
import com.cyrohost.console.provider.Providers.PaymentProvider;
import com.cyrohost.console.repository.AccountRepository;
import com.cyrohost.console.repository.AuditEventRepository;
import com.cyrohost.console.repository.CatalogOperatingSystemRepository;
import com.cyrohost.console.repository.CatalogPlanRepository;
import com.cyrohost.console.repository.CatalogRegionRepository;
import com.cyrohost.console.repository.InfrastructureEnquiryRepository;
import com.cyrohost.console.repository.InvoiceRepository;
import com.cyrohost.console.repository.OfferRepository;
import com.cyrohost.console.repository.NotificationEventRepository;
import com.cyrohost.console.repository.SupportMessageRepository;
import com.cyrohost.console.repository.SupportTicketRepository;
import com.cyrohost.console.repository.VpsRequestRepository;
import com.cyrohost.console.security.AccountGuard;
import com.cyrohost.console.security.AccountGuard.AccountAccess;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class AdminPlatformService {

    private static final Set<String> AVAILABILITY = Set.of("AVAILABLE", "ENQUIRY_ONLY", "DISABLED");
    private static final Set<String> FAMILIES = Set.of("linux", "windows");
    private static final Set<String> PRIORITIES = Set.of("low", "normal", "high");
    private static final Set<String> TICKET_STATUS = Set.of("open", "closed");

    private final AccountGuard guard;
    private final AccountRepository accounts;
    private final UserRepository users;
    private final VpsRequestService requests;
    private final VpsRequestRepository requestRows;
    private final CatalogPlanRepository plans;
    private final CatalogRegionRepository regions;
    private final CatalogOperatingSystemRepository systems;
    private final AuditEventRepository audits;
    private final SupportTicketRepository tickets;
    private final SupportMessageRepository messages;
    private final InfrastructureEnquiryRepository enquiries;
    private final NotificationEventRepository notifications;
    private final InfrastructureProvider infrastructure;
    private final PaymentProvider payments;
    private final InvoiceRepository invoices;
    private final OfferRepository offers;
    private final AuditRecorder audit;
    private final AdminNotifier notices;

    public AdminPlatformService(
            AccountGuard guard,
            AccountRepository accounts,
            UserRepository users,
            VpsRequestService requests,
            VpsRequestRepository requestRows,
            CatalogPlanRepository plans,
            CatalogRegionRepository regions,
            CatalogOperatingSystemRepository systems,
            AuditEventRepository audits,
            SupportTicketRepository tickets,
            SupportMessageRepository messages,
            InfrastructureEnquiryRepository enquiries,
            NotificationEventRepository notifications,
            InfrastructureProvider infrastructure,
            PaymentProvider payments,
            InvoiceRepository invoices,
            OfferRepository offers,
            AuditRecorder audit,
            AdminNotifier notices
    ) {
        this.guard = guard;
        this.accounts = accounts;
        this.users = users;
        this.requests = requests;
        this.requestRows = requestRows;
        this.plans = plans;
        this.regions = regions;
        this.systems = systems;
        this.audits = audits;
        this.tickets = tickets;
        this.messages = messages;
        this.enquiries = enquiries;
        this.notifications = notifications;
        this.infrastructure = infrastructure;
        this.payments = payments;
        this.invoices = invoices;
        this.offers = offers;
        this.audit = audit;
        this.notices = notices;
    }

    public UserAccount require(HttpServletRequest request) {
        AccountAccess access = guard.require(request);
        UserAccount user = users.findById(access.userId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "invalid_credentials", "Sign in to continue."));
        if (!"ADMIN".equals(user.getPlatformRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "forbidden", "Admin access is required.");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> overview() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("customers", users.count());
        body.put("registrationsToday", users.countByCreatedAtAfter(Instant.now().minus(1, ChronoUnit.DAYS)));
        body.put("logins", audits.countByAction("login"));
        body.put("failedLogins", audits.countByAction("failed_login"));
        body.put("vpsRequests", requests.counts());
        body.put("openTickets", tickets.countByStatus("open"));
        body.put("infrastructure", infrastructure.connected() ? "connected" : "not_connected");
        body.put("recentActivity", audits.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 8)).map(this::activity).getContent());
        return body;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> users(String query, int page) {
        Map<String, Object> body = customers(query, page);
        body.put("adminCount", users.countByPlatformRole("ADMIN"));
        return body;
    }

    @Transactional
    public Map<String, Object> changeRole(UserAccount actor, UUID targetId, String requested, String ip, String userAgent) {
        String next = requested == null ? "" : requested.trim().toUpperCase();
        if (!next.equals("ADMIN") && !next.equals("USER")) {
            throw new FieldValidationException(Map.of("role", "Choose USER or ADMIN."));
        }
        UserAccount target = users.findById(targetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "User not found."));
        String previous = "ADMIN".equals(target.getPlatformRole()) ? "ADMIN" : "USER";
        if (previous.equals(next)) {
            return customer(target);
        }
        if ("ADMIN".equals(previous) && users.countByPlatformRole("ADMIN") <= 1) {
            throw new ApiException(HttpStatus.CONFLICT, "last_admin", "The last administrator cannot be changed to USER.");
        }
        target.setPlatformRole(next);
        users.save(target);
        String metadata = "changedBy=" + actor.getEmail()
                + ";target=" + target.getEmail()
                + ";from=" + previous
                + ";to=" + next;
        audit.record(actor.getId(), actor.getId(), "ADMIN_ROLE_CHANGED", "user", target.getId().toString(), metadata, ip, userAgent);
        notices.roleChanged(actor.getEmail(), target.getEmail(), previous, next, ip, userAgent);
        return customer(target);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> customers(String query, int page) {
        Page<UserAccount> result = users.search(clip(query), PageRequest.of(safePage(page), 20));
        return pageOf(result, result.getContent().stream().map(this::customer).toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> customer(UUID id) {
        UserAccount user = users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Customer not found."));
        Map<String, Object> body = new LinkedHashMap<>(customer(user));
        body.put("phone", user.getPhone());
        body.put("company", user.getCompany());
        body.put("timezone", user.getTimezone());
        body.put("requests", requestRows.findByUserIdOrderByCreatedAtDesc(id).stream().map(item -> requests.view(item, user, null, null, null, false, true)).toList());
        body.put("tickets", accounts.findByOwnerUserId(id)
                .map(account -> tickets.findByAccountIdOrderByUpdatedAtDesc(account.getId()).stream().map(this::ticket).toList())
                .orElse(List.of()));
        body.put("activity", audits.forCustomer(id, PageRequest.of(0, 30)).stream().map(this::activity).toList());
        return body;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> vpsRequests(String status, String query, int page) {
        Page<VpsRequest> result = requestRows.search(clip(status), clip(query), PageRequest.of(safePage(page), 20));
        return pageOf(result, result.getContent().stream().map(item -> requests.view(item, null, null, null, null, false, true)).toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> vpsRequest(UUID id) {
        VpsRequest request = requestRows.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "VPS request not found."));
        return requests.view(request, null, null, null, null, true, true);
    }

    @Transactional
    public Map<String, Object> updateVps(UserAccount admin, UUID id, Map<String, String> body, String ip) {
        return requests.adminUpdate(admin, id, required(body, "status"), body.get("adminNotes"), ip);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> plans() {
        return requests.catalog(true);
    }

    @Transactional
    public Map<String, Object> savePlan(UserAccount admin, String id, Map<String, String> body, boolean create, String ip) {
        String planId = create ? slug(required(body, "id")) : id;
        CatalogPlan plan = create ? new CatalogPlan() : plans.findById(planId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Plan not found."));
        if (create) {
            if (plans.existsById(planId)) {
                throw new FieldValidationException(Map.of("id", "That plan id is already used."));
            }
            plan.setId(planId);
            plan.setSortOrder(plans.findAll().size() + 1);
        }
        plan.setName(clean(body.get("name"), "name", 2, 40));
        plan.setPriceLabel(clean(body.get("price"), "price", 1, 32));
        plan.setCpu(number(body.get("cpu"), "cpu"));
        plan.setRamGb(number(body.get("ramGb"), "ramGb"));
        plan.setDiskGb(number(body.get("diskGb"), "diskGb"));
        plan.setTransfer(clean(body.get("transfer"), "transfer", 1, 32));
        plan.setPort(clean(body.get("port"), "port", 1, 32));
        plan.setWindowsAllowed(Boolean.parseBoolean(body.get("windows")));
        plan.setActive(body.get("active") == null || Boolean.parseBoolean(body.get("active")));
        plans.save(plan);
        audit.record(null, admin.getId(), create ? "plan_create" : "plan_update", "plan", planId, plan.getPriceLabel(), ip);
        return Map.of("id", plan.getId());
    }

    @Transactional
    public Map<String, Object> saveRegion(UserAccount admin, String id, Map<String, String> body, boolean create, String ip) {
        String regionId = create ? slug(required(body, "id")) : id;
        CatalogRegion region = create ? new CatalogRegion() : regions.findById(regionId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Region not found."));
        if (create) {
            region.setId(regionId);
            region.setSortOrder(regions.findAll().size() + 1);
        }
        String availability = required(body, "availability");
        if (!AVAILABILITY.contains(availability)) {
            throw new FieldValidationException(Map.of("availability", "Use AVAILABLE, ENQUIRY_ONLY, or DISABLED."));
        }
        region.setName(clean(body.get("name"), "name", 2, 80));
        region.setAvailability(availability);
        region.setNote(clean(body.get("note"), "note", 2, 400));
        regions.save(region);
        audit.record(null, admin.getId(), create ? "region_create" : "region_update", "region", regionId, availability, ip);
        return Map.of("id", region.getId(), "availability", availability);
    }

    @Transactional
    public Map<String, Object> saveOs(UserAccount admin, String id, Map<String, String> body, boolean create, String ip) {
        String osId = create ? slug(required(body, "id")) : id;
        CatalogOperatingSystem os = create ? new CatalogOperatingSystem() : systems.findById(osId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Operating system not found."));
        if (create) {
            os.setId(osId);
            os.setSortOrder(systems.findAll().size() + 1);
        }
        String family = required(body, "family");
        if (!FAMILIES.contains(family)) {
            throw new FieldValidationException(Map.of("family", "Use linux or windows."));
        }
        os.setName(clean(body.get("name"), "name", 2, 80));
        os.setFamily(family);
        os.setNote(clean(body.get("note"), "note", 2, 400));
        os.setActive(body.get("active") == null || Boolean.parseBoolean(body.get("active")));
        systems.save(os);
        audit.record(null, admin.getId(), create ? "os_create" : "os_update", "operating_system", osId, family, ip);
        return Map.of("id", os.getId());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> activity(int page) {
        Page<AuditEvent> result = audits.findAllByOrderByCreatedAtDesc(PageRequest.of(safePage(page), 30));
        return pageOf(result, result.getContent().stream().map(this::activity).toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> tickets(int page) {
        Page<SupportTicket> result = tickets.findAllByOrderByUpdatedAtDesc(PageRequest.of(safePage(page), 20));
        return pageOf(result, result.getContent().stream().map(this::ticket).toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> ticket(UUID id) {
        SupportTicket ticket = tickets.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Ticket not found."));
        Map<String, Object> body = new LinkedHashMap<>(ticket(ticket));
        body.put("messages", messages.findByTicketIdOrderByCreatedAtAsc(id).stream().map(message -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", message.getId());
            row.put("body", message.getBody());
            row.put("authorUserId", message.getAuthorUserId());
            row.put("internal", message.isInternalNote());
            row.put("createdAt", message.getCreatedAt());
            return row;
        }).toList());
        return body;
    }

    @Transactional
    public Map<String, Object> reply(UserAccount admin, UUID id, Map<String, String> body, String ip) {
        SupportTicket ticket = tickets.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Ticket not found."));
        String text = clean(body.get("body"), "body", 1, 4000);
        SupportMessage message = new SupportMessage();
        message.setId(UUID.randomUUID());
        message.setTicketId(ticket.getId());
        message.setAuthorUserId(admin.getId());
        message.setBody(text);
        message.setInternalNote(Boolean.parseBoolean(body.get("internal")));
        messages.save(message);
        ticket.setUpdatedAt(Instant.now());
        audit.record(ticket.getAccountId(), admin.getId(), message.isInternalNote() ? "ticket_note" : "ticket_reply", "ticket", id.toString(), null, ip);
        return ticket(id);
    }

    @Transactional
    public Map<String, Object> updateTicket(UserAccount admin, UUID id, Map<String, String> body, String ip) {
        SupportTicket ticket = tickets.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Ticket not found."));
        if (body.get("status") != null && !body.get("status").isBlank()) {
            if (!TICKET_STATUS.contains(body.get("status"))) {
                throw new FieldValidationException(Map.of("status", "Choose open or closed."));
            }
            ticket.setStatus(body.get("status"));
        }
        if (body.get("priority") != null && !body.get("priority").isBlank()) {
            if (!PRIORITIES.contains(body.get("priority"))) {
                throw new FieldValidationException(Map.of("priority", "Choose low, normal, or high."));
            }
            ticket.setPriority(body.get("priority"));
        }
        if (body.containsKey("assigneeUserId")) {
            String assignee = body.get("assigneeUserId");
            if (assignee == null || assignee.isBlank()) {
                ticket.setAssigneeUserId(null);
            } else {
                UUID assigneeId = parse(assignee);
                if (users.findById(assigneeId).isEmpty()) {
                    throw new FieldValidationException(Map.of("assigneeUserId", "Choose an existing user."));
                }
                ticket.setAssigneeUserId(assigneeId);
            }
        }
        audit.record(ticket.getAccountId(), admin.getId(), "ticket_update", "ticket", id.toString(), ticket.getStatus(), ip);
        return ticket(ticket);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> enquiries() {
        return Map.of("items", enquiries.findTop50ByOrderByCreatedAtDesc().stream().map(item -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", item.getId());
            row.put("kind", item.getKind());
            row.put("name", item.getName());
            row.put("email", item.getEmail());
            row.put("company", item.getCompany());
            row.put("region", item.getRegion());
            row.put("budget", item.getBudget());
            row.put("requirement", item.getRequirement());
            row.put("emailStatus", item.getEmailStatus());
            row.put("createdAt", item.getCreatedAt());
            return row;
        }).toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> billing() {
        return Map.of(
                "provider", payments.connected() ? "connected" : "not_configured",
                "message", payments.connected() ? "Billing provider is connected." : "Payment gateway not configured.",
                "invoices", invoices.findAll().stream().map(this::invoice).toList(),
                "offers", offers.findAll().stream().map(this::offer).toList()
        );
    }

    public Map<String, Object> infrastructure() {
        return Map.of(
                "provider", infrastructure.connected() ? "connected" : "not_connected",
                "items", List.of(),
                "message", "The infrastructure provider is not connected. Recorded hardware is not published as customer capacity."
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> notifications(int page) {
        Page<NotificationEvent> result = notifications.findAllByOrderByCreatedAtDesc(PageRequest.of(safePage(page), 30));
        return pageOf(result, result.getContent().stream().map(event -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", event.getId());
            row.put("kind", event.getKind());
            row.put("recipient", event.getRecipient());
            row.put("subject", event.getSubject());
            row.put("status", event.getStatus());
            row.put("resourceId", event.getResourceId());
            row.put("createdAt", event.getCreatedAt());
            return row;
        }).toList());
    }

    private Map<String, Object> invoice(Invoice invoice) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", invoice.getId());
        row.put("accountId", invoice.getAccountId());
        row.put("number", invoice.getNumber());
        row.put("amountCents", invoice.getAmountCents());
        row.put("currency", invoice.getCurrency());
        row.put("status", invoice.getStatus());
        row.put("issuedAt", invoice.getIssuedAt());
        return row;
    }

    private Map<String, Object> offer(Offer offer) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", offer.getId());
        row.put("code", offer.getCode());
        row.put("title", offer.getTitle());
        row.put("description", offer.getDescription());
        row.put("eligibility", offer.getEligibility());
        row.put("active", offer.isActive());
        row.put("expiresAt", offer.getExpiresAt());
        return row;
    }

    private Map<String, Object> customer(UserAccount user) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", user.getId());
        row.put("fullName", user.getFullName());
        row.put("email", user.getEmail());
        row.put("status", user.getStatus().name());
        row.put("platformRole", user.getPlatformRole());
        row.put("createdAt", user.getCreatedAt());
        row.put("lastLoginAt", user.getLastLoginAt());
        row.put("requests", requestRows.countByUserId(user.getId()));
        return row;
    }

    private Map<String, Object> ticket(SupportTicket ticket) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", ticket.getId());
        row.put("accountId", ticket.getAccountId());
        row.put("subject", ticket.getSubject());
        row.put("category", ticket.getCategory());
        row.put("priority", ticket.getPriority());
        row.put("status", ticket.getStatus());
        row.put("assigneeUserId", ticket.getAssigneeUserId());
        row.put("createdAt", ticket.getCreatedAt());
        row.put("updatedAt", ticket.getUpdatedAt());
        return row;
    }

    private Map<String, Object> activity(AuditEvent event) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", event.getId());
        row.put("userId", event.getActorUserId());
        row.put("action", event.getAction());
        row.put("resourceType", event.getResourceType());
        row.put("resourceId", event.getResourceId());
        row.put("metadata", event.getMetadata());
        row.put("ip", event.getIp());
        row.put("userAgent", event.getUserAgent());
        row.put("createdAt", event.getCreatedAt());
        return row;
    }

    private static Map<String, Object> pageOf(Page<?> page, List<?> items) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("items", items);
        body.put("page", page.getNumber());
        body.put("total", page.getTotalElements());
        return body;
    }

    private static String required(Map<String, String> body, String field) {
        String value = body.get(field);
        if (value == null || value.isBlank()) {
            throw new FieldValidationException(Map.of(field, "This field is required."));
        }
        return value.trim();
    }

    private static String clean(String value, String field, int min, int max) {
        String text = value == null ? "" : value.trim();
        if (text.length() < min || text.length() > max) {
            throw new FieldValidationException(Map.of(field, "Use " + min + " to " + max + " characters."));
        }
        return text;
    }

    private static int number(String value, String field) {
        try {
            int parsed = Integer.parseInt(value == null ? "" : value.trim());
            if (parsed < 1 || parsed > 1024) {
                throw new NumberFormatException();
            }
            return parsed;
        } catch (NumberFormatException exception) {
            throw new FieldValidationException(Map.of(field, "Enter a number from 1 to 1024."));
        }
    }

    private static String slug(String value) {
        String text = value.trim().toLowerCase();
        if (!text.matches("[a-z0-9][a-z0-9-]{1,31}")) {
            throw new FieldValidationException(Map.of("id", "Use a short lowercase id."));
        }
        return text;
    }

    private static int safePage(int page) {
        return Math.min(Math.max(page, 0), 200);
    }

    private static String clip(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        return trimmed.length() <= 80 ? trimmed : trimmed.substring(0, 80);
    }

    private static UUID parse(String value) {
        try {
            return UUID.fromString(value.trim());
        } catch (IllegalArgumentException exception) {
            throw new FieldValidationException(Map.of("assigneeUserId", "Choose an existing user."));
        }
    }
}

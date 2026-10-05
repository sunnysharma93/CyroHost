package com.cyrohost.console.service;

import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.auth.exception.ApiException;
import com.cyrohost.auth.exception.FieldValidationException;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.service.AdminNotifier;
import com.cyrohost.console.entity.CatalogOperatingSystem;
import com.cyrohost.console.entity.CatalogPlan;
import com.cyrohost.console.entity.CatalogRegion;
import com.cyrohost.console.entity.InfrastructureEnquiry;
import com.cyrohost.console.entity.VpsRequest;
import com.cyrohost.console.repository.CatalogOperatingSystemRepository;
import com.cyrohost.console.repository.CatalogPlanRepository;
import com.cyrohost.console.repository.CatalogRegionRepository;
import com.cyrohost.console.repository.InfrastructureEnquiryRepository;
import com.cyrohost.console.repository.VpsRequestRepository;
import com.cyrohost.console.security.AccountGuard.AccountAccess;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class VpsRequestService {

    private static final String WHATSAPP = "https://wa.me/919528839776?text=";
    private static final Set<String> STATUSES = Set.of("PENDING", "UNDER_REVIEW", "APPROVED", "PROVISIONING", "ACTIVE", "REJECTED", "CANCELLED");
    private static final Map<String, Set<String>> TRANSITIONS = Map.of(
            "PENDING", Set.of("UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"),
            "UNDER_REVIEW", Set.of("PENDING", "APPROVED", "REJECTED", "CANCELLED"),
            "APPROVED", Set.of("UNDER_REVIEW", "PROVISIONING", "REJECTED", "CANCELLED"),
            "PROVISIONING", Set.of("APPROVED", "ACTIVE", "REJECTED", "CANCELLED"),
            "ACTIVE", Set.of("PROVISIONING"),
            "REJECTED", Set.of("UNDER_REVIEW"),
            "CANCELLED", Set.of("UNDER_REVIEW")
    );
    private static final SecureRandom RANDOM = new SecureRandom();

    private final VpsRequestRepository requests;
    private final CatalogPlanRepository plans;
    private final CatalogRegionRepository regions;
    private final CatalogOperatingSystemRepository systems;
    private final InfrastructureEnquiryRepository enquiries;
    private final UserRepository users;
    private final AuditRecorder audit;
    private final AdminNotifier notices;

    public VpsRequestService(
            VpsRequestRepository requests,
            CatalogPlanRepository plans,
            CatalogRegionRepository regions,
            CatalogOperatingSystemRepository systems,
            InfrastructureEnquiryRepository enquiries,
            UserRepository users,
            AuditRecorder audit,
            AdminNotifier notices
    ) {
        this.requests = requests;
        this.plans = plans;
        this.regions = regions;
        this.systems = systems;
        this.enquiries = enquiries;
        this.users = users;
        this.audit = audit;
        this.notices = notices;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> catalog(boolean includeInactive) {
        List<CatalogPlan> planRows = includeInactive ? plans.findAllByOrderBySortOrderAsc() : plans.findByActiveTrueOrderBySortOrderAsc();
        List<CatalogRegion> regionRows = includeInactive ? regions.findAllByOrderBySortOrderAsc() : regions.findByAvailabilityNotOrderBySortOrderAsc("DISABLED");
        List<CatalogOperatingSystem> osRows = includeInactive ? systems.findAllByOrderBySortOrderAsc() : systems.findByActiveTrueOrderBySortOrderAsc();
        return Map.of(
                "plans", planRows.stream().map(this::planView).toList(),
                "regions", regionRows.stream().map(this::regionView).toList(),
                "operatingSystems", osRows.stream().map(this::osView).toList(),
                "payments", "not_configured",
                "infrastructure", "not_connected",
                "note", "Prices match the published VPS list stored for this console. Submitting a request does not provision a server."
        );
    }

    @Transactional
    public Map<String, Object> create(UserAccount user, AccountAccess access, Map<String, String> body, String ip) {
        CatalogPlan plan = plans.findById(required(body, "planId")).filter(CatalogPlan::isActive)
                .orElseThrow(() -> new FieldValidationException(Map.of("planId", "Choose a plan from the catalogue.")));
        CatalogRegion region = regions.findById(required(body, "regionId")).filter(item -> !"DISABLED".equals(item.getAvailability()))
                .orElseThrow(() -> new FieldValidationException(Map.of("regionId", "Choose a region from the catalogue.")));
        CatalogOperatingSystem os = systems.findById(required(body, "osId")).filter(CatalogOperatingSystem::isActive)
                .orElseThrow(() -> new FieldValidationException(Map.of("osId", "Choose an operating system from the catalogue.")));
        if ("windows".equals(os.getFamily()) && !plan.isWindowsAllowed()) {
            throw new FieldValidationException(Map.of("osId", "Nano is Linux only on the published price list."));
        }
        VpsRequest request = new VpsRequest();
        request.setId(UUID.randomUUID());
        request.setRequestNumber(nextNumber());
        request.setUserId(user.getId());
        request.setAccountId(access.accountId());
        request.setPlanId(plan.getId());
        request.setRegionId(region.getId());
        request.setOsId(os.getId());
        request.setServerName(clean(body.get("serverName"), "serverName", 2, 80));
        request.setHostname(blank(body.get("hostname"), 80));
        if ("linux".equals(os.getFamily())) {
            request.setSshPublicKey(ssh(body.get("sshPublicKey")));
        }
        if ("windows".equals(os.getFamily())) {
            request.setAdminUsername(blank(body.get("adminUsername"), 64));
        }
        request.setAdditionalRequirements(blank(body.get("additionalRequirements"), 4000));
        VpsRequest recent = requests.findFirstByUserIdAndPlanIdAndRegionIdAndOsIdAndServerNameIgnoreCaseAndStatusAndCreatedAtAfter(
                user.getId(),
                plan.getId(),
                region.getId(),
                os.getId(),
                request.getServerName(),
                "PENDING",
                Instant.now().minus(2, ChronoUnit.MINUTES)
        ).orElse(null);
        if (recent != null) {
            Map<String, Object> existing = view(recent, user, plan, region, os, true, false);
            existing.put("duplicate", true);
            return existing;
        }
        request.setStatus("PENDING");
        request.setEmailStatus("PENDING");
        requests.save(request);
        String emailStatus = notices.vpsRequest(notices.htmlRows(new String[][]{
                {"Name", user.getFullName()},
                {"Email", user.getEmail()},
                {"Request ID", request.getRequestNumber()},
                {"Plan", plan.getName() + " · " + plan.getPriceLabel()},
                {"vCPU", String.valueOf(plan.getCpu())},
                {"RAM", plan.getRamGb() + " GB"},
                {"Storage", plan.getDiskGb() + " GB NVMe"},
                {"Bandwidth", plan.getTransfer() + " · " + plan.getPort()},
                {"Region", region.getName()},
                {"Operating system", os.getName()},
                {"Server name", request.getServerName()},
                {"Hostname", text(request.getHostname())},
                {"Additional requirements", text(request.getAdditionalRequirements())},
                {"Created", request.getCreatedAt() == null ? "Just now" : request.getCreatedAt().toString()},
                {"Status", "PENDING"}
        }), request.getRequestNumber());
        request.setEmailStatus(emailStatus);
        audit.record(access, "vps_request", "vps_request", request.getId().toString(), request.getRequestNumber(), ip);
        return view(request, user, plan, region, os, true, false);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> mine(UUID userId) {
        return Map.of("items", requests.findByUserIdOrderByCreatedAtDesc(userId).stream().map(item -> view(item, null, null, null, null, false, false)).toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> recent(UUID userId) {
        return requests.findTop5ByUserIdOrderByCreatedAtDesc(userId).stream().map(item -> view(item, null, null, null, null, false, false)).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> mineOne(UUID userId, UUID id) {
        VpsRequest request = requests.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "VPS request not found."));
        return view(request, null, null, null, null, true, false);
    }

    @Transactional
    public Map<String, Object> cancel(UserAccount user, AccountAccess access, UUID id, String ip) {
        VpsRequest request = requests.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "VPS request not found."));
        if (!"PENDING".equals(request.getStatus()) && !"UNDER_REVIEW".equals(request.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "request_locked", "This request can no longer be cancelled here.");
        }
        request.setStatus("CANCELLED");
        audit.record(access, "vps_request_cancel", "vps_request", request.getId().toString(), request.getRequestNumber(), ip);
        return view(request, user, null, null, null, true, false);
    }

    @Transactional
    public Map<String, Object> enquire(UserAccount user, Map<String, String> body, String ip) {
        String kind = required(body, "kind");
        if (!Set.of("dedicated", "colocation", "enterprise").contains(kind)) {
            throw new FieldValidationException(Map.of("kind", "Choose dedicated, colocation, or enterprise."));
        }
        InfrastructureEnquiry enquiry = new InfrastructureEnquiry();
        enquiry.setId(UUID.randomUUID());
        enquiry.setUserId(user.getId());
        enquiry.setKind(kind);
        enquiry.setName(clean(body.get("name"), "name", 2, 80));
        enquiry.setEmail(user.getEmail() == null ? clean(body.get("email"), "email", 3, 320) : user.getEmail());
        enquiry.setCompany(blank(body.get("company"), 120));
        enquiry.setRegion(blank(body.get("region"), 80));
        enquiry.setBudget(blank(body.get("budget"), 80));
        enquiry.setRequirement(clean(body.get("requirement"), "requirement", 2, 4000));
        enquiry.setEmailStatus("PENDING");
        enquiries.save(enquiry);
        String status = notices.enquiry(notices.htmlRows(new String[][]{
                {"Name", enquiry.getName()},
                {"Email", enquiry.getEmail()},
                {"Company", text(enquiry.getCompany())},
                {"Kind", kind},
                {"Region", text(enquiry.getRegion())},
                {"Budget", text(enquiry.getBudget())},
                {"Requirement", enquiry.getRequirement()}
        }), enquiry.getId().toString());
        enquiry.setEmailStatus(status);
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", enquiry.getId());
        view.put("emailStatus", status);
        view.put("whatsappUrl", WHATSAPP + URLEncoder.encode(enquiryMessage(enquiry), StandardCharsets.UTF_8).replace("+", "%20"));
        view.put("message", "Enquiry saved. A server has not been reserved.");
        return view;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> counts() {
        return counts(null);
    }

    public Map<String, Object> countsFor(UUID userId) {
        return counts(userId);
    }

    private Map<String, Object> counts(UUID userId) {
        Map<String, Object> counts = new LinkedHashMap<>();
        for (String status : List.of("PENDING", "UNDER_REVIEW", "APPROVED", "PROVISIONING", "ACTIVE", "REJECTED", "CANCELLED")) {
            counts.put(status, userId == null ? requests.countByStatus(status) : requests.countByUserIdAndStatus(userId, status));
        }
        return counts;
    }

    public Page<VpsRequest> adminPage(String status, int page) {
        PageRequest request = PageRequest.of(Math.max(page, 0), 20);
        if (status == null || status.isBlank()) {
            return requests.findAllByOrderByCreatedAtDesc(request);
        }
        return requests.findByStatusOrderByCreatedAtDesc(status, request);
    }

    @Transactional
    public Map<String, Object> adminUpdate(UserAccount admin, UUID id, String status, String notes, String ip) {
        if (!STATUSES.contains(status)) {
            throw new FieldValidationException(Map.of("status", "Choose a listed status."));
        }
        VpsRequest request = requests.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "VPS request not found."));
        if (!status.equals(request.getStatus()) && !TRANSITIONS.getOrDefault(request.getStatus(), Set.of()).contains(status)) {
            throw new ApiException(HttpStatus.CONFLICT, "invalid_status", "That status change is not available from the current state.");
        }
        request.setStatus(status);
        if (notes != null) {
            request.setAdminNotes(blank(notes, 4000));
        }
        audit.record(null, admin.getId(), "vps_request_status", "vps_request", id.toString(), status, ip);
        return view(request, null, null, null, null, true, true);
    }

    public Map<String, Object> view(VpsRequest request, UserAccount user, CatalogPlan plan, CatalogRegion region, CatalogOperatingSystem os, boolean detail, boolean admin) {
        CatalogPlan resolvedPlan = plan == null ? plans.findById(request.getPlanId()).orElse(null) : plan;
        CatalogRegion resolvedRegion = region == null ? regions.findById(request.getRegionId()).orElse(null) : region;
        CatalogOperatingSystem resolvedOs = os == null ? systems.findById(request.getOsId()).orElse(null) : os;
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", request.getId());
        body.put("requestNumber", request.getRequestNumber());
        body.put("status", request.getStatus());
        body.put("planId", request.getPlanId());
        body.put("planName", resolvedPlan == null ? request.getPlanId() : resolvedPlan.getName());
        body.put("price", resolvedPlan == null ? null : resolvedPlan.getPriceLabel());
        body.put("cpu", resolvedPlan == null ? null : resolvedPlan.getCpu());
        body.put("ramGb", resolvedPlan == null ? null : resolvedPlan.getRamGb());
        body.put("diskGb", resolvedPlan == null ? null : resolvedPlan.getDiskGb());
        body.put("transfer", resolvedPlan == null ? null : resolvedPlan.getTransfer());
        body.put("port", resolvedPlan == null ? null : resolvedPlan.getPort());
        body.put("regionId", request.getRegionId());
        body.put("regionName", resolvedRegion == null ? request.getRegionId() : resolvedRegion.getName());
        body.put("regionAvailability", resolvedRegion == null ? "ENQUIRY_ONLY" : resolvedRegion.getAvailability());
        body.put("osId", request.getOsId());
        body.put("osName", resolvedOs == null ? request.getOsId() : resolvedOs.getName());
        body.put("osFamily", resolvedOs == null ? "" : resolvedOs.getFamily());
        body.put("serverName", request.getServerName());
        body.put("hostname", request.getHostname());
        body.put("hasSshKey", request.getSshPublicKey() != null);
        if (admin) {
            body.put("sshPublicKey", request.getSshPublicKey());
            body.put("adminNotes", request.getAdminNotes());
            body.put("userId", request.getUserId());
        }
        body.put("adminUsername", request.getAdminUsername());
        body.put("additionalRequirements", request.getAdditionalRequirements());
        body.put("emailStatus", request.getEmailStatus());
        body.put("createdAt", request.getCreatedAt());
        body.put("updatedAt", request.getUpdatedAt());
        body.put("provisioned", false);
        body.put("provider", "not_connected");
        if (detail) {
            UserAccount owner = user != null ? user : users.findById(request.getUserId()).orElse(null);
            String message = whatsapp(owner, request, resolvedPlan, resolvedRegion, resolvedOs);
            body.put("whatsappMessage", message);
            body.put("whatsappUrl", WHATSAPP + URLEncoder.encode(message, StandardCharsets.UTF_8).replace("+", "%20"));
            if (owner != null) {
                body.put("customerName", owner.getFullName());
                body.put("customerEmail", owner.getEmail());
            }
        }
        return body;
    }

    private String whatsapp(UserAccount user, VpsRequest request, CatalogPlan plan, CatalogRegion region, CatalogOperatingSystem os) {
        String name = user == null ? "Customer" : user.getFullName();
        String email = user == null ? "" : user.getEmail();
        return """
                Hello CyroHost Team,
                I would like to request a VPS.
                Request ID: %s
                Customer Name: %s
                Email: %s
                Plan: %s
                vCPU: %s
                RAM: %s
                Storage: %s
                Bandwidth: %s
                Region: %s
                Operating System: %s
                Server Name: %s
                Hostname: %s
                Additional Requirements:
                %s
                Please review my request and help me proceed.
                Thank you,
                %s
                """.formatted(
                request.getRequestNumber(),
                name,
                email == null ? "" : email,
                plan == null ? request.getPlanId() : plan.getName(),
                plan == null ? "" : plan.getCpu(),
                plan == null ? "" : plan.getRamGb() + " GB",
                plan == null ? "" : plan.getDiskGb() + " GB NVMe",
                plan == null ? "" : plan.getTransfer() + " · " + plan.getPort(),
                region == null ? request.getRegionId() : region.getName(),
                os == null ? request.getOsId() : os.getName(),
                request.getServerName(),
                text(request.getHostname()),
                text(request.getAdditionalRequirements()),
                name
        ).strip();
    }

    private String enquiryMessage(InfrastructureEnquiry enquiry) {
        return """
                Hello CyroHost Team,
                I would like to enquire about %s.
                Name: %s
                Email: %s
                Company: %s
                Region: %s
                Requirement:
                %s
                Thank you,
                %s
                """.formatted(enquiry.getKind(), enquiry.getName(), enquiry.getEmail(), text(enquiry.getCompany()), text(enquiry.getRegion()), enquiry.getRequirement(), enquiry.getName()).strip();
    }

    private String nextNumber() {
        for (int attempt = 0; attempt < 8; attempt++) {
            String number = "CH-VPS-" + randomToken();
            if (!requests.existsByRequestNumber(number)) {
                return number;
            }
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "server_error", "The request number could not be reserved.");
    }

    private static String randomToken() {
        final char[] alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
        char[] value = new char[6];
        for (int index = 0; index < value.length; index++) {
            value[index] = alphabet[RANDOM.nextInt(alphabet.length)];
        }
        return new String(value);
    }

    private Map<String, Object> planView(CatalogPlan plan) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", plan.getId());
        view.put("name", plan.getName());
        view.put("price", plan.getPriceLabel());
        view.put("cpu", plan.getCpu());
        view.put("ramGb", plan.getRamGb());
        view.put("diskGb", plan.getDiskGb());
        view.put("transfer", plan.getTransfer());
        view.put("port", plan.getPort());
        view.put("windows", plan.isWindowsAllowed());
        view.put("active", plan.isActive());
        return view;
    }

    private Map<String, Object> regionView(CatalogRegion region) {
        return Map.of(
                "id", region.getId(),
                "name", region.getName(),
                "availability", region.getAvailability(),
                "note", region.getNote()
        );
    }

    private Map<String, Object> osView(CatalogOperatingSystem os) {
        return Map.of("id", os.getId(), "name", os.getName(), "family", os.getFamily(), "note", os.getNote(), "active", os.isActive());
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

    private static String blank(String value, int max) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String text = value.trim();
        if (text.length() > max) {
            throw new FieldValidationException(Map.of("value", "Use " + max + " characters or fewer."));
        }
        return text;
    }

    private static String ssh(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String text = value.trim();
        if (text.length() > 2000 || !(text.startsWith("ssh-ed25519 ") || text.startsWith("ssh-rsa ") || text.startsWith("ecdsa-sha2-"))) {
            throw new FieldValidationException(Map.of("sshPublicKey", "Paste a public SSH key, or leave the field empty."));
        }
        return text;
    }

    private static String text(String value) {
        return value == null || value.isBlank() ? "None" : value;
    }
}

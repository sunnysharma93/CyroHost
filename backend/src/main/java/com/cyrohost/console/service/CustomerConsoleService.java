package com.cyrohost.console.service;

import com.cyrohost.auth.entity.RefreshSession;
import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.auth.exception.ApiException;
import com.cyrohost.auth.exception.FieldValidationException;
import com.cyrohost.auth.repository.RefreshSessionRepository;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.security.Emails;
import com.cyrohost.auth.security.Passwords;
import com.cyrohost.auth.security.TokenHasher;
import com.cyrohost.auth.service.AdminNotifier;
import com.cyrohost.auth.service.MailService;
import com.cyrohost.console.catalog.PublishedCatalog;
import com.cyrohost.console.catalog.PublishedCatalog.OsTemplate;
import com.cyrohost.console.catalog.PublishedCatalog.Plan;
import com.cyrohost.console.catalog.PublishedCatalog.Region;
import com.cyrohost.console.entity.Account;
import com.cyrohost.console.entity.AccountMember;
import com.cyrohost.console.entity.ApiToken;
import com.cyrohost.console.entity.AuditEvent;
import com.cyrohost.console.entity.CustomerServer;
import com.cyrohost.console.entity.DnsRecord;
import com.cyrohost.console.entity.DnsZone;
import com.cyrohost.console.entity.Invoice;
import com.cyrohost.console.entity.Offer;
import com.cyrohost.console.entity.ServerGroup;
import com.cyrohost.console.entity.ServerGroupMember;
import com.cyrohost.console.entity.SupportMessage;
import com.cyrohost.console.entity.SupportTicket;
import com.cyrohost.console.provider.Providers.DnsProvider;
import com.cyrohost.console.provider.Providers.InfrastructureProvider;
import com.cyrohost.console.provider.Providers.PaymentProvider;
import com.cyrohost.console.provider.Providers.StorageProvider;
import com.cyrohost.console.repository.AccountMemberRepository;
import com.cyrohost.console.repository.AccountRepository;
import com.cyrohost.console.repository.ApiTokenRepository;
import com.cyrohost.console.repository.AuditEventRepository;
import com.cyrohost.console.repository.CustomerServerRepository;
import com.cyrohost.console.repository.DnsRecordRepository;
import com.cyrohost.console.repository.DnsZoneRepository;
import com.cyrohost.console.repository.InvoiceRepository;
import com.cyrohost.console.repository.OfferRepository;
import com.cyrohost.console.repository.ServerGroupMemberRepository;
import com.cyrohost.console.repository.ServerGroupRepository;
import com.cyrohost.console.repository.SupportMessageRepository;
import com.cyrohost.console.repository.SupportTicketRepository;
import com.cyrohost.console.security.AccountGuard.AccountAccess;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class CustomerConsoleService {

    private static final Set<String> SORTS = Set.of("createdAt", "name", "status");
    private static final Set<String> ROLES = Set.of("ADMIN", "BILLING", "MEMBER", "VIEWER");
    private static final Set<String> PRIORITIES = Set.of("low", "normal", "high");
    private static final Set<String> CATEGORIES = Set.of("account", "billing", "servers", "network", "other");
    private static final Set<String> DNS_TYPES = Set.of("A", "AAAA", "CNAME", "MX", "TXT", "NS");
    private static final Pattern HOST = Pattern.compile("^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$");
    private static final Pattern IPV4 = Pattern.compile("^(?:\\d{1,3}\\.){3}\\d{1,3}$");

    private final CustomerServerRepository servers;
    private final ServerGroupRepository groups;
    private final ServerGroupMemberRepository groupMembers;
    private final SupportTicketRepository tickets;
    private final SupportMessageRepository messages;
    private final DnsZoneRepository zones;
    private final DnsRecordRepository records;
    private final InvoiceRepository invoices;
    private final OfferRepository offers;
    private final ApiTokenRepository tokens;
    private final AccountRepository accounts;
    private final AccountMemberRepository members;
    private final AuditEventRepository auditEvents;
    private final UserRepository users;
    private final RefreshSessionRepository sessions;
    private final PasswordEncoder encoder;
    private final MailService mail;
    private final AuditRecorder audit;
    private final InfrastructureProvider infrastructure;
    private final DnsProvider dns;
    private final StorageProvider storage;
    private final PaymentProvider payments;
    private final VpsRequestService vps;
    private final AdminNotifier notices;

    public CustomerConsoleService(
            CustomerServerRepository servers,
            ServerGroupRepository groups,
            ServerGroupMemberRepository groupMembers,
            SupportTicketRepository tickets,
            SupportMessageRepository messages,
            DnsZoneRepository zones,
            DnsRecordRepository records,
            InvoiceRepository invoices,
            OfferRepository offers,
            ApiTokenRepository tokens,
            AccountRepository accounts,
            AccountMemberRepository members,
            AuditEventRepository auditEvents,
            UserRepository users,
            RefreshSessionRepository sessions,
            PasswordEncoder encoder,
            MailService mail,
            AuditRecorder audit,
            InfrastructureProvider infrastructure,
            DnsProvider dns,
            StorageProvider storage,
            PaymentProvider payments,
            VpsRequestService vps,
            AdminNotifier notices
    ) {
        this.servers = servers;
        this.groups = groups;
        this.groupMembers = groupMembers;
        this.tickets = tickets;
        this.messages = messages;
        this.zones = zones;
        this.records = records;
        this.invoices = invoices;
        this.offers = offers;
        this.tokens = tokens;
        this.accounts = accounts;
        this.members = members;
        this.auditEvents = auditEvents;
        this.users = users;
        this.sessions = sessions;
        this.encoder = encoder;
        this.mail = mail;
        this.audit = audit;
        this.infrastructure = infrastructure;
        this.dns = dns;
        this.storage = storage;
        this.payments = payments;
        this.vps = vps;
        this.notices = notices;
    }

    public Map<String, Object> catalog() {
        return vps.catalog(false);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> dashboard(AccountAccess access, UserAccount user) {
        long requested = servers.countByAccountIdAndStatus(access.accountId(), "requested");
        long running = servers.countByAccountIdAndStatus(access.accountId(), "running");
        long stopped = servers.countByAccountIdAndStatus(access.accountId(), "stopped");
        long total = servers.countByAccountIdAndStatusNot(access.accountId(), "cancelled");
        int cpu = 0;
        int ram = 0;
        int disk = 0;
        for (CustomerServer server : servers.findByAccountIdAndStatusNotOrderByCreatedAtDesc(access.accountId(), "cancelled")) {
            Plan plan = PublishedCatalog.plan(server.getPlanCode()).orElse(null);
            if (plan != null && "requested".equals(server.getStatus())) {
                cpu += plan.cpu();
                ram += plan.ramGb();
                disk += plan.diskGb();
            }
        }
        Account account = accounts.findById(access.accountId()).orElseThrow(this::missingAccount);
        Map<String, Object> userView = new LinkedHashMap<>();
        userView.put("fullName", user.getFullName());
        userView.put("email", user.getEmail());
        userView.put("status", user.getStatus().name());
        userView.put("platformRole", user.getPlatformRole());
        userView.put("createdAt", user.getCreatedAt());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("account", Map.of("id", account.getId(), "name", account.getName(), "role", access.role()));
        body.put("user", userView);
        body.put("servers", Map.of("total", total, "running", running, "stopped", stopped, "pending", requested));
        body.put("allocation", Map.of(
                "cpu", cpu,
                "ramGb", ram,
                "diskGb", disk,
                "note", "Sum of plans on open server requests. This is not live usage."
        ));
        body.put("usage", Map.of("connected", false, "message", "Usage metrics are not connected."));
        body.put("infrastructure", Map.of(
                "connected", infrastructure.connected(),
                "message", infrastructure.connected()
                        ? "Infrastructure provider is connected."
                        : "Infrastructure provider is not connected. This console does not show live capacity or power state."
        ));
        body.put("vpsRequests", vps.countsFor(user.getId()));
        body.put("recentVpsRequests", vps.recent(user.getId()));
        body.put("billing", Map.of("connected", payments.connected()));
        body.put("recentActivity", auditEvents.findTop8ByAccountIdOrderByCreatedAtDesc(access.accountId()).stream().map(this::activity).toList());
        body.put("recentInvoices", invoices.findTop5ByAccountIdOrderByIssuedAtDesc(access.accountId()).stream().map(this::invoiceView).toList());
        body.put("recentTickets", tickets.findTop5ByAccountIdOrderByUpdatedAtDesc(access.accountId()).stream().map(this::ticketView).toList());
        return body;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> servers(AccountAccess access, String query, String status, int page, int size, String sort, String direction) {
        int safeSize = Math.min(Math.max(size, 1), 50);
        int safePage = Math.max(page, 0);
        String field = SORTS.contains(sort) ? sort : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<CustomerServer> result = servers.search(
                access.accountId(),
                status == null ? "" : status,
                query == null ? "" : query.trim(),
                PageRequest.of(safePage, safeSize, Sort.by(dir, field))
        );
        return Map.of(
                "items", result.getContent().stream().map(this::serverView).toList(),
                "page", result.getNumber(),
                "size", result.getSize(),
                "total", result.getTotalElements(),
                "provider", infrastructure.connected() ? "connected" : "not_connected",
                "message", "Rows are account requests. No address or power state is reported until the infrastructure provider is connected."
        );
    }

    @Transactional
    public Map<String, Object> createServer(AccountAccess access, Map<String, String> body, String ip) {
        Plan plan = PublishedCatalog.plan(required(body, "planId")).orElseThrow(() -> new FieldValidationException(Map.of("planId", "Choose a published plan.")));
        Region region = PublishedCatalog.region(required(body, "regionId")).orElseThrow(() -> new FieldValidationException(Map.of("regionId", "Choose a published region.")));
        OsTemplate os = PublishedCatalog.os(required(body, "os")).orElseThrow(() -> new FieldValidationException(Map.of("os", "Choose Linux or Windows Server.")));
        if ("windows".equals(os.id()) && !plan.windows()) {
            throw new FieldValidationException(Map.of("os", "Nano is Linux only on the published price list."));
        }
        String name = cleanName(body.get("name"), "name");
        String hostname = hostname(body.get("hostname"));
        String key = ssh(body.get("sshPublicKey"));
        CustomerServer server = new CustomerServer();
        server.setId(UUID.randomUUID());
        server.setAccountId(access.accountId());
        server.setName(name);
        server.setHostname(hostname);
        server.setPlanCode(plan.id());
        server.setRegionCode(region.id());
        server.setOsFamily(os.id());
        server.setStatus("requested");
        server.setSshPublicKey(key);
        servers.save(server);
        audit.record(access, "server_request", "server", server.getId().toString(), plan.id() + " " + region.id(), ip);
        return serverView(server);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> server(AccountAccess access, UUID id) {
        return serverView(ownedServer(access, id));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> serverActivity(AccountAccess access, UUID id) {
        ownedServer(access, id);
        return Map.of(
                "items",
                auditEvents.findTop20ByAccountIdAndResourceTypeAndResourceIdOrderByCreatedAtDesc(access.accountId(), "server", id.toString())
                        .stream()
                        .map(this::activity)
                        .toList()
        );
    }

    @Transactional
    public Map<String, Object> updateServer(AccountAccess access, UUID id, Map<String, String> body, String ip) {
        CustomerServer server = ownedServer(access, id);
        if (!"requested".equals(server.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "server_locked", "This request can no longer be edited.");
        }
        if (body.get("name") != null) {
            server.setName(cleanName(body.get("name"), "name"));
        }
        if (body.get("hostname") != null) {
            server.setHostname(hostname(body.get("hostname")));
        }
        if (body.containsKey("sshPublicKey")) {
            server.setSshPublicKey(ssh(body.get("sshPublicKey")));
        }
        audit.record(access, "server_update", "server", server.getId().toString(), null, ip);
        return serverView(server);
    }

    @Transactional
    public void cancelServer(AccountAccess access, UUID id, String ip) {
        CustomerServer server = ownedServer(access, id);
        if (!"requested".equals(server.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "server_locked", "Only an unprovisioned request can be cancelled here.");
        }
        server.setStatus("cancelled");
        audit.record(access, "server_cancel", "server", server.getId().toString(), null, ip);
    }

    public void power(AccountAccess access, UUID id, String action, String ip) {
        CustomerServer server = ownedServer(access, id);
        audit.record(access, "server_" + action + "_refused", "server", server.getId().toString(), "provider_not_connected", ip);
        switch (action) {
            case "start" -> infrastructure.start(server.getId());
            case "stop" -> infrastructure.stop(server.getId());
            case "restart" -> infrastructure.restart(server.getId());
            case "console", "reinstall" -> throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "provider_not_connected", "Infrastructure provider is not connected.");
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_action", "That server action is not available.");
        }
    }

    @Transactional
    public Map<String, Object> createGroup(AccountAccess access, String name, String ip) {
        String clean = cleanName(name, "name");
        if (groups.existsByAccountIdAndNameIgnoreCase(access.accountId(), clean)) {
            throw new ApiException(HttpStatus.CONFLICT, "group_exists", "A group with that name already exists.");
        }
        ServerGroup group = new ServerGroup();
        group.setId(UUID.randomUUID());
        group.setAccountId(access.accountId());
        group.setName(clean);
        groups.save(group);
        audit.record(access, "group_create", "server_group", group.getId().toString(), null, ip);
        return groupView(group);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> groups(AccountAccess access) {
        return Map.of("items", groups.findByAccountIdOrderByCreatedAtAsc(access.accountId()).stream().map(this::groupView).toList());
    }

    @Transactional
    public Map<String, Object> renameGroup(AccountAccess access, UUID id, String name, String ip) {
        ServerGroup group = ownedGroup(access, id);
        String clean = cleanName(name, "name");
        if (!group.getName().equalsIgnoreCase(clean) && groups.existsByAccountIdAndNameIgnoreCase(access.accountId(), clean)) {
            throw new ApiException(HttpStatus.CONFLICT, "group_exists", "A group with that name already exists.");
        }
        group.setName(clean);
        audit.record(access, "group_rename", "server_group", group.getId().toString(), null, ip);
        return groupView(group);
    }

    @Transactional
    public void deleteGroup(AccountAccess access, UUID id, String ip) {
        ServerGroup group = ownedGroup(access, id);
        groups.delete(group);
        audit.record(access, "group_delete", "server_group", id.toString(), null, ip);
    }

    @Transactional
    public Map<String, Object> assignServer(AccountAccess access, UUID groupId, UUID serverId, String ip) {
        ServerGroup group = ownedGroup(access, groupId);
        ownedServer(access, serverId);
        if (groupMembers.findById(new ServerGroupMember.Key(groupId, serverId)).isEmpty()) {
            ServerGroupMember member = new ServerGroupMember();
            member.setGroupId(groupId);
            member.setServerId(serverId);
            groupMembers.save(member);
        }
        audit.record(access, "group_assign", "server_group", group.getId().toString(), serverId.toString(), ip);
        return groupView(group);
    }

    @Transactional
    public void unassignServer(AccountAccess access, UUID groupId, UUID serverId, String ip) {
        ownedGroup(access, groupId);
        groupMembers.deleteByGroupIdAndServerId(groupId, serverId);
        audit.record(access, "group_unassign", "server_group", groupId.toString(), serverId.toString(), ip);
    }

    @Transactional
    public Map<String, Object> createTicket(AccountAccess access, Map<String, String> body, String ip) {
        String subject = cleanName(body.get("subject"), "subject");
        if (subject.length() > 160) {
            throw new FieldValidationException(Map.of("subject", "Use 160 characters or fewer."));
        }
        String category = value(body.get("category"), CATEGORIES, "category");
        String priority = value(body.get("priority"), PRIORITIES, "priority");
        String text = messageBody(body.get("body"));
        SupportTicket ticket = new SupportTicket();
        ticket.setId(UUID.randomUUID());
        ticket.setAccountId(access.accountId());
        ticket.setSubject(subject);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus("open");
        tickets.save(ticket);
        saveMessage(ticket, access.userId(), text);
        audit.record(access, "ticket_create", "ticket", ticket.getId().toString(), category, ip);
        UserAccount author = users.findById(access.userId()).orElse(null);
        notices.support(notices.htmlRows(new String[][]{
                {"Customer", author == null ? "Customer" : author.getFullName()},
                {"Email", author == null ? "" : author.getEmail()},
                {"Subject", subject},
                {"Category", category},
                {"Priority", priority},
                {"Ticket", ticket.getId().toString()}
        }), ticket.getId().toString());
        return ticketDetail(ticket);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> tickets(AccountAccess access) {
        return Map.of("items", tickets.findByAccountIdOrderByUpdatedAtDesc(access.accountId()).stream().map(this::ticketView).toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> ticket(AccountAccess access, UUID id) {
        return ticketDetail(ownedTicket(access, id));
    }

    @Transactional
    public Map<String, Object> reply(AccountAccess access, UUID id, String body, String ip) {
        SupportTicket ticket = ownedTicket(access, id);
        if ("closed".equals(ticket.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "ticket_closed", "Reopen the ticket before replying.");
        }
        saveMessage(ticket, access.userId(), messageBody(body));
        ticket.setUpdatedAt(Instant.now());
        audit.record(access, "ticket_reply", "ticket", ticket.getId().toString(), null, ip);
        return ticketDetail(ticket);
    }

    @Transactional
    public Map<String, Object> ticketStatus(AccountAccess access, UUID id, String status, String ip) {
        SupportTicket ticket = ownedTicket(access, id);
        if (!"open".equals(status) && !"closed".equals(status)) {
            throw new FieldValidationException(Map.of("status", "Choose open or closed."));
        }
        ticket.setStatus(status);
        audit.record(access, "closed".equals(status) ? "ticket_close" : "ticket_reopen", "ticket", ticket.getId().toString(), null, ip);
        return ticketDetail(ticket);
    }

    @Transactional
    public Map<String, Object> createZone(AccountAccess access, String name, String ip) {
        String zoneName = zoneName(name);
        if (zones.existsByAccountIdAndNameIgnoreCase(access.accountId(), zoneName)) {
            throw new ApiException(HttpStatus.CONFLICT, "zone_exists", "That zone is already saved for this account.");
        }
        DnsZone zone = new DnsZone();
        zone.setId(UUID.randomUUID());
        zone.setAccountId(access.accountId());
        zone.setName(zoneName);
        zones.save(zone);
        audit.record(access, "dns_zone_create", "dns_zone", zone.getId().toString(), zoneName, ip);
        return zoneView(zone);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> zones(AccountAccess access) {
        return Map.of(
                "items", zones.findByAccountIdOrderByNameAsc(access.accountId()).stream().map(this::zoneView).toList(),
                "provider", dns.connected() ? "connected" : "not_connected",
                "published", false,
                "message", "Zones are stored for this account. They are not published to a DNS provider."
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> zone(AccountAccess access, UUID id) {
        DnsZone zone = ownedZone(access, id);
        Map<String, Object> view = new LinkedHashMap<>(zoneView(zone));
        view.put("records", records.findByZoneIdOrderByHostAsc(zone.getId()).stream().map(this::recordView).toList());
        return view;
    }

    @Transactional
    public Map<String, Object> deleteZone(AccountAccess access, UUID id, String ip) {
        DnsZone zone = ownedZone(access, id);
        zones.delete(zone);
        audit.record(access, "dns_zone_delete", "dns_zone", id.toString(), zone.getName(), ip);
        return Map.of("deleted", true);
    }

    @Transactional
    public Map<String, Object> addRecord(AccountAccess access, UUID zoneId, Map<String, String> body, String ip) {
        DnsZone zone = ownedZone(access, zoneId);
        DnsRecord record = new DnsRecord();
        record.setId(UUID.randomUUID());
        record.setZoneId(zone.getId());
        record.setRecordType(dnsType(body.get("type")));
        record.setHost(dnsHost(body.get("host")));
        record.setRecordValue(dnsValue(record.getRecordType(), body.get("value")));
        record.setTtl(ttl(body.get("ttl")));
        records.save(record);
        audit.record(access, "dns_record_create", "dns_record", record.getId().toString(), record.getRecordType(), ip);
        return recordView(record);
    }

    @Transactional
    public Map<String, Object> updateRecord(AccountAccess access, UUID zoneId, UUID recordId, Map<String, String> body, String ip) {
        ownedZone(access, zoneId);
        DnsRecord record = records.findByIdAndZoneId(recordId, zoneId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "DNS record not found."));
        record.setRecordType(dnsType(body.get("type")));
        record.setHost(dnsHost(body.get("host")));
        record.setRecordValue(dnsValue(record.getRecordType(), body.get("value")));
        record.setTtl(ttl(body.get("ttl")));
        audit.record(access, "dns_record_update", "dns_record", record.getId().toString(), record.getRecordType(), ip);
        return recordView(record);
    }

    @Transactional
    public void deleteRecord(AccountAccess access, UUID zoneId, UUID recordId, String ip) {
        ownedZone(access, zoneId);
        DnsRecord record = records.findByIdAndZoneId(recordId, zoneId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "DNS record not found."));
        records.delete(record);
        audit.record(access, "dns_record_delete", "dns_record", recordId.toString(), null, ip);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> invoices(AccountAccess access) {
        return Map.of(
                "items", invoices.findByAccountIdOrderByIssuedAtDesc(access.accountId()).stream().map(this::invoiceView).toList(),
                "provider", payments.connected() ? "connected" : "not_configured",
                "message", payments.connected() ? "" : "Billing provider is not configured. No invoices have been issued for this account."
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> invoice(AccountAccess access, UUID id) {
        Invoice invoice = invoices.findByIdAndAccountId(id, access.accountId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Invoice not found."));
        return invoiceView(invoice);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> wallet() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("provider", payments.connected() ? "connected" : "not_configured");
        body.put("balance", null);
        body.put("transactions", List.of());
        body.put("message", "Billing provider is not configured. No balance or payment is shown.");
        return body;
    }

    public void topUp() {
        throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "payment_not_configured", "Billing provider is not configured.");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> offers() {
        List<Offer> active = offers.findByActiveTrueOrderByTitleAsc().stream()
                .filter(offer -> offer.getExpiresAt() == null || offer.getExpiresAt().isAfter(Instant.now()))
                .toList();
        return Map.of(
                "items", active.stream().map(this::offerView).toList(),
                "provider", payments.connected() ? "connected" : "not_configured",
                "message", active.isEmpty() ? "No offers are configured for CyroHost." : "An offer can be stored here. It is not applied until a billing provider is connected."
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> applyOffer(String code) {
        offers.findByCodeIgnoreCaseAndActiveTrue(code == null ? "" : code.trim())
                .filter(offer -> offer.getExpiresAt() == null || offer.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "offer_not_found", "That coupon is not active."));
        throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "payment_not_configured", "Billing provider is not configured, so this coupon cannot be applied.");
    }

    public Map<String, Object> providerState(String area) {
        boolean connected = switch (area) {
            case "storage", "volumes" -> storage.connected();
            case "dns" -> dns.connected();
            case "billing" -> payments.connected();
            default -> infrastructure.connected();
        };
        String message = switch (area) {
            case "addresses" -> "No IP addresses are assigned. Address allocation needs the infrastructure provider.";
            case "cdn" -> "CDN and load balancing are not connected. No site, origin, or traffic figure is available.";
            case "proxy" -> "The proxy provider is not connected. No domain or SSL status is available.";
            case "ddos" -> "Protection telemetry will appear once the infrastructure provider is connected. No attack data is available.";
            case "storage" -> "Object storage is not connected. Buckets and keys are not created from this console.";
            case "volumes" -> "Block storage is not connected. No volume is attached.";
            case "dedicated" -> "Dedicated and colocation inventory is not connected. Ask CyroHost for a quote. Hardware is not listed as available capacity.";
            default -> "This service is not connected.";
        };
        return Map.of("provider", connected ? "connected" : "not_connected", "items", List.of(), "message", message);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> profile(UserAccount user, AccountAccess access) {
        Account account = accounts.findById(access.accountId()).orElseThrow(this::missingAccount);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("fullName", user.getFullName());
        body.put("email", user.getEmail());
        body.put("phone", user.getPhone());
        body.put("company", user.getCompany());
        body.put("timezone", user.getTimezone());
        body.put("status", user.getStatus().name());
        body.put("role", access.role());
        body.put("accountName", account.getName());
        body.put("emailChange", "Email changes require a verification message. Mail delivery is " + (mail.canSend() ? "configured." : "not configured, so the address stays as it is."));
        return body;
    }

    @Transactional
    public Map<String, Object> updateProfile(UserAccount user, AccountAccess access, Map<String, String> body, String ip) {
        if (body.get("fullName") != null) {
            user.setFullName(cleanName(body.get("fullName"), "fullName"));
        }
        if (body.containsKey("phone")) {
            user.setPhone(optional(body.get("phone"), 32, "phone"));
        }
        if (body.containsKey("company")) {
            user.setCompany(optional(body.get("company"), 120, "company"));
        }
        if (body.get("timezone") != null) {
            String zone = body.get("timezone").trim();
            if (zone.length() < 3 || zone.length() > 64 || zone.contains(" ")) {
                throw new FieldValidationException(Map.of("timezone", "Enter a timezone such as Asia/Kolkata."));
            }
            user.setTimezone(zone);
        }
        if (body.get("email") != null && user.getEmail() != null && !Emails.normalize(body.get("email")).equals(user.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "email_verification_required", "Email changes need a verification message, which is not sent until mail delivery is configured.");
        }
        audit.record(access, "profile_update", "user", user.getId().toString(), null, ip);
        return profile(user, access);
    }

    @Transactional
    public void changePassword(UserAccount user, AccountAccess access, String current, String next, String confirm, String ip) {
        if (user.getPasswordHash() == null || !encoder.matches(current == null ? "" : current, user.getPasswordHash())) {
            throw new FieldValidationException(Map.of("currentPassword", "The current password is incorrect."));
        }
        Passwords.check(next, confirm, user.getEmail());
        user.setPasswordHash(encoder.encode(next));
        audit.record(access, "password_change", "user", user.getId().toString(), null, ip);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> sessions(AccountAccess access) {
        List<Map<String, Object>> items = sessions.findByUserIdOrderByCreatedAtDesc(access.userId()).stream()
                .filter(session -> session.getRevokedAt() == null && session.getExpiresAt().isAfter(Instant.now()))
                .map(session -> sessionView(session, access.sessionId()))
                .toList();
        return Map.of("items", items);
    }

    @Transactional
    public void revokeOthers(AccountAccess access, String ip) {
        if (access.sessionId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "session_required", "Sign in with the browser session to revoke other sessions.");
        }
        sessions.revokeOthers(access.userId(), access.sessionId(), Instant.now());
        audit.record(access, "sessions_revoke_others", "session", access.sessionId().toString(), null, ip);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> members(AccountAccess access, UserAccount user) {
        return Map.of(
                "items", members.findByAccountIdOrderByCreatedAtAsc(access.accountId()).stream().map(this::memberView).toList(),
                "invitations", members.findByEmailIgnoreCaseAndStatus(user.getEmail() == null ? "" : user.getEmail(), "INVITED").stream().map(this::memberView).toList(),
                "mail", mail.canSend() ? "configured" : "not_configured"
        );
    }

    @Transactional
    public Map<String, Object> invite(AccountAccess access, String email, String role, String ip) {
        String normalized = Emails.normalize(email == null ? "" : email);
        if (!normalized.contains("@")) {
            throw new FieldValidationException(Map.of("email", "Enter a valid email address."));
        }
        if (!ROLES.contains(role)) {
            throw new FieldValidationException(Map.of("role", "Choose Admin, Billing, Member, or Viewer."));
        }
        if (members.existsByAccountIdAndEmailIgnoreCase(access.accountId(), normalized)) {
            throw new ApiException(HttpStatus.CONFLICT, "member_exists", "That email is already on this account.");
        }
        AccountMember member = new AccountMember();
        member.setId(UUID.randomUUID());
        member.setAccountId(access.accountId());
        member.setEmail(normalized);
        member.setRole(role);
        member.setStatus("INVITED");
        users.findByEmail(normalized).ifPresent(existing -> member.setUserId(existing.getId()));
        members.save(member);
        Account account = accounts.findById(access.accountId()).orElseThrow(this::missingAccount);
        boolean sent = mail.sendInvite(normalized, account.getName());
        audit.record(access, "member_invite", "member", member.getId().toString(), role, ip);
        Map<String, Object> view = new LinkedHashMap<>(memberView(member));
        view.put("emailSent", sent);
        view.put("message", sent ? "Invitation email sent." : "Invitation saved. Email delivery is not configured, so nobody has been notified.");
        return view;
    }

    @Transactional
    public Map<String, Object> acceptInvite(UserAccount user, UUID id, String ip) {
        AccountMember member = members.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Invitation not found."));
        if (!"INVITED".equals(member.getStatus()) || user.getEmail() == null || !user.getEmail().equalsIgnoreCase(member.getEmail())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "not_found", "Invitation not found.");
        }
        member.setUserId(user.getId());
        member.setStatus("ACTIVE");
        audit.record(member.getAccountId(), user.getId(), "member_accept", "member", member.getId().toString(), member.getRole(), ip);
        return memberView(member);
    }

    @Transactional
    public void removeMember(AccountAccess access, UUID id, String ip) {
        AccountMember member = members.findByIdAndAccountId(id, access.accountId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Member not found."));
        if ("OWNER".equals(member.getRole())) {
            throw new ApiException(HttpStatus.CONFLICT, "owner_locked", "The account owner cannot be removed.");
        }
        members.delete(member);
        audit.record(access, "member_remove", "member", id.toString(), null, ip);
    }

    @Transactional
    public Map<String, Object> createToken(AccountAccess access, String name, String scope, Integer days, String ip) {
        String clean = cleanName(name, "name");
        String scopes = "write".equals(scope) ? "read,write" : "read";
        String raw = "cyro_" + TokenHasher.random();
        ApiToken token = new ApiToken();
        token.setId(UUID.randomUUID());
        token.setAccountId(access.accountId());
        token.setCreatedBy(access.userId());
        token.setName(clean);
        token.setTokenHash(TokenHasher.sha256(raw));
        token.setTokenPrefix(raw.substring(0, 12));
        token.setScopes(scopes);
        if (days != null) {
            if (days < 1 || days > 365) {
                throw new FieldValidationException(Map.of("days", "Choose an expiry from 1 to 365 days, or leave it empty."));
            }
            token.setExpiresAt(Instant.now().plus(days, ChronoUnit.DAYS));
        }
        tokens.save(token);
        audit.record(access, "token_create", "api_token", token.getId().toString(), scopes, ip);
        Map<String, Object> view = new LinkedHashMap<>(tokenView(token));
        view.put("token", raw);
        view.put("message", "Copy this token now. CyroHost stores only a hash and cannot show it again.");
        return view;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> tokens(AccountAccess access) {
        return Map.of("items", tokens.findByAccountIdOrderByCreatedAtDesc(access.accountId()).stream().map(this::tokenView).toList());
    }

    @Transactional
    public void revokeToken(AccountAccess access, UUID id, String ip) {
        ApiToken token = tokens.findByIdAndAccountId(id, access.accountId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "API token not found."));
        if (token.getRevokedAt() == null) {
            token.setRevokedAt(Instant.now());
        }
        audit.record(access, "token_revoke", "api_token", id.toString(), null, ip);
    }

    private Map<String, Object> serverView(CustomerServer server) {
        Plan plan = PublishedCatalog.plan(server.getPlanCode()).orElse(null);
        Region region = PublishedCatalog.region(server.getRegionCode()).orElse(null);
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", server.getId());
        view.put("name", server.getName());
        view.put("hostname", server.getHostname());
        view.put("status", server.getStatus());
        view.put("planCode", server.getPlanCode());
        view.put("planName", plan == null ? server.getPlanCode() : plan.name());
        view.put("price", plan == null ? null : plan.price());
        view.put("cpu", plan == null ? null : plan.cpu());
        view.put("ramGb", plan == null ? null : plan.ramGb());
        view.put("diskGb", plan == null ? null : plan.diskGb());
        view.put("transfer", plan == null ? null : plan.transfer());
        view.put("port", plan == null ? null : plan.port());
        view.put("regionCode", server.getRegionCode());
        view.put("regionName", region == null ? server.getRegionCode() : region.name());
        view.put("osFamily", server.getOsFamily());
        view.put("hasSshKey", server.getSshPublicKey() != null);
        view.put("createdAt", server.getCreatedAt());
        view.put("updatedAt", server.getUpdatedAt());
        view.put("ip", null);
        view.put("metrics", null);
        view.put("provider", infrastructure.connected() ? "connected" : "not_connected");
        return view;
    }

    private Map<String, Object> groupView(ServerGroup group) {
        List<UUID> serverIds = groupMembers.findByGroupId(group.getId()).stream().map(ServerGroupMember::getServerId).toList();
        return Map.of("id", group.getId(), "name", group.getName(), "serverIds", serverIds, "createdAt", group.getCreatedAt());
    }

    private Map<String, Object> ticketView(SupportTicket ticket) {
        return Map.of(
                "id", ticket.getId(),
                "subject", ticket.getSubject(),
                "category", ticket.getCategory(),
                "priority", ticket.getPriority(),
                "status", ticket.getStatus(),
                "createdAt", ticket.getCreatedAt(),
                "updatedAt", ticket.getUpdatedAt()
        );
    }

    private Map<String, Object> ticketDetail(SupportTicket ticket) {
        Map<String, Object> view = new LinkedHashMap<>(ticketView(ticket));
        view.put("messages", messages.findByTicketIdOrderByCreatedAtAsc(ticket.getId()).stream()
                .filter(message -> !message.isInternalNote())
                .map(message -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", message.getId());
                    row.put("body", message.getBody());
                    row.put("authorUserId", message.getAuthorUserId());
                    row.put("createdAt", message.getCreatedAt());
                    return row;
                }).toList());
        return view;
    }

    private Map<String, Object> zoneView(DnsZone zone) {
        return Map.of(
                "id", zone.getId(),
                "name", zone.getName(),
                "createdAt", zone.getCreatedAt(),
                "published", false,
                "provider", dns.connected() ? "connected" : "not_connected"
        );
    }

    private Map<String, Object> recordView(DnsRecord record) {
        return Map.of(
                "id", record.getId(),
                "type", record.getRecordType(),
                "host", record.getHost(),
                "value", record.getRecordValue(),
                "ttl", record.getTtl(),
                "createdAt", record.getCreatedAt(),
                "published", false
        );
    }

    private Map<String, Object> invoiceView(Invoice invoice) {
        return Map.of(
                "id", invoice.getId(),
                "number", invoice.getNumber(),
                "amountCents", invoice.getAmountCents(),
                "currency", invoice.getCurrency(),
                "status", invoice.getStatus(),
                "issuedAt", invoice.getIssuedAt()
        );
    }

    private Map<String, Object> offerView(Offer offer) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", offer.getId());
        view.put("code", offer.getCode());
        view.put("title", offer.getTitle());
        view.put("description", offer.getDescription());
        view.put("eligibility", offer.getEligibility());
        view.put("expiresAt", offer.getExpiresAt());
        view.put("claimable", payments.connected());
        return view;
    }

    private Map<String, Object> activity(AuditEvent event) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", event.getId());
        view.put("action", event.getAction());
        view.put("resourceType", event.getResourceType());
        view.put("resourceId", event.getResourceId());
        view.put("metadata", event.getMetadata());
        view.put("createdAt", event.getCreatedAt());
        return view;
    }

    private Map<String, Object> sessionView(RefreshSession session, UUID current) {
        return Map.of(
                "id", session.getId(),
                "createdAt", session.getCreatedAt(),
                "expiresAt", session.getExpiresAt(),
                "rememberMe", session.isRememberMe(),
                "current", session.getId().equals(current)
        );
    }

    private Map<String, Object> memberView(AccountMember member) {
        return Map.of(
                "id", member.getId(),
                "email", member.getEmail(),
                "role", member.getRole(),
                "status", member.getStatus(),
                "accountId", member.getAccountId(),
                "createdAt", member.getCreatedAt()
        );
    }

    private Map<String, Object> tokenView(ApiToken token) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", token.getId());
        view.put("name", token.getName());
        view.put("prefix", token.getTokenPrefix());
        view.put("scopes", token.getScopes());
        view.put("expiresAt", token.getExpiresAt());
        view.put("revokedAt", token.getRevokedAt());
        view.put("createdAt", token.getCreatedAt());
        return view;
    }

    private void saveMessage(SupportTicket ticket, UUID author, String body) {
        SupportMessage message = new SupportMessage();
        message.setId(UUID.randomUUID());
        message.setTicketId(ticket.getId());
        message.setAuthorUserId(author);
        message.setBody(body);
        message.setInternalNote(false);
        messages.save(message);
    }

    private CustomerServer ownedServer(AccountAccess access, UUID id) {
        return servers.findByIdAndAccountId(id, access.accountId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Server not found."));
    }

    private ServerGroup ownedGroup(AccountAccess access, UUID id) {
        return groups.findByIdAndAccountId(id, access.accountId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Server group not found."));
    }

    private SupportTicket ownedTicket(AccountAccess access, UUID id) {
        return tickets.findByIdAndAccountId(id, access.accountId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "Ticket not found."));
    }

    private DnsZone ownedZone(AccountAccess access, UUID id) {
        return zones.findByIdAndAccountId(id, access.accountId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "DNS zone not found."));
    }

    private ApiException missingAccount() {
        return new ApiException(HttpStatus.NOT_FOUND, "not_found", "Account not found.");
    }

    private static String required(Map<String, String> body, String field) {
        String value = body.get(field);
        if (value == null || value.isBlank()) {
            throw new FieldValidationException(Map.of(field, "This field is required."));
        }
        return value.trim();
    }

    private static String cleanName(String value, String field) {
        String clean = value == null ? "" : value.trim().replaceAll("\\s+", " ");
        if (clean.length() < 2 || clean.length() > 80) {
            throw new FieldValidationException(Map.of(field, "Use 2 to 80 characters."));
        }
        return clean;
    }

    private static String optional(String value, int max, String field) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String clean = value.trim();
        if (clean.length() > max) {
            throw new FieldValidationException(Map.of(field, "Use " + max + " characters or fewer."));
        }
        return clean;
    }

    private static String hostname(String value) {
        String clean = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        if (!HOST.matcher(clean).matches() || clean.length() > 80) {
            throw new FieldValidationException(Map.of("hostname", "Use a lowercase hostname such as web-01."));
        }
        return clean;
    }

    private static String ssh(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String clean = value.trim();
        if (clean.length() > 2000 || !(clean.startsWith("ssh-ed25519 ") || clean.startsWith("ssh-rsa ") || clean.startsWith("ecdsa-sha2-"))) {
            throw new FieldValidationException(Map.of("sshPublicKey", "Paste a public SSH key, or leave the field empty."));
        }
        return clean;
    }

    private static String messageBody(String value) {
        String clean = value == null ? "" : value.trim();
        if (clean.length() < 2 || clean.length() > 4000) {
            throw new FieldValidationException(Map.of("body", "Write a message between 2 and 4000 characters."));
        }
        return clean;
    }

    private static String value(String raw, Set<String> allowed, String field) {
        String clean = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
        if (!allowed.contains(clean)) {
            throw new FieldValidationException(Map.of(field, "Choose one of the listed values."));
        }
        return clean;
    }

    private static String zoneName(String value) {
        String clean = value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replaceAll("\\.$", "");
        if (!clean.contains(".") || !HOST.matcher(clean).matches()) {
            throw new FieldValidationException(Map.of("name", "Enter a domain name such as example.com."));
        }
        return clean;
    }

    private static String dnsType(String value) {
        String clean = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (!DNS_TYPES.contains(clean)) {
            throw new FieldValidationException(Map.of("type", "Choose A, AAAA, CNAME, MX, TXT, or NS."));
        }
        return clean;
    }

    private static String dnsHost(String value) {
        String clean = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        if ("@".equals(clean)) {
            return clean;
        }
        if (!HOST.matcher(clean).matches()) {
            throw new FieldValidationException(Map.of("host", "Use @ or a hostname label."));
        }
        return clean;
    }

    private static String dnsValue(String type, String value) {
        String clean = value == null ? "" : value.trim();
        if (clean.isEmpty() || clean.length() > 1024) {
            throw new FieldValidationException(Map.of("value", "Enter a record value."));
        }
        boolean ok = switch (type) {
            case "A" -> IPV4.matcher(clean).matches();
            case "AAAA" -> clean.contains(":") && clean.length() <= 45;
            case "CNAME", "NS" -> HOST.matcher(clean.toLowerCase(Locale.ROOT)).matches();
            case "MX" -> clean.matches("\\d{1,5}\\s+[a-zA-Z0-9.-]+");
            default -> true;
        };
        if (!ok) {
            throw new FieldValidationException(Map.of("value", "That value does not match the selected record type."));
        }
        return clean;
    }

    private static int ttl(String value) {
        try {
            int ttl = Integer.parseInt(value == null ? "" : value.trim());
            if (ttl < 60 || ttl > 86400) {
                throw new NumberFormatException();
            }
            return ttl;
        } catch (NumberFormatException exception) {
            throw new FieldValidationException(Map.of("ttl", "Use a TTL from 60 to 86400 seconds."));
        }
    }
}

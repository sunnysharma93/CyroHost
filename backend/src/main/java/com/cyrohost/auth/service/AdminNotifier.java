package com.cyrohost.auth.service;

import com.cyrohost.auth.config.AuthProperties;
import com.cyrohost.console.entity.NotificationEvent;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;

@Service
public class AdminNotifier {

    private static final Logger log = LoggerFactory.getLogger(AdminNotifier.class);

    private final MailService mail;
    private final AuthProperties properties;
    private final NotificationLog notifications;

    public AdminNotifier(MailService mail, AuthProperties properties, NotificationLog notifications) {
        this.mail = mail;
        this.properties = properties;
        this.notifications = notifications;
    }

    public String registration(String name, String email, String accountType, String method, String ip, String userAgent, String requestId) {
        String body = rows(new String[][]{
                {"Customer", name},
                {"Email", email},
                {"Registered", Instant.now().toString()},
                {"Account type", accountType},
                {"Method", method},
                {"Request ID", requestId},
                {"IP address", blank(ip)},
                {"Device", blank(userAgent)}
        });
        return deliver("registration", "[CyroHost] New User Registration", "New registration", body, requestId);
    }

    public String login(String name, String email, String role, String method, String ip, String userAgent, String requestId) {
        String body = rows(new String[][]{
                {"Customer", name},
                {"Email", email},
                {"Role", blank(role)},
                {"Login time", Instant.now().toString()},
                {"Method", method},
                {"IP address", blank(ip)},
                {"Device", blank(userAgent)},
                {"Request ID", requestId}
        });
        return deliver("login", "[CyroHost] User Login Activity", "Login activity", body, requestId);
    }

    public String roleChanged(String actorEmail, String targetEmail, String previousRole, String nextRole, String ip, String userAgent) {
        String body = rows(new String[][]{
                {"Changed by", blank(actorEmail)},
                {"Target", blank(targetEmail)},
                {"Previous role", blank(previousRole)},
                {"New role", blank(nextRole)},
                {"Time", Instant.now().toString()},
                {"IP address", blank(ip)},
                {"Device", blank(userAgent)}
        });
        return deliver("ADMIN_ROLE_CHANGED", "[CyroHost] Admin Role Change", "ADMIN_ROLE_CHANGED", body, targetEmail);
    }

    public String failedLogin(String email, String ip, String userAgent, String reason, String requestId) {
        String body = rows(new String[][]{
                {"Email attempted", email},
                {"Time", Instant.now().toString()},
                {"IP address", blank(ip)},
                {"Device", blank(userAgent)},
                {"Reason", reason},
                {"Request ID", requestId}
        });
        return deliver("failed_login", "[CyroHost] Failed Login Attempt", "Failed login", body, requestId);
    }

    public String vpsRequest(String htmlRows, String requestNumber) {
        return deliver("vps_request", "[CyroHost] New VPS Request - " + requestNumber, "New VPS request", htmlRows, requestNumber);
    }

    public String enquiry(String htmlRows, String id) {
        return deliver("enquiry", "[CyroHost] Infrastructure enquiry", "Infrastructure enquiry", htmlRows, id);
    }

    public String support(String htmlRows, String id) {
        return deliver("support", "[CyroHost] Support ticket", "Support ticket", htmlRows, id);
    }

    public String htmlRows(String[][] pairs) {
        return rows(pairs);
    }

    public String deliver(String kind, String subject, String heading, String rows, String resourceId) {
        String recipient = properties.adminNotificationEmail() == null || properties.adminNotificationEmail().isBlank()
                ? "cyrohostsponsorship@gmail.com"
                : properties.adminNotificationEmail().trim();
        String status = "NOT_CONFIGURED";
        if (!mail.canSend()) {
            log.warn("Admin email is not configured. Notification {} was recorded and not sent.", kind);
        } else {
            try {
                JavaMailSender sender = mail.sender();
                MimeMessage message = sender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
                helper.setFrom(properties.mailFrom());
                helper.setTo(recipient);
                helper.setSubject(subject);
                helper.setText(document(heading, rows), true);
                sender.send(message);
                status = "SENT";
            } catch (Exception exception) {
                log.warn("Admin email {} could not be sent.", kind);
                status = "FAILED";
            }
        }
        NotificationEvent event = new NotificationEvent();
        event.setId(UUID.randomUUID());
        event.setKind(kind);
        event.setRecipient(recipient);
        event.setSubject(subject);
        event.setStatus(status);
        event.setResourceId(resourceId);
        try {
            notifications.save(event);
        } catch (RuntimeException exception) {
            log.warn("Admin notification {} could not be recorded.", kind);
        }
        return status;
    }

    private static String document(String heading, String rows) {
        return """
                <div style="font-family:Arial,sans-serif;background:#f4f1ea;padding:24px;color:#1c1915">
                  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4dccf;padding:24px">
                    <p style="letter-spacing:.16em;font-size:12px;margin:0 0 8px">CYROHOST</p>
                    <h1 style="font-size:20px;font-weight:500;margin:0 0 16px">%s</h1>
                    <table style="width:100%%;border-collapse:collapse;font-size:14px">%s</table>
                    <p style="font-size:12px;color:#6d675e;margin-top:16px">This notice does not include passwords, tokens, or provider secrets.</p>
                  </div>
                </div>
                """.formatted(escape(heading), rows);
    }

    private static String rows(String[][] pairs) {
        StringBuilder html = new StringBuilder();
        for (String[] pair : pairs) {
            html.append("<tr><td style=\"padding:6px 8px 6px 0;color:#6d675e;vertical-align:top\">")
                    .append(escape(pair[0]))
                    .append("</td><td style=\"padding:6px 0\">")
                    .append(escape(pair[1]))
                    .append("</td></tr>");
        }
        return html.toString();
    }

    public static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private static String blank(String value) {
        return value == null || value.isBlank() ? "Not available" : value;
    }
}

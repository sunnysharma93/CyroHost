package com.cyrohost.console.service;

import com.cyrohost.console.entity.AuditEvent;
import com.cyrohost.console.repository.AuditEventRepository;
import com.cyrohost.console.security.AccountGuard.AccountAccess;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditRecorder {

    private final AuditEventRepository events;

    public AuditRecorder(AuditEventRepository events) {
        this.events = events;
    }

    @Transactional
    public void record(AccountAccess access, String action, String resourceType, String resourceId, String metadata, String ip) {
        write(access.accountId(), access.userId(), action, resourceType, resourceId, metadata, ip, null);
    }

    @Transactional
    public void record(UUID accountId, UUID userId, String action, String resourceType, String resourceId, String metadata, String ip) {
        write(accountId, userId, action, resourceType, resourceId, metadata, ip, null);
    }

    @Transactional
    public void record(UUID accountId, UUID userId, String action, String resourceType, String resourceId, String metadata, String ip, String userAgent) {
        write(accountId, userId, action, resourceType, resourceId, metadata, ip, userAgent);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSeparate(UUID accountId, UUID userId, String action, String resourceType, String resourceId, String metadata, String ip, String userAgent) {
        write(accountId, userId, action, resourceType, resourceId, metadata, ip, userAgent);
    }

    private void write(UUID accountId, UUID userId, String action, String resourceType, String resourceId, String metadata, String ip, String userAgent) {
        AuditEvent event = new AuditEvent();
        event.setId(UUID.randomUUID());
        event.setAccountId(accountId);
        event.setActorUserId(userId);
        event.setAction(action);
        event.setResourceType(resourceType);
        event.setResourceId(clip(resourceId, 80));
        event.setMetadata(clip(metadata, 1000));
        event.setIp(clip(ip, 64));
        event.setUserAgent(clip(userAgent, 180));
        events.save(event);
    }

    private static String clip(String value, int max) {
        if (value == null) {
            return null;
        }
        String text = value.trim();
        return text.length() <= max ? text : text.substring(0, max);
    }
}

package com.cyrohost.auth.service;

import com.cyrohost.auth.repository.RefreshSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class SessionRevoker {

    private final RefreshSessionRepository sessions;

    public SessionRevoker(RefreshSessionRepository sessions) {
        this.sessions = sessions;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void revokeActive(UUID userId) {
        sessions.revokeActiveForUser(userId, Instant.now());
    }
}

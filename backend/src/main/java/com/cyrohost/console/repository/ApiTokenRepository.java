package com.cyrohost.console.repository;

import com.cyrohost.console.entity.ApiToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApiTokenRepository extends JpaRepository<ApiToken, UUID> {
    Optional<ApiToken> findByTokenHash(String tokenHash);
    Optional<ApiToken> findByIdAndAccountId(UUID id, UUID accountId);
    List<ApiToken> findByAccountIdOrderByCreatedAtDesc(UUID accountId);
}

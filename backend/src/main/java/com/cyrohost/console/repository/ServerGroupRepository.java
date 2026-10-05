package com.cyrohost.console.repository;

import com.cyrohost.console.entity.ServerGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServerGroupRepository extends JpaRepository<ServerGroup, UUID> {
    List<ServerGroup> findByAccountIdOrderByCreatedAtAsc(UUID accountId);
    Optional<ServerGroup> findByIdAndAccountId(UUID id, UUID accountId);
    boolean existsByAccountIdAndNameIgnoreCase(UUID accountId, String name);
}


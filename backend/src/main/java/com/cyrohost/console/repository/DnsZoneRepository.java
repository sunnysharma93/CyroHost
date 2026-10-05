package com.cyrohost.console.repository;

import com.cyrohost.console.entity.DnsZone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DnsZoneRepository extends JpaRepository<DnsZone, UUID> {
    List<DnsZone> findByAccountIdOrderByNameAsc(UUID accountId);
    Optional<DnsZone> findByIdAndAccountId(UUID id, UUID accountId);
    boolean existsByAccountIdAndNameIgnoreCase(UUID accountId, String name);
}

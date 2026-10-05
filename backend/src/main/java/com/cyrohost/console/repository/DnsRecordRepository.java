package com.cyrohost.console.repository;

import com.cyrohost.console.entity.DnsRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DnsRecordRepository extends JpaRepository<DnsRecord, UUID> {
    List<DnsRecord> findByZoneIdOrderByHostAsc(UUID zoneId);
    Optional<DnsRecord> findByIdAndZoneId(UUID id, UUID zoneId);
}

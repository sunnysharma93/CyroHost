package com.cyrohost.console.repository;

import com.cyrohost.console.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {
    List<AuditEvent> findTop8ByAccountIdOrderByCreatedAtDesc(UUID accountId);

    List<AuditEvent> findTop20ByAccountIdAndResourceTypeAndResourceIdOrderByCreatedAtDesc(UUID accountId, String resourceType, String resourceId);

    Page<AuditEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByAction(String action);

    @Query("""
            select event from AuditEvent event
            where event.accountId = :id or event.actorUserId = :id
            order by event.createdAt desc
            """)
    List<AuditEvent> forCustomer(@Param("id") UUID id, Pageable pageable);
}

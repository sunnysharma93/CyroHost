package com.cyrohost.console.repository;

import com.cyrohost.console.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {
    List<SupportTicket> findTop5ByAccountIdOrderByUpdatedAtDesc(UUID accountId);
    List<SupportTicket> findByAccountIdOrderByUpdatedAtDesc(UUID accountId);
    Optional<SupportTicket> findByIdAndAccountId(UUID id, UUID accountId);

    Page<SupportTicket> findAllByOrderByUpdatedAtDesc(Pageable pageable);

    long countByStatus(String status);
}

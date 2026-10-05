package com.cyrohost.console.repository;

import com.cyrohost.console.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findByAccountIdOrderByIssuedAtDesc(UUID accountId);
    List<Invoice> findTop5ByAccountIdOrderByIssuedAtDesc(UUID accountId);
    Optional<Invoice> findByIdAndAccountId(UUID id, UUID accountId);
}

package com.cyrohost.console.repository;

import com.cyrohost.console.entity.InfrastructureEnquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InfrastructureEnquiryRepository extends JpaRepository<InfrastructureEnquiry, UUID> {
    List<InfrastructureEnquiry> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<InfrastructureEnquiry> findTop50ByOrderByCreatedAtDesc();
}

package com.cyrohost.console.repository;

import com.cyrohost.console.entity.VpsRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VpsRequestRepository extends JpaRepository<VpsRequest, UUID> {
    Optional<VpsRequest> findByIdAndUserId(UUID id, UUID userId);

    List<VpsRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<VpsRequest> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<VpsRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    boolean existsByRequestNumber(String requestNumber);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, String status);

    long countByStatus(String status);

    Optional<VpsRequest> findFirstByUserIdAndPlanIdAndRegionIdAndOsIdAndServerNameIgnoreCaseAndStatusAndCreatedAtAfter(
            UUID userId,
            String planId,
            String regionId,
            String osId,
            String serverName,
            String status,
            Instant createdAt
    );

    List<VpsRequest> findTop5ByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("""
            select request from VpsRequest request
            where (:status = '' or request.status = :status)
            and (
                :query = ''
                or lower(request.requestNumber) like lower(concat('%', :query, '%'))
                or lower(request.serverName) like lower(concat('%', :query, '%'))
                or lower(coalesce(request.hostname, '')) like lower(concat('%', :query, '%'))
            )
            """)
    Page<VpsRequest> search(@Param("status") String status, @Param("query") String query, Pageable pageable);
}

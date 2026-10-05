package com.cyrohost.console.repository;

import com.cyrohost.console.entity.CustomerServer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerServerRepository extends JpaRepository<CustomerServer, UUID> {
    Optional<CustomerServer> findByIdAndAccountId(UUID id, UUID accountId);
    Page<CustomerServer> findByAccountId(UUID accountId, Pageable pageable);

    @Query("""
            select s from CustomerServer s
            where s.accountId = :accountId
              and (:status = '' or s.status = :status)
              and (
                    :q = ''
                    or lower(s.name) like lower(concat('%', :q, '%'))
                    or lower(coalesce(s.hostname, '')) like lower(concat('%', :q, '%'))
                    or lower(s.planCode) like lower(concat('%', :q, '%'))
                    or lower(s.regionCode) like lower(concat('%', :q, '%'))
                  )
            """)
    Page<CustomerServer> search(@Param("accountId") UUID accountId, @Param("status") String status, @Param("q") String q, Pageable pageable);
    long countByAccountIdAndStatus(UUID accountId, String status);
    long countByAccountIdAndStatusNot(UUID accountId, String status);
    List<CustomerServer> findByAccountIdAndStatusNotOrderByCreatedAtDesc(UUID accountId, String status);
}

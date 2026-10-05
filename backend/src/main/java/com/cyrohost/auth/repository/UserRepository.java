package com.cyrohost.auth.repository;

import com.cyrohost.auth.entity.UserAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByPlatformRole(String platformRole);

    long countByCreatedAtAfter(Instant createdAt);

    @Query("""
            select person from UserAccount person
            where :query = ''
            or lower(person.email) like lower(concat('%', :query, '%'))
            or lower(person.fullName) like lower(concat('%', :query, '%'))
            """)
    Page<UserAccount> search(@Param("query") String query, Pageable pageable);
}

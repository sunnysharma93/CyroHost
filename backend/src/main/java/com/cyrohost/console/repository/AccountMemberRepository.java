package com.cyrohost.console.repository;

import com.cyrohost.console.entity.AccountMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountMemberRepository extends JpaRepository<AccountMember, UUID> {
    List<AccountMember> findByUserIdAndStatus(UUID userId, String status);
    List<AccountMember> findByAccountIdOrderByCreatedAtAsc(UUID accountId);
    List<AccountMember> findByEmailIgnoreCaseAndStatus(String email, String status);
    Optional<AccountMember> findByAccountIdAndUserIdAndStatus(UUID accountId, UUID userId, String status);
    Optional<AccountMember> findByIdAndAccountId(UUID id, UUID accountId);
    boolean existsByAccountIdAndEmailIgnoreCase(UUID accountId, String email);
}

package com.cyrohost.auth.repository;

import com.cyrohost.auth.entity.RefreshSession;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshSessionRepository extends JpaRepository<RefreshSession, UUID> {

    Optional<RefreshSession> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select session from RefreshSession session where session.tokenHash = :tokenHash")
    Optional<RefreshSession> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RefreshSession s set s.revokedAt = :now where s.userId = :userId and s.revokedAt is null")
    int revokeActiveForUser(@Param("userId") UUID userId, @Param("now") Instant now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RefreshSession s set s.revokedAt = :now where s.userId = :userId and s.revokedAt is null and s.id <> :keep")
    int revokeOthers(@Param("userId") UUID userId, @Param("keep") UUID keep, @Param("now") Instant now);

    List<RefreshSession> findByUserIdOrderByCreatedAtDesc(UUID userId);
}

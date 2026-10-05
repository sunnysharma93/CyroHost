package com.cyrohost.auth.repository;

import com.cyrohost.auth.entity.OAuthTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OAuthTransactionRepository extends JpaRepository<OAuthTransaction, UUID> {

    Optional<OAuthTransaction> findByStateHash(String stateHash);
}

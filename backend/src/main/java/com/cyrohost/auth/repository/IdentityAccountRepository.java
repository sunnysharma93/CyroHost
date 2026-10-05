package com.cyrohost.auth.repository;

import com.cyrohost.auth.entity.IdentityAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IdentityAccountRepository extends JpaRepository<IdentityAccount, UUID> {

    Optional<IdentityAccount> findByProviderAndProviderSubject(String provider, String providerSubject);
}

package com.cyrohost.auth.service;

import com.cyrohost.auth.config.AuthProperties;
import com.cyrohost.auth.entity.AccountStatus;
import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.auth.exception.FieldValidationException;
import com.cyrohost.auth.repository.UserRepository;
import com.cyrohost.auth.security.Emails;
import com.cyrohost.auth.security.Passwords;
import com.cyrohost.console.service.AccountProvisioner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AuthProperties properties;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AccountProvisioner accounts;

    public AdminBootstrap(AuthProperties properties, UserRepository users, PasswordEncoder encoder, AccountProvisioner accounts) {
        this.properties = properties;
        this.users = users;
        this.encoder = encoder;
        this.accounts = accounts;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureAdmin(properties.adminUpgradeExisting());
    }

    @Transactional
    public void ensureAdmin(boolean upgradeExisting) {
        String email = properties.adminEmail();
        String password = properties.adminPassword();
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.info("Initial admin bootstrap skipped because CYROHOST_ADMIN_EMAIL or CYROHOST_ADMIN_PASSWORD is unset.");
            return;
        }
        String normalized = Emails.normalize(email);
        try {
            Passwords.check(password, password, normalized);
        } catch (FieldValidationException exception) {
            log.warn("Initial admin was not created. CYROHOST_ADMIN_PASSWORD does not meet the account password rules.");
            return;
        }
        UserAccount existing = users.findByEmail(normalized).orElse(null);
        if (existing == null) {
            UserAccount admin = new UserAccount();
            admin.setId(UUID.randomUUID());
            admin.setFullName("CyroHost Admin");
            admin.setEmail(normalized);
            admin.setPasswordHash(encoder.encode(password));
            admin.setStatus(AccountStatus.ACTIVE);
            admin.setPlatformRole("ADMIN");
            users.save(admin);
            accounts.ensure(admin);
            log.info("Initial admin account created for {}.", normalized);
            return;
        }
        accounts.ensure(existing);
        if ("ADMIN".equals(existing.getPlatformRole())) {
            log.info("Initial admin already exists. The stored password was left unchanged.");
            return;
        }
        if (!upgradeExisting) {
            log.warn("Configured admin email exists with role {}. Set CYROHOST_ADMIN_UPGRADE=true to grant ADMIN without changing the password.", existing.getPlatformRole());
            return;
        }
        existing.setPlatformRole("ADMIN");
        users.save(existing);
        log.info("Existing account {} was upgraded to ADMIN. The stored password was left unchanged.", normalized);
    }
}

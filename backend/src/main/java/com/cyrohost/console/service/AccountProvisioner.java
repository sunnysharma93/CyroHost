package com.cyrohost.console.service;

import com.cyrohost.auth.entity.UserAccount;
import com.cyrohost.console.entity.Account;
import com.cyrohost.console.entity.AccountMember;
import com.cyrohost.console.repository.AccountMemberRepository;
import com.cyrohost.console.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AccountProvisioner {

    private final AccountRepository accounts;
    private final AccountMemberRepository members;

    public AccountProvisioner(AccountRepository accounts, AccountMemberRepository members) {
        this.accounts = accounts;
        this.members = members;
    }

    @Transactional
    public void ensure(UserAccount user) {
        if (accounts.existsByOwnerUserId(user.getId())) {
            return;
        }
        Account account = new Account();
        account.setId(user.getId());
        account.setOwnerUserId(user.getId());
        account.setName(user.getFullName());
        accounts.save(account);
        AccountMember member = new AccountMember();
        member.setId(UUID.randomUUID());
        member.setAccountId(account.getId());
        member.setUserId(user.getId());
        String email = user.getEmail() == null || user.getEmail().isBlank()
                ? user.getId() + "@pending.cyrohost.invalid"
                : user.getEmail();
        member.setEmail(email);
        member.setRole("OWNER");
        member.setStatus("ACTIVE");
        members.save(member);
    }
}

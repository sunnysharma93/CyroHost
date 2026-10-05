package com.cyrohost.console.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "invoices")
public class Invoice extends AssignedEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID accountId;

    @Column(nullable = false, length = 40, unique = true)
    private String number;

    @Column(nullable = false)
    private long amountCents;

    @Column(nullable = false, length = 8)
    private String currency;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false)
    private Instant issuedAt;

    public UUID getId() {
        return id;
    }

    public UUID getAccountId() {
        return accountId;
    }

    public String getNumber() {
        return number;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public String getCurrency() {
        return currency;
    }

    public String getStatus() {
        return status;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }
}

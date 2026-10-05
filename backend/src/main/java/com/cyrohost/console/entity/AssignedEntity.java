package com.cyrohost.console.entity;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Transient;
import org.springframework.data.domain.Persistable;

import java.util.UUID;

@MappedSuperclass
public abstract class AssignedEntity implements Persistable<UUID> {

    @Transient
    private boolean stored;

    @Override
    public abstract UUID getId();

    @Override
    public boolean isNew() {
        return !stored;
    }

    @PostLoad
    @PostPersist
    void stored() {
        stored = true;
    }
}

package com.cyrohost.console.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "server_group_members")
@IdClass(ServerGroupMember.Key.class)
public class ServerGroupMember {

    @Id
    private UUID groupId;

    @Id
    private UUID serverId;

    public UUID getGroupId() {
        return groupId;
    }

    public void setGroupId(UUID groupId) {
        this.groupId = groupId;
    }

    public UUID getServerId() {
        return serverId;
    }

    public void setServerId(UUID serverId) {
        this.serverId = serverId;
    }

    public static class Key implements Serializable {
        private UUID groupId;
        private UUID serverId;

        public Key() {
        }

        public Key(UUID groupId, UUID serverId) {
            this.groupId = groupId;
            this.serverId = serverId;
        }

        @Override
        public boolean equals(Object other) {
            if (!(other instanceof Key key)) {
                return false;
            }
            return groupId.equals(key.groupId) && serverId.equals(key.serverId);
        }

        @Override
        public int hashCode() {
            return groupId.hashCode() * 31 + serverId.hashCode();
        }
    }
}

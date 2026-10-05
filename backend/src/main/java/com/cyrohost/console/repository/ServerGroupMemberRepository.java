package com.cyrohost.console.repository;

import com.cyrohost.console.entity.ServerGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServerGroupMemberRepository extends JpaRepository<ServerGroupMember, ServerGroupMember.Key> {
    List<ServerGroupMember> findByGroupId(UUID groupId);
    List<ServerGroupMember> findByServerId(UUID serverId);
    void deleteByGroupIdAndServerId(UUID groupId, UUID serverId);
}

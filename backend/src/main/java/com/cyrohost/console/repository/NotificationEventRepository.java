package com.cyrohost.console.repository;

import com.cyrohost.console.entity.NotificationEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationEventRepository extends JpaRepository<NotificationEvent, UUID> {
    Page<NotificationEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

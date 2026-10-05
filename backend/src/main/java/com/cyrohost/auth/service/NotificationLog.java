package com.cyrohost.auth.service;

import com.cyrohost.console.entity.NotificationEvent;
import com.cyrohost.console.repository.NotificationEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationLog {

    private final NotificationEventRepository notifications;

    public NotificationLog(NotificationEventRepository notifications) {
        this.notifications = notifications;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void save(NotificationEvent event) {
        notifications.save(event);
    }
}

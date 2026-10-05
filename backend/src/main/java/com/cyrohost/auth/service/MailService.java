package com.cyrohost.auth.service;

import com.cyrohost.auth.config.AuthProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final AuthProperties properties;

    public MailService(ObjectProvider<JavaMailSender> mailSender, AuthProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    public boolean sendInvite(String email, String accountName) {
        if (!canSend()) {
            return false;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.mailFrom());
        message.setTo(email);
        message.setSubject("CyroHost account invitation");
        message.setText("You have been invited to the CyroHost account \"" + accountName + "\". Sign in and open Security & Team to accept. This message does not grant access by itself.");
        try {
            mailSender.getIfAvailable().send(message);
            return true;
        } catch (RuntimeException exception) {
            log.warn("Invitation email could not be sent.");
            return false;
        }
    }

    public boolean canSend() {
        return sender() != null && properties.mailFrom() != null && !properties.mailFrom().isBlank();
    }

    public JavaMailSender sender() {
        return mailSender.getIfAvailable();
    }

    public boolean sendReset(String email, String rawToken) {
        if (!canSend()) {
            log.warn("Password reset email is not configured. The token was stored and was not logged.");
            return false;
        }
        JavaMailSender sender = mailSender.getIfAvailable();
        String link = properties.frontendOrigin() + "/reset-password?token=" + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.mailFrom());
        message.setTo(email);
        message.setSubject("Reset your CyroHost password");
        message.setText("Use this link within 30 minutes to choose a new CyroHost password. If you did not ask for this, ignore the message.\n\n" + link);
        try {
            sender.send(message);
            return true;
        } catch (RuntimeException exception) {
            log.warn("Password reset email could not be sent.");
            return false;
        }
    }
}

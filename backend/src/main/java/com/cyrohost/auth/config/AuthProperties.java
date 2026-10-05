package com.cyrohost.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cyro.auth")
public record AuthProperties(
        String issuer,
        int accessTokenMinutes,
        int refreshDays,
        int rememberDays,
        int resetMinutes,
        String jwtSecret,
        boolean cookieSecure,
        String frontendOrigin,
        String publicBaseUrl,
        boolean exposeDevResetToken,
        String mailFrom,
        String adminEmails,
        String adminNotificationEmail,
        String adminEmail,
        String adminPassword,
        boolean adminUpgradeExisting
) {
}

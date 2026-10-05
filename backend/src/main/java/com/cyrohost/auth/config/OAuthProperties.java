package com.cyrohost.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cyro.oauth")
public record OAuthProperties(Provider google, Provider facebook, Apple apple) {

    public record Provider(String clientId, String clientSecret) {
        public boolean configured() {
            return present(clientId) && present(clientSecret);
        }
    }

    public record Apple(String clientId, String teamId, String keyId, String privateKey) {
        public boolean configured() {
            return present(clientId) && present(teamId) && present(keyId) && present(privateKey);
        }
    }

    public boolean configured(String provider) {
        return switch (provider) {
            case "google" -> google != null && google.configured();
            case "facebook" -> facebook != null && facebook.configured();
            case "apple" -> apple != null && apple.configured();
            default -> false;
        };
    }

    private static boolean present(String value) {
        return value != null && !value.isBlank();
    }
}

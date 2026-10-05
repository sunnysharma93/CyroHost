package com.cyrohost.console.provider;

import com.cyrohost.auth.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

public final class Providers {

    private Providers() {
    }

    public interface InfrastructureProvider {
        boolean connected();

        void start(UUID serverId);

        void stop(UUID serverId);

        void restart(UUID serverId);

        String status(UUID serverId);
    }

    public interface DnsProvider {
        boolean connected();
    }

    public interface StorageProvider {
        boolean connected();
    }

    public interface PaymentProvider {
        boolean connected();
    }

    @Component
    static class UnconfiguredInfrastructureProvider implements InfrastructureProvider {
        @Override
        public boolean connected() {
            return false;
        }

        @Override
        public void start(UUID serverId) {
            refuse();
        }

        @Override
        public void stop(UUID serverId) {
            refuse();
        }

        @Override
        public void restart(UUID serverId) {
            refuse();
        }

        @Override
        public String status(UUID serverId) {
            refuse();
            return null;
        }

        private static void refuse() {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "provider_not_connected", "Infrastructure provider is not connected.");
        }
    }

    @Component
    static class UnconfiguredDnsProvider implements DnsProvider {
        @Override
        public boolean connected() {
            return false;
        }
    }

    @Component
    static class UnconfiguredStorageProvider implements StorageProvider {
        @Override
        public boolean connected() {
            return false;
        }
    }

    @Component
    static class UnconfiguredPaymentProvider implements PaymentProvider {
        @Override
        public boolean connected() {
            return false;
        }
    }
}

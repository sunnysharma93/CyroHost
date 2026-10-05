package com.cyrohost.auth.security;

import com.cyrohost.auth.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    static final int LIMIT = 8;
    static final Duration WINDOW = Duration.ofMinutes(15);

    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    public void check(String ip, String email) {
        Attempt attempt = attempts.get(key(ip, email));
        if (attempt != null && attempt.count >= LIMIT && attempt.started.plus(WINDOW).isAfter(Instant.now())) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "rate_limited", "Too many sign-in attempts. Try again later.");
        }
    }

    public void recordFailure(String ip, String email) {
        String id = key(ip, email);
        attempts.compute(id, (ignored, current) -> {
            Instant now = Instant.now();
            if (current == null || current.started.plus(WINDOW).isBefore(now)) {
                return new Attempt(1, now);
            }
            return new Attempt(current.count + 1, current.started);
        });
        trim();
    }

    public void consume(String ip, String bucket, int limit) {
        String id = bucket + "|" + (ip == null || ip.isBlank() ? "unknown" : ip);
        Attempt next = attempts.compute(id, (ignored, current) -> {
            Instant now = Instant.now();
            if (current == null || current.started.plus(WINDOW).isBefore(now)) {
                return new Attempt(1, now);
            }
            return new Attempt(current.count + 1, current.started);
        });
        trim();
        if (next != null && next.count > limit) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "rate_limited", "Too many attempts. Try again later.");
        }
    }

    private void trim() {
        if (attempts.size() <= 10_000) {
            return;
        }
        Instant now = Instant.now();
        attempts.entrySet().removeIf(entry -> entry.getValue().started.plus(WINDOW).isBefore(now));
        if (attempts.size() <= 10_000) {
            return;
        }
        var iterator = attempts.keySet().iterator();
        int extra = attempts.size() - 8_000;
        while (extra > 0 && iterator.hasNext()) {
            iterator.next();
            iterator.remove();
            extra--;
        }
    }

    private static String key(String ip, String email) {
        return (ip == null ? "unknown" : ip) + "|" + Emails.normalize(email);
    }

    private record Attempt(int count, Instant started) {
    }
}

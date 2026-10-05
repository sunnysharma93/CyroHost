package com.cyrohost.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorBody(String error, String message, Map<String, String> fields, String timestamp, String requestId) {

    public ErrorBody(String error, String message) {
        this(error, message, null, Instant.now().toString(), UUID.randomUUID().toString());
    }

    public ErrorBody(String error, String message, Map<String, String> fields) {
        this(error, message, fields, Instant.now().toString(), UUID.randomUUID().toString());
    }
}

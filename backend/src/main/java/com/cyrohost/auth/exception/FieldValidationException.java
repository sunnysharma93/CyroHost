package com.cyrohost.auth.exception;

import java.util.Map;

public class FieldValidationException extends RuntimeException {

    private final Map<String, String> fields;

    public FieldValidationException(Map<String, String> fields) {
        super("Check the highlighted fields.");
        this.fields = fields;
    }

    public Map<String, String> getFields() {
        return fields;
    }
}

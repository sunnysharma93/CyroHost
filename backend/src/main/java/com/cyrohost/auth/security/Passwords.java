package com.cyrohost.auth.security;

import com.cyrohost.auth.exception.FieldValidationException;

import java.util.Map;

public final class Passwords {

    private Passwords() {
    }

    public static void check(String password, String confirm, String email) {
        if (password == null || confirm == null || !password.equals(confirm)) {
            throw new FieldValidationException(Map.of("confirmPassword", "Passwords do not match."));
        }
        boolean letter = password.chars().anyMatch(Character::isLetter);
        boolean digit = password.chars().anyMatch(Character::isDigit);
        if (password.length() < 12 || password.length() > 128 || !letter || !digit) {
            throw new FieldValidationException(Map.of(
                    "password",
                    "Use at least 12 characters, including a letter and a number."
            ));
        }
        if (email != null && !email.isBlank() && password.equalsIgnoreCase(email)) {
            throw new FieldValidationException(Map.of("password", "Choose a password that is not your email address."));
        }
    }
}

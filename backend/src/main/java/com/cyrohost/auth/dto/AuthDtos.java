package com.cyrohost.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank(message = "Enter your full name.")
            @Size(min = 2, max = 80, message = "Use 2 to 80 characters.")
            String fullName,
            @NotBlank(message = "Enter your email address.")
            @Email(message = "Enter a valid email address.")
            @Size(max = 320, message = "Enter a valid email address.")
            String email,
            @NotBlank(message = "Enter a password.")
            @Size(min = 12, max = 128, message = "Use at least 12 characters.")
            String password,
            @NotBlank(message = "Confirm your password.")
            String confirmPassword,
            @NotNull(message = "Accept the Terms and Privacy Policy to create an account.")
            @AssertTrue(message = "Accept the Terms and Privacy Policy to create an account.")
            Boolean acceptedTerms
    ) {
    }

    public record LoginRequest(
            @NotBlank(message = "Enter your email address.")
            @Email(message = "Enter a valid email address.")
            String email,
            @NotBlank(message = "Enter your password.")
            String password,
            Boolean rememberMe
    ) {
    }

    public record ForgotPasswordRequest(
            @NotBlank(message = "Enter your email address.")
            @Email(message = "Enter a valid email address.")
            String email
    ) {
    }

    public record ResetPasswordRequest(
            @NotBlank(message = "This reset link is invalid or has expired.")
            String token,
            @NotBlank(message = "Enter a password.")
            @Size(min = 12, max = 128, message = "Use at least 12 characters.")
            String password,
            @NotBlank(message = "Confirm your password.")
            String confirmPassword
    ) {
    }

    public record UserResponse(UUID id, String fullName, String email, String status, String platformRole) {
    }

    public record CsrfResponse(String csrfToken) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ForgotResponse(String message, String devResetToken) {
    }

    public record MessageResponse(String message) {
    }

    public record ProviderStatus(boolean google, boolean facebook, boolean apple) {
    }
}

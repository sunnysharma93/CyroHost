package com.cyrohost.auth.exception;

import com.cyrohost.auth.dto.ErrorBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> invalid(MethodArgumentNotValidException exception) {
        Map<String, String> fields = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                fields.putIfAbsent(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(new ErrorBody("validation_failed", "Check the highlighted fields.", fields));
    }

    @ExceptionHandler(FieldValidationException.class)
    public ResponseEntity<ErrorBody> fields(FieldValidationException exception) {
        return ResponseEntity.badRequest().body(new ErrorBody("validation_failed", exception.getMessage(), exception.getFields()));
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorBody> api(ApiException exception) {
        return ResponseEntity.status(exception.getStatus()).body(new ErrorBody(exception.getCode(), exception.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorBody> unreadable() {
        return ResponseEntity.badRequest().body(new ErrorBody("invalid_body", "The request body could not be read."));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorBody> missing() {
        return ResponseEntity.status(404).body(new ErrorBody("not_found", "That API route is not available."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> unexpected(Exception exception) {
        log.error("Unhandled auth API error", exception);
        return ResponseEntity.internalServerError().body(new ErrorBody("server_error", "Something went wrong."));
    }
}

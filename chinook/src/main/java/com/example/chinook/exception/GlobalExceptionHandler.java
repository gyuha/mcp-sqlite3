package com.example.chinook.exception;

import com.example.chinook.dto.ErrorResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    protected ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        ErrorResponse response = ErrorResponse.of(
            ex.getMessage(),
            HttpStatus.NOT_FOUND.value(),
            "RESOURCE_NOT_FOUND"
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    protected ResponseEntity<ErrorResponse> handleDuplicateResourceException(DuplicateResourceException ex) {
        ErrorResponse response = ErrorResponse.of(
            ex.getMessage(),
            HttpStatus.CONFLICT.value(),
            "DUPLICATE_RESOURCE"
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(BusinessLogicException.class)
    protected ResponseEntity<ErrorResponse> handleBusinessLogicException(BusinessLogicException ex) {
        ErrorResponse response = ErrorResponse.of(
            ex.getMessage(),
            HttpStatus.BAD_REQUEST.value(),
            ex.getErrorCode()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    protected ResponseEntity<ErrorResponse> handleEntityNotFoundException(EntityNotFoundException ex) {
        ErrorResponse response = ErrorResponse.of(
            ex.getMessage(),
            HttpStatus.NOT_FOUND.value(),
            "ENTITY_NOT_FOUND"
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        
        List<String> details = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(this::buildValidationErrorMessage)
            .collect(Collectors.toList());

        ErrorResponse response = ErrorResponse.of(
            "Validation failed",
            HttpStatus.BAD_REQUEST.value(),
            "VALIDATION_FAILED",
            details
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    protected ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException ex) {
        List<String> details = ex.getConstraintViolations()
            .stream()
            .map(this::buildConstraintViolationMessage)
            .collect(Collectors.toList());

        ErrorResponse response = ErrorResponse.of(
            "Validation failed",
            HttpStatus.BAD_REQUEST.value(),
            "VALIDATION_FAILED",
            details
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    protected ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        ErrorResponse response = ErrorResponse.of(
            "Database error occurred",
            HttpStatus.CONFLICT.value(),
            "DATA_INTEGRITY_VIOLATION"
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponse> handleAllUncaughtException(Exception ex) {
        ErrorResponse response = ErrorResponse.of(
            "An unexpected error occurred",
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "INTERNAL_SERVER_ERROR"
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String buildValidationErrorMessage(FieldError fieldError) {
        return String.format(
            "Field '%s' %s (Rejected value: %s)",
            fieldError.getField(),
            fieldError.getDefaultMessage(),
            fieldError.getRejectedValue()
        );
    }

    private String buildConstraintViolationMessage(ConstraintViolation<?> violation) {
        return String.format(
            "Field '%s' %s (Rejected value: %s)",
            violation.getPropertyPath(),
            violation.getMessage(),
            violation.getInvalidValue()
        );
    }
}

package com.blogPlatform.fawryBook.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Why a custom exception (not just returning null):
 * - @ResponseStatus automatically maps to 404 HTTP response
 * - Clear, descriptive error message reaches the client
 * - Can be caught centrally by @ControllerAdvice for consistent JSON error format
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}


package com.blogPlatform.fawryBook.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Why a separate UnauthorizedActionException (not just 403 inline):
 * - Thrown when a user tries to edit/delete a post they don't own
 * - @ResponseStatus(FORBIDDEN) auto-maps to 403 — no manual ResponseEntity needed in the controller
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnauthorizedActionException extends RuntimeException {

    public UnauthorizedActionException(String message) {
        super(message);
    }
}


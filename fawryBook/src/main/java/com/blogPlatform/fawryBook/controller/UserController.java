package com.blogPlatform.fawryBook.controller;

import com.blogPlatform.fawryBook.dto.request.UpdateUserRequest;
import com.blogPlatform.fawryBook.dto.response.UserResponse;
import com.blogPlatform.fawryBook.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Why /api/users (not /api/user):
 * - REST convention: resources are plural nouns
 *
 * Why / (not /{id}):
 * - The logged-in user should only access THEIR OWN profile
 * - /me reads the user's identity from the JWT token (Authentication.getName())
 * - Prevents ID enumeration attacks (no guessing /api/users/1, /api/users/2, etc.)
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/ — View own profile.
     *
     * Why Authentication parameter:
     * - Spring Security populates it automatically from the JWT filter
     * - authentication.getName() returns the email stored in the JWT subject
     * - No need for @RequestHeader or manual token parsing
     */
    @GetMapping("/")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication.getName()));
    }

    /**
     * PUT /api/users/ — Update own profile.
     *
     * Updatable fields: firstName, lastName, country
     * Non-updatable: email (would require re-verification), password (needs dedicated endpoint)
     */
    @PutMapping("/")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @RequestBody UpdateUserRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateCurrentUser(authentication.getName(), request));
    }
}


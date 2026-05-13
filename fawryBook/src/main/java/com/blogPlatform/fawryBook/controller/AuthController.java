package com.blogPlatform.fawryBook.controller;

import com.blogPlatform.fawryBook.dto.request.LoginRequest;
import com.blogPlatform.fawryBook.dto.request.RegisterRequest;
import com.blogPlatform.fawryBook.dto.response.AuthResponse;
import com.blogPlatform.fawryBook.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Why /api/auth prefix:
 * - SecurityConfig permits ALL requests to /api/auth/** without a JWT
 * - Makes sense: you can't authenticate before you have a token
 *
 * Why @RestController:
 * - Combines @Controller + @ResponseBody — every return value is serialized to JSON
 * - No view resolver needed (this is a REST API, not an MVC app)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     *
     * Flow:
     * 1. Client sends { firstName, lastName, email, password, country }
     * 2. @Valid checks all validation annotations on RegisterRequest
     * 3. AuthService hashes password, saves user, generates JWT
     * 4. Returns 201 CREATED with { token, email, fullName }
     *
     * Why 201 (not 200): a new resource (user) was created — HTTP semantics
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     *
     * Flow:
     * 1. Client sends { email, password }
     * 2. AuthService authenticates via AuthenticationManager
     * 3. If valid → returns 200 OK with { token, email, fullName }
     * 4. If invalid → Spring Security throws BadCredentialsException → 401
     *
     * Why 200 (not 201): login doesn't create a resource — it retrieves a token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}


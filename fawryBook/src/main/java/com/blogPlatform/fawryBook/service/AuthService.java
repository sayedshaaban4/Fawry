package com.blogPlatform.fawryBook.service;

import com.blogPlatform.fawryBook.dto.request.LoginRequest;
import com.blogPlatform.fawryBook.dto.request.RegisterRequest;
import com.blogPlatform.fawryBook.dto.response.AuthResponse;
import com.blogPlatform.fawryBook.entity.User;
import com.blogPlatform.fawryBook.repository.UserRepository;
import com.blogPlatform.fawryBook.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * Why AuthService handles both register AND login:
 * - Both operations produce the same output (JWT token) — grouping them keeps the logic cohesive
 * - Service layer is where business rules live (duplicate email check, password hashing)
 *
 * Why @Transactional:
 * - Register creates a User row — must be atomic (all or nothing)
 * - If anything fails after the save (e.g., JWT generation), the user row rolls back
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * REGISTER flow:
     * 1. Check if email already exists → throw if duplicate
     * 2. Hash the password with BCrypt
     * 3. Save the user entity
     * 4. Generate a JWT token → return immediately so the user is "logged in" after registering
     *
     * Why hash BEFORE saving:
     * - The raw password must NEVER be stored in the database
     * - BCrypt produces a unique hash each time (auto-salted) — even identical passwords differ
     */
    public AuthResponse register(RegisterRequest request) {
        // Why check existence first: avoids a DB constraint violation exception
        // which would return an ugly 500 error instead of a clear 409 message
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .country(request.getCountry())
                .build();

        userRepository.save(user);

        // Build a UserDetails object to generate the JWT
        // Why not use CustomUserDetailsService here: the user was JUST created —
        // we already have all the data in memory, no need for an extra DB query
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.emptyList()
        );

        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .build();
    }

    /**
     * LOGIN flow:
     * 1. Authenticate via Spring Security's AuthenticationManager
     *    → internally calls CustomUserDetailsService.loadUserByUsername()
     *    → compares raw password with BCrypt hash
     *    → throws BadCredentialsException if mismatch
     * 2. If valid, generate a JWT token
     *
     * Why use AuthenticationManager.authenticate() (not manual password check):
     * - Spring Security's DaoAuthenticationProvider handles BCrypt comparison internally
     * - Consistent with the security framework — any custom auth providers are also invoked
     * - Throws a clear AuthenticationException on failure (caught by GlobalExceptionHandler)
     */
    public AuthResponse login(LoginRequest request) {
        // This line does ALL the work: loads user, checks password, throws if invalid
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // If we reach here, credentials are valid — load user for token generation
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.emptyList()
        );

        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .build();
    }
}


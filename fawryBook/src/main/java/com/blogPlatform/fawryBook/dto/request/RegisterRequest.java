package com.blogPlatform.fawryBook.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Why separate RegisterRequest (not reusing the User entity):
 * - Only exposes fields the client SHOULD provide (no id, createdAt, etc.)
 * - Validation annotations enforce rules BEFORE hitting the service layer
 * - @Email ensures proper email format — prevents gibberish in the DB
 * - @Size(min=6) on password enforces minimum strength at the API boundary
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String country;
}


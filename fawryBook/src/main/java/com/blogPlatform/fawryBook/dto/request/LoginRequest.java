package com.blogPlatform.fawryBook.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Why a separate LoginRequest (not RegisterRequest):
 * - Login only needs email + password (no firstName, lastName, etc.)
 * - Different validation rules — no @Size on password (existing passwords
 *   may have been created before a min-length rule was added)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}


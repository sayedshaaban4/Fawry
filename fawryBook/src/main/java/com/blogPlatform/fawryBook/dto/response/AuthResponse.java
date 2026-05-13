package com.blogPlatform.fawryBook.dto.response;

import lombok.*;

/**
 * Why a dedicated AuthResponse:
 * - Returns the JWT token to the client after register/login
 * - Could be extended later with refresh token, expiry time, etc.
 * - Keeps the response shape consistent and predictable for the frontend
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String email;
    private String fullName;
}


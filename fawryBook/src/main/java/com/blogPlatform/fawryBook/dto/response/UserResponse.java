package com.blogPlatform.fawryBook.dto.response;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Why a separate UserResponse (not returning the User entity):
 * - NEVER exposes the password hash — even hashed passwords shouldn't be in API responses
 * - Shapes the JSON to only include fields the frontend needs
 * - Decouples API contract from DB schema
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String country;
    private LocalDateTime createdAt;
}


package com.blogPlatform.fawryBook.dto.request;

import lombok.*;

/**
 * Why a separate UpdateUserRequest (not reusing RegisterRequest):
 * - Profile updates allow changing firstName, lastName, country — but NOT email or password
 * - No @NotBlank: all fields are optional (partial update — only provided fields are changed)
 * - Email changes would require re-verification; password changes need a dedicated endpoint
 *   with old-password confirmation — both are out of scope for basic profile editing
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    private String firstName;
    private String lastName;
    private String country;
}


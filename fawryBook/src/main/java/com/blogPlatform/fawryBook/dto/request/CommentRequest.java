package com.blogPlatform.fawryBook.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Why a DTO for comments (not accepting the Comment entity):
 * - Client only provides content — author and post are set from the JWT token and URL path
 * - @NotBlank prevents empty comments from being saved
 * - Keeps the API contract clean: no id, no timestamps, no author object in the request
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequest {

    @NotBlank(message = "Comment content is required")
    private String content;
}


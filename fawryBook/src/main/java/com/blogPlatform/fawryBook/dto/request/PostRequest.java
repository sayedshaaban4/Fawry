package com.blogPlatform.fawryBook.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

/**
 * Why a separate DTO instead of accepting the Post entity directly:
 * - Prevents clients from setting id, author, createdAt (fields they shouldn't control)
 * - Validation annotations (@NotBlank, @Size) enforce rules at the API boundary
 * - Decouples API contract from DB schema
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private List<String> tags;
}


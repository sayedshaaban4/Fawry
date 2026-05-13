package com.blogPlatform.fawryBook.dto.response;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Why a response DTO for comments:
 * - Flattens the author into authorId + authorName — no nested User object (no password leak)
 * - Includes the comment ID so the frontend can reference specific comments (e.g., for future delete/edit)
 * - createdAt lets the UI display "posted 5 minutes ago" relative timestamps
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private Long id;
    private String content;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
}


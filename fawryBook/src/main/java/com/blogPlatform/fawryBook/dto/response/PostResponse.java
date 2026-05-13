package com.blogPlatform.fawryBook.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Why a response DTO:
 * - Includes computed fields (likeCount, dislikeCount, commentCount, rating) that don't exist on the entity
 * - Exposes authorName instead of the full User object (no password leak)
 * - Shapes the JSON exactly how the frontend needs it
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {

    private Long id;
    private String title;
    private String content;
    private List<String> tags;

    private Long authorId;
    private String authorName;

    private long likeCount;
    private long dislikeCount;
    private long commentCount;

    // Rating: likes / (likes + dislikes), 0.0 to 1.0
    private double rating;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


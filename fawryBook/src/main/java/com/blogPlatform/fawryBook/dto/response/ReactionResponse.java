package com.blogPlatform.fawryBook.dto.response;

import com.blogPlatform.fawryBook.enums.ReactionType;
import lombok.*;

/**
 * Why a response DTO for reactions:
 * - Tells the client exactly what happened: which type was set (or null if removed)
 * - Includes a human-readable message for UI feedback
 * - Never exposes internal IDs or User objects
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReactionResponse {

    private ReactionType currentReaction; // null if reaction was removed (toggle off)
    private String message;              // e.g., "Post liked", "Like removed", "Switched to dislike"
    private long likeCount;
    private long dislikeCount;
}


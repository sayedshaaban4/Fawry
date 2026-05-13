package com.blogPlatform.fawryBook.dto.request;

import com.blogPlatform.fawryBook.enums.ReactionType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Why a DTO for reactions (not just a path param or query param):
 * - @NotNull ensures the client MUST specify LIKE or DISLIKE — no ambiguity
 * - ReactionType enum auto-validates: sending "LOVE" would fail deserialization → 400 error
 * - Extensible: if we add more fields later (e.g., emoji reactions), the DTO grows naturally
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReactionRequest {

    @NotNull(message = "Reaction type is required (LIKE or DISLIKE)")
    private ReactionType type;
}


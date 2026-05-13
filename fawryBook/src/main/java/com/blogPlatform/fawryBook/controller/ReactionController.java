package com.blogPlatform.fawryBook.controller;

import com.blogPlatform.fawryBook.dto.request.ReactionRequest;
import com.blogPlatform.fawryBook.dto.response.ReactionResponse;
import com.blogPlatform.fawryBook.service.ReactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Why nested under /api/posts/{postId}/reactions:
 * - RESTful convention: reactions are a SUB-RESOURCE of a post
 * - The URL clearly communicates "I'm reacting to THIS specific post"
 * - @PathVariable extracts the postId from the URL — no ambiguity
 *
 * Why only POST (no GET/DELETE):
 * - POST handles all three cases (add/toggle/switch) via the service's upsert logic
 * - Reaction counts are already included in the PostResponse — no need for a separate GET
 * - Delete is handled by sending the same type again (toggle off)
 */
@RestController
@RequestMapping("/api/posts/{postId}/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;

    /**
     * POST /api/posts/{postId}/reactions
     *
     * Body: { "type": "LIKE" } or { "type": "DISLIKE" }
     *
     * Behavior:
     * - First time: creates the reaction
     * - Same type again: removes it (toggle off — "unlike")
     * - Different type: switches it (like → dislike)
     *
     * Returns: current reaction state + updated like/dislike counts
     */
    @PostMapping
    public ResponseEntity<ReactionResponse> react(
            @PathVariable Long postId,
            @Valid @RequestBody ReactionRequest request,
            Authentication authentication) {
        ReactionResponse response = reactionService.reactToPost(postId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }
}


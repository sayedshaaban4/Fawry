package com.blogPlatform.fawryBook.controller;

import com.blogPlatform.fawryBook.dto.request.CommentRequest;
import com.blogPlatform.fawryBook.dto.response.CommentResponse;
import com.blogPlatform.fawryBook.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Why nested under /api/posts/{postId}/comments:
 * - RESTful convention: comments are a sub-resource of a post
 * - The URL makes the relationship explicit: "comments ON this post"
 * - @PathVariable postId is always available to both endpoints
 *
 * Why separate from PostController:
 * - Each controller has a focused responsibility
 * - URL prefix differs (/posts/{id}/comments vs /posts)
 * - Keeps individual controllers small and readable
 */
@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * POST /api/posts/{postId}/comments — Add a comment to a post.
     *
     * Body: { "content": "Great article!" }
     * Returns: 201 CREATED with the saved comment (including id, author info, timestamp)
     *
     * Why 201 (not 200): a new comment resource was created
     */
    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        CommentResponse response = commentService.addComment(postId, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/posts/{postId}/comments — List comments for a post.
     *
     * Returns: All comments for the post, ordered by newest first
     */
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }
}


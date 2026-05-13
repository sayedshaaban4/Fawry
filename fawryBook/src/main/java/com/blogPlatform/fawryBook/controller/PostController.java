package com.blogPlatform.fawryBook.controller;

import com.blogPlatform.fawryBook.dto.request.PostRequest;
import com.blogPlatform.fawryBook.dto.response.PostResponse;
import com.blogPlatform.fawryBook.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for blog post CRUD operations.
 * All endpoints require a valid JWT token (except what SecurityConfig permits).
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /** POST /api/posts — Create a new blog post. */
    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @Valid @RequestBody PostRequest request,
            Authentication authentication) {
        PostResponse response = postService.createPost(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** GET /api/posts — List all posts. */
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    /** GET /api/posts/{id} — View a single post with full details. */
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    /** PUT /api/posts/{id} — Update an existing post (owner only). */
    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request,
            Authentication authentication) {
        PostResponse response = postService.updatePost(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    /** DELETE /api/posts/{id} — Delete a post (owner only). Returns 204 No Content. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            Authentication authentication) {
        postService.deletePost(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}


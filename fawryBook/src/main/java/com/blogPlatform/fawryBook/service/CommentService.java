package com.blogPlatform.fawryBook.service;

import com.blogPlatform.fawryBook.dto.request.CommentRequest;
import com.blogPlatform.fawryBook.dto.response.CommentResponse;
import com.blogPlatform.fawryBook.entity.Comment;
import com.blogPlatform.fawryBook.entity.Post;
import com.blogPlatform.fawryBook.entity.User;
import com.blogPlatform.fawryBook.exception.ResourceNotFoundException;
import com.blogPlatform.fawryBook.mapper.CommentMapper;
import com.blogPlatform.fawryBook.repository.CommentRepository;
import com.blogPlatform.fawryBook.repository.PostRepository;
import com.blogPlatform.fawryBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Why a dedicated CommentService:
 * - Comments have their own lifecycle (create, list, potentially delete/edit later)
 * - Keeping them separate from PostService avoids a "god service" anti-pattern
 * - Each service has a clear, focused responsibility
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    /**
     * ADD COMMENT to a post.
     *
     * Why we fetch both Post and User from DB:
     * - Post: to verify it exists (throws 404 if not) and to set the ManyToOne relationship
     * - User: to link the comment to its author (from JWT email)
     *
     * Why Comment.builder() (not commentMapper.toEntity):
     * - CommentRequest only has "content" — author and post come from different sources
     *   (JWT token and URL path) — MapStruct can't know that
     * - Builder is clearer when constructing from multiple sources
     */
    public CommentResponse addComment(Long postId, CommentRequest request, String currentUserEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        User author = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .author(author)
                .post(post)
                .build();

        Comment saved = commentRepository.save(comment);
        return commentMapper.toResponse(saved);
    }

    /**
     * LIST COMMENTS for a specific post (newest first).
     *
     * Why @Transactional(readOnly = true):
     * - Hints to Hibernate to skip dirty-checking — faster for read-only queries
     * - Also allows the DB to use read replicas if configured
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPostId(Long postId) {
        // Verify the post exists — return 404 if not (not an empty list)
        // Why: an empty list for a non-existent post is misleading — 404 is semantically correct
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with id: " + postId);
        }

        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId).stream()
                .map(commentMapper::toResponse)
                .toList();
    }
}


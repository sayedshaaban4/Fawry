package com.blogPlatform.fawryBook.service;

import com.blogPlatform.fawryBook.dto.request.PostRequest;
import com.blogPlatform.fawryBook.dto.response.PostResponse;
import com.blogPlatform.fawryBook.entity.Post;
import com.blogPlatform.fawryBook.entity.User;
import com.blogPlatform.fawryBook.enums.ReactionType;
import com.blogPlatform.fawryBook.exception.ResourceNotFoundException;
import com.blogPlatform.fawryBook.exception.UnauthorizedActionException;
import com.blogPlatform.fawryBook.mapper.PostMapper;
import com.blogPlatform.fawryBook.repository.CommentRepository;
import com.blogPlatform.fawryBook.repository.PostRepository;
import com.blogPlatform.fawryBook.repository.ReactionRepository;
import com.blogPlatform.fawryBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Why a Service layer (not logic in the controller):
 * - Single Responsibility: controller handles HTTP, service handles business rules
 * - Reusable: other services or scheduled jobs can call the same logic
 * - @Transactional: wraps each method in a DB transaction — if anything fails, ALL changes roll back
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;
    private final PostMapper postMapper;

    /** CREATE — Build a new post and attach the current user as author. */
    public PostResponse createPost(PostRequest request, String currentUserEmail) {
        User author = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Post post = postMapper.toEntity(request);
        post.setAuthor(author);

        Post saved = postRepository.save(post);
        return enrichResponse(postMapper.toResponse(saved));
    }

    /** READ ALL — All posts, newest first. */
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(post -> enrichResponse(postMapper.toResponse(post)))
                .toList();
    }

    /** READ ONE — Full post detail view. */
    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        return enrichResponse(postMapper.toResponse(post));
    }

    /** UPDATE — Edit an existing post (only if the current user is the author). */
    public PostResponse updatePost(Long id, PostRequest request, String currentUserEmail) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        validateOwnership(post, currentUserEmail);

        postMapper.updateEntity(request, post);
        return enrichResponse(postMapper.toResponse(post));
    }

    /** DELETE — Remove a post (only if the current user is the author). */
    public void deletePost(Long id, String currentUserEmail) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        validateOwnership(post, currentUserEmail);

        postRepository.delete(post);
    }

    /** Checks that the logged-in user owns the post. Throws 403 if not. */
    private void validateOwnership(Post post, String currentUserEmail) {
        if (!post.getAuthor().getEmail().equals(currentUserEmail)) {
            throw new UnauthorizedActionException("You can only modify your own posts");
        }
    }

    /** Enriches a PostResponse with computed like/dislike/comment counts and rating. */
    private PostResponse enrichResponse(PostResponse response) {
        Long postId = response.getId();

        long likes = reactionRepository.countByPostIdAndType(postId, ReactionType.LIKE);
        long dislikes = reactionRepository.countByPostIdAndType(postId, ReactionType.DISLIKE);

        response.setLikeCount(likes);
        response.setDislikeCount(dislikes);
        response.setCommentCount(commentRepository.countByPostId(postId));

        long total = likes + dislikes;
        response.setRating(total > 0 ? (double) likes / total : 0.0);

        return response;
    }
}


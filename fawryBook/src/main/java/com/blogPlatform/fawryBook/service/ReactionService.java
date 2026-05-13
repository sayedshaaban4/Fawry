package com.blogPlatform.fawryBook.service;

import com.blogPlatform.fawryBook.dto.request.ReactionRequest;
import com.blogPlatform.fawryBook.dto.response.ReactionResponse;
import com.blogPlatform.fawryBook.entity.Post;
import com.blogPlatform.fawryBook.entity.Reaction;
import com.blogPlatform.fawryBook.entity.User;
import com.blogPlatform.fawryBook.enums.ReactionType;
import com.blogPlatform.fawryBook.exception.ResourceNotFoundException;
import com.blogPlatform.fawryBook.repository.PostRepository;
import com.blogPlatform.fawryBook.repository.ReactionRepository;
import com.blogPlatform.fawryBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Why all reaction logic (add/toggle/remove) lives in ONE method:
 * - The client sends { "type": "LIKE" } — the service figures out the right action:
 *   1. No existing reaction → CREATE new one
 *   2. Same type already exists → REMOVE it (toggle off — user "unlikes")
 *   3. Different type exists → SWITCH it (user changes from like to dislike)
 * - This "upsert" pattern means ONE endpoint handles all three cases
 * - The frontend just sends the desired reaction — no need to know the current state
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /**
     * Handles the "react to a post" action with toggle/switch logic.
     *
     * Why @Transactional: if we delete + re-create (for a switch), both operations
     * must succeed or fail together — no partial state
     */
    public ReactionResponse reactToPost(Long postId, ReactionRequest request, String currentUserEmail) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Look up any existing reaction by this user on this post
        // Why findByUserIdAndPostId: the unique constraint guarantees at most ONE result
        Optional<Reaction> existingReaction = reactionRepository.findByUserIdAndPostId(user.getId(), postId);

        ReactionType requestedType = request.getType();
        String message;
        ReactionType currentReaction;

        if (existingReaction.isPresent()) {
            Reaction reaction = existingReaction.get();

            if (reaction.getType() == requestedType) {
                // CASE 2: Same type → TOGGLE OFF (remove the reaction)
                // Why delete (not set to null): keeps the DB clean — no "empty" reaction rows
                reactionRepository.delete(reaction);
                message = requestedType.name() + " removed";
                currentReaction = null;
            } else {
                // CASE 3: Different type → SWITCH (e.g., LIKE → DISLIKE)
                // Why update in-place (not delete + create): one UPDATE query instead of DELETE + INSERT
                reaction.setType(requestedType);
                message = "Switched to " + requestedType.name().toLowerCase();
                currentReaction = requestedType;
            }
        } else {
            // CASE 1: No existing reaction → CREATE new
            Reaction reaction = Reaction.builder()
                    .type(requestedType)
                    .user(user)
                    .post(post)
                    .build();
            reactionRepository.save(reaction);
            message = "Post " + requestedType.name().toLowerCase() + "d";
            currentReaction = requestedType;
        }

        // Flush changes so count queries see the latest state
        reactionRepository.flush();

        // Why fetch counts AFTER the action: ensures the response reflects the updated state
        long likeCount = reactionRepository.countByPostIdAndType(postId, ReactionType.LIKE);
        long dislikeCount = reactionRepository.countByPostIdAndType(postId, ReactionType.DISLIKE);

        return ReactionResponse.builder()
                .currentReaction(currentReaction)
                .message(message)
                .likeCount(likeCount)
                .dislikeCount(dislikeCount)
                .build();
    }
}


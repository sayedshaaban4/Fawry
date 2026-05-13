package com.blogPlatform.fawryBook.repository;

import com.blogPlatform.fawryBook.entity.Reaction;
import com.blogPlatform.fawryBook.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Why findByUserIdAndPostId:
 * - Before creating a reaction, we check if one already exists for this user+post combo
 * - If it exists with the same type → remove (toggle off)
 * - If it exists with opposite type → update (switch vote)
 * - If it doesn't exist → create new
 *
 * Why countByPostIdAndType:
 * - Efficiently computes like/dislike counts for the post response DTO
 * - Delegated to the DB (COUNT query) rather than loading all reactions into memory
 */
@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByUserIdAndPostId(Long userId, Long postId);

    long countByPostIdAndType(Long postId, ReactionType type);
}


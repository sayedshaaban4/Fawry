package com.blogPlatform.fawryBook.repository;

import com.blogPlatform.fawryBook.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Why findByPostId:
 * - Returns all comments for a specific post, ordered by newest first
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostIdOrderByCreatedAtDesc(Long postId);

    long countByPostId(Long postId);
}


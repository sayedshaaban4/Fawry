package com.blogPlatform.fawryBook.repository;

import com.blogPlatform.fawryBook.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Why extend JpaRepository:
 * - Gives us findAll() for free — used in the post feed endpoint
 * - Spring Data generates the SQL at runtime from method names — zero boilerplate
 *
 * Why findAllByOrderByCreatedAtDesc:
 * - Feed shows newest posts first (most natural for a blog platform)
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();
}


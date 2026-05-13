package com.blogPlatform.fawryBook.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Separate table for comments so they can be:
 * - Paginated independently (GET /api/posts/{id}/comments?page=0&size=10)
 * - Queried without loading the full Post entity
 * - Extended later (e.g., replies, edits) without touching the Post table
 */
@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "CLOB")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    // Why ManyToOne: each comment belongs to exactly one user, but a user can have many comments
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    // Why ManyToOne: each comment belongs to exactly one post
    private Post post;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}


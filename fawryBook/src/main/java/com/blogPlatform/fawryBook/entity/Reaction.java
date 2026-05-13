package com.blogPlatform.fawryBook.entity;

import com.blogPlatform.fawryBook.enums.ReactionType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Stores a user's like or dislike on a post.
 *
 * Why a single table with an enum (not separate Like/Dislike tables):
 * - Simpler schema — one table, one unique constraint
 * - Easy to switch from LIKE to DISLIKE (just update the type column)
 * - The unique constraint on (user_id, post_id) enforces "one action per user per post"
 *   at the database level, preventing race conditions
 *
 * Why EnumType.STRING (not ORDINAL): stored as "LIKE"/"DISLIKE" text in DB —
 * safer because adding new enum values won't shift ordinal positions
 */
@Entity
@Table(
    name = "reactions",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_reaction_user_post",
        columnNames = {"user_id", "post_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReactionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
}


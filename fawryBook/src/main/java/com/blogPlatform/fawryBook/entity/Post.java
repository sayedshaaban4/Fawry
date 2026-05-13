package com.blogPlatform.fawryBook.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Core content unit of the platform.
 * - author FK (ManyToOne) enforces ownership — used for edit/delete authorization checks
 * - @ElementCollection for tags: stores tags in a separate join table without needing a full Tag entity
 *   (simpler than ManyToMany when tags don't need their own lifecycle)
 * - @UpdateTimestamp auto-sets updatedAt on every UPDATE — tracks last edit time
 */
@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "CLOB")
    // Why CLOB: blog content can be very long; VARCHAR2 in Oracle is limited to 4000 bytes
    private String content;

    @ElementCollection
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    // Why @ElementCollection: tags are simple strings owned by the Post — no need for a separate Tag entity
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    // Why LAZY: when listing posts, we don't always need the full User object loaded immediately
    private User author;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    // Why cascade ALL + orphanRemoval: when a post is deleted, its comments should be deleted too
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Reaction> reactions = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}


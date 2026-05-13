package com.blogPlatform.fawryBook.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Central identity entity.
 * - email is the login key (unique constraint prevents duplicate accounts)
 * - password is stored as a BCrypt hash (never plain text)
 * - @CreationTimestamp auto-sets createdAt on INSERT — no manual code needed
 */
@Entity
@Table(name = "users") // "user" is a reserved word in Oracle SQL, so we use "users"
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Why IDENTITY: lets the DB auto-generate IDs via an auto-increment column (Oracle 12c+ supports this)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    // Why unique: prevents two accounts with the same email at the DB level (defense in depth)
    private String email;

    @Column(nullable = false)
    private String password;

    private String country;

    @CreationTimestamp
    @Column(updatable = false)
    // Why updatable=false: createdAt should never change after initial insert
    private LocalDateTime createdAt;
}


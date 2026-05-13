package com.blogPlatform.fawryBook.enums;

/**
 * Why an enum instead of a String column:
 * - Restricts values to LIKE/DISLIKE at compile time (no typos like "LIEK")
 * - JPA stores it as a VARCHAR via @Enumerated(EnumType.STRING), making DB values readable
 */
public enum ReactionType {
    LIKE,
    DISLIKE
}


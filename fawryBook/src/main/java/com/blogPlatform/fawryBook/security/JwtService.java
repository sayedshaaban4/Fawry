package com.blogPlatform.fawryBook.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/**
 * Why a dedicated JwtService class:
 * - Centralizes ALL token logic (generate, validate, extract claims) in one place
 * - Other classes (filter, auth controller) delegate here — no duplicated JWT code
 *
 * Why HS256 (HMAC-SHA256):
 * - Symmetric algorithm — same secret key signs and verifies
 * - Perfect for a single-server app (no need for public/private key pair like RS256)
 * - Fast and simple to configure
 *
 * Why @Value for secret & expiration:
 * - Externalizes config to application.properties — never hardcoded in source code
 * - Easy to change per environment (dev/staging/prod) without recompiling
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    // Why configurable expiration: short-lived tokens (e.g., 24h) limit damage if a token is stolen
    private long expirationMs;

    /**
     * Generates a JWT token with the user's email as the subject.
     * Why email as subject: it's the unique login identifier — used by the filter
     * to load the user from the DB on each request.
     * if need to add role like admin ha use claims -> need to read it
     */
    public String generateToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(userDetails.getUsername()) // email in our case
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                // Why signWith: attaches the HMAC signature — any tampering invalidates the token
                .compact();
    }

    /**
     * Extracts the email (subject) from the token.
     * Used by JwtAuthenticationFilter to identify who is making the request.
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Validates that:
     * 1. The token's subject matches the loaded UserDetails username (email)
     * 2. The token hasn't expired
     *
     * Why both checks: a valid signature alone isn't enough — the token could be
     * expired or belong to a different user if the secret was compromised.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // ======================== Private helpers ========================

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /**
     * Generic claim extractor — uses a Function to pull any claim from the token.
     * Why generic: avoids writing separate methods for subject, expiration, etc.
     */
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses and verifies the token signature in one step.
     * If the signature is invalid or the token is malformed, JJWT throws an exception.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Decodes the Base64-encoded secret into an HMAC key.
     * Why Base64: allows the secret in application.properties to be a safe ASCII string
     * while still producing a strong 256-bit key.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}


package com.blogPlatform.fawryBook.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Why extend OncePerRequestFilter:
 * - Guarantees this filter runs exactly ONCE per request (even with internal forwards/dispatches)
 * - Spring's default Filter interface may fire multiple times per request — this avoids that
 *
 * Why a filter (not an interceptor or AOP):
 * - Filters execute BEFORE the DispatcherServlet — if the token is invalid,
 *   we reject the request before any controller code runs
 * - This is the standard Spring Security pattern for stateless JWT auth
 *
 * How it works:
 * 1. Extract "Bearer <token>" from the Authorization header
 * 2. Parse the token to get the email (subject)
 * 3. Load UserDetails from DB
 * 4. Validate token (signature + expiry + email match)
 * 5. Set Authentication in SecurityContextHolder so downstream code can call authentication.getName()
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Step 1: Extract the Authorization header
        final String authHeader = request.getHeader("Authorization");

        // If no header or not a Bearer token, skip JWT processing and continue the filter chain.
        // Why skip (not reject): some endpoints (e.g., /api/auth/login) are public and don't need a token.
        // SecurityConfig decides which endpoints require auth — this filter just PROVIDES auth info.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 2: Extract the token (strip "Bearer " prefix)
        final String jwt = authHeader.substring(7);
        final String email = jwtService.extractEmail(jwt);

        // Step 3: If email was extracted and no auth is set yet, validate and authenticate
        // Why check SecurityContextHolder: prevents re-authenticating if another filter already set it
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Step 4: Load UserDetails from DB
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // Step 5: Validate token
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // Step 6: Create authentication token and set it in the context
                // Why UsernamePasswordAuthenticationToken: Spring Security's standard auth token
                // — despite the name, it works for any authentication mechanism
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null, // credentials are null — we already verified via JWT
                                userDetails.getAuthorities()
                        );

                // Why setDetails: attaches request metadata (IP address, session ID)
                // — useful for audit logging
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Now SecurityContextHolder.getContext().getAuthentication() is available
                // in controllers via the Authentication parameter
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Continue the filter chain — request proceeds to the next filter or controller
        filterChain.doFilter(request, response);
    }
}


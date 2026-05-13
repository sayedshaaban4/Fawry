package com.blogPlatform.fawryBook.security;

import com.blogPlatform.fawryBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Why implement UserDetailsService:
 * - Spring Security's authentication manager calls loadUserByUsername() during login
 * - The JWT filter also uses it to reload the user on each request (to verify the token's subject exists)
 *
 * Why a separate class (not inline lambda in SecurityConfig):
 * - Cleaner separation of concerns
 * - Testable in isolation (mock UserRepository, assert correct UserDetails)
 *
 * Why Collections.emptyList() for authorities:
 * - This app has no role-based access control (all authenticated users have the same permissions)
 * - Ownership checks (edit/delete own posts) are handled in the service layer, not via Spring roles
 * - If you later need roles (ADMIN, MODERATOR), add a roles field to the User entity
 *   and map them to GrantedAuthority here
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.blogPlatform.fawryBook.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Builds Spring Security's UserDetails from our entity.
        // Why User.builder(): creates an immutable UserDetails with email as username,
        // the hashed password for BCrypt comparison, and empty authorities.
        return new User(
                user.getEmail(),
                user.getPassword(),
                Collections.emptyList()
        );
    }
}


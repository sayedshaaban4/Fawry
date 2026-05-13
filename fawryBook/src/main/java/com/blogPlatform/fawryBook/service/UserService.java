package com.blogPlatform.fawryBook.service;

import com.blogPlatform.fawryBook.dto.request.UpdateUserRequest;
import com.blogPlatform.fawryBook.dto.response.UserResponse;
import com.blogPlatform.fawryBook.entity.User;
import com.blogPlatform.fawryBook.exception.ResourceNotFoundException;
import com.blogPlatform.fawryBook.mapper.UserMapper;
import com.blogPlatform.fawryBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Why a dedicated UserService (not putting this in AuthService):
 * - Single Responsibility: AuthService handles authentication, UserService handles profile management
 * - Different access patterns: auth endpoints are public, profile endpoints require a valid JWT
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * GET /api/users/ — Returns the currently logged-in user's profile.
     *
     * Why accept email (not user ID):
     * - The email comes from the JWT token (authentication.getName())
     * - No ID guessing or enumeration attacks — a user can ONLY fetch their own profile
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    /**
     * PUT /api/users/ — Updates the currently logged-in user's profile.
     *
     * Why manual field-by-field update (not MapStruct updateEntity):
     * - All fields are optional — only non-null values should be updated
     * - MapStruct would overwrite fields with null if the client didn't send them
     * - This pattern is called "partial update" or "patch semantics with PUT"
     *
     * Why no save() call:
     * - JPA dirty-checking detects the field changes within the @Transactional boundary
     * - Hibernate automatically flushes an UPDATE SQL at commit — less code, same result
     */
    public UserResponse updateCurrentUser(String email, UpdateUserRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Only update fields that were provided (non-null)
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }

        return userMapper.toResponse(user);
    }
}


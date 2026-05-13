package com.blogPlatform.fawryBook.mapper;

import com.blogPlatform.fawryBook.dto.response.UserResponse;
import com.blogPlatform.fawryBook.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Why MapStruct for User mapping:
 * - Compile-time type safety — if fields are renamed, the build fails (not a runtime NPE)
 * - password field is automatically excluded via @Mapping(ignore = true)
 *   on any method that produces a UserResponse (it simply doesn't exist in the DTO)
 *
 * Why componentModel = "spring":
 * - Makes the generated mapper a Spring bean — injectable via @Autowired / constructor injection
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Maps User entity → UserResponse DTO.
     * The password field is NOT in UserResponse, so it's automatically excluded —
     * no @Mapping(ignore) needed. MapStruct only maps matching field names.
     */
    UserResponse toResponse(User user);
}


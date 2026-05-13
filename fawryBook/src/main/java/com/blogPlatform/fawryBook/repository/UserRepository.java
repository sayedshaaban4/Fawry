package com.blogPlatform.fawryBook.repository;

import com.blogPlatform.fawryBook.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Why JpaRepository (not CrudRepository):
 * - Includes pagination & sorting support out of the box (PagingAndSortingRepository)
 * - Provides flush/batch operations useful for performance tuning
 *
 * Why findByEmail returns Optional:
 * - Forces callers to handle the "not found" case explicitly — prevents NullPointerExceptions
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}


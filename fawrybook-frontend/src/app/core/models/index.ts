/**
 * TypeScript models matching backend DTOs
 * 
 * Why create these interfaces:
 * - Type safety: TypeScript will catch errors at compile time
 * - IntelliSense: IDE autocomplete for all properties
 * - Documentation: Clear contract between frontend and backend
 * - Matches the backend DTOs exactly (see backend/dto folder)
 */

// ============ Request DTOs (sent TO backend) ============

/**
 * LoginRequest - matches backend LoginRequest.java
 * POST /api/auth/login
 */
export interface LoginRequest {
  email: string;      // Must be valid email format
  password: string;   // Required, no min length (existing passwords may vary)
}

/**
 * RegisterRequest - matches backend RegisterRequest.java
 * POST /api/auth/register
 */
export interface RegisterRequest {
  firstName: string;  // Required
  lastName: string;   // Required
  email: string;      // Must be valid email format
  password: string;   // Minimum 6 characters
  country?: string;   // Optional - the ? means this field can be undefined
}

/**
 * PostRequest - for creating/updating posts
 * POST /api/posts
 * PUT /api/posts/{id}
 */
export interface PostRequest {
  title: string;
  content: string;
  tags?: string[];    // Optional - can be empty array or undefined
}

/**
 * CommentRequest - for adding comments
 * POST /api/posts/{postId}/comments
 */
export interface CommentRequest {
  content: string;
}

/**
 * ReactionRequest - for like/dislike
 * POST /api/posts/{postId}/reactions
 */
export interface ReactionRequest {
  type: ReactionType;  // LIKE or DISLIKE (see enum below)
}

/**
 * UpdateUserRequest - for editing user profile
 * PUT /api/users/{id}
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  country?: string;
  // Note: email and password updates would require separate endpoints for security
}

// ============ Response DTOs (received FROM backend) ============

/**
 * AuthResponse - returned after login/register
 * Contains JWT token and basic user info
 */
export interface AuthResponse {
  token: string;      // JWT token - store this in localStorage
  email: string;      // User's email
  fullName: string;   // Combined firstName + lastName from backend
}

/**
 * UserResponse - full user profile data
 * GET /api/users/{id}
 */
export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country?: string;
  createdAt: string;  // ISO date string (e.g., "2026-05-13T12:00:00")
}

/**
 * PostResponse - blog post with computed stats
 * GET /api/posts or GET /api/posts/{id}
 */
export interface PostResponse {
  id: number;
  title: string;
  content: string;
  tags?: string[];
  
  // Author info (flattened - no nested User object)
  authorId: number;
  authorName: string;
  
  // Computed statistics from backend
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  rating: number;         // 0.0 to 1.0 (likes / total reactions)
  
  // Timestamps
  createdAt: string;      // ISO date string
  updatedAt: string;      // ISO date string
}

/**
 * CommentResponse - comment with author info
 * GET /api/posts/{postId}/comments
 */
export interface CommentResponse {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;  // ISO date string
}

/**
 * ReactionResponse - result of like/dislike action
 * POST /api/posts/{postId}/reactions
 */
export interface ReactionResponse {
  currentReaction: ReactionType | null;  // null if reaction was removed
  message: string;                       // e.g., "Post liked", "Like removed"
  likeCount: number;                     // Updated count
  dislikeCount: number;                  // Updated count
}

/**
 * PaginatedResponse - wrapper for paginated data
 * Spring Boot Page<T> structure
 */
export interface PaginatedResponse<T> {
  content: T[];           // The actual data array
  totalElements: number;  // Total items across all pages
  totalPages: number;     // Total number of pages
  size: number;          // Items per page
  number: number;        // Current page number (0-indexed)
  first: boolean;        // Is this the first page?
  last: boolean;         // Is this the last page?
  empty: boolean;        // Is the content array empty?
}

// ============ Enums ============

/**
 * ReactionType - matches backend ReactionType.java enum
 */
export enum ReactionType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE'
}

// ============ Helper Types ============

/**
 * ApiError - standard error response structure
 * Used when backend returns 4xx or 5xx errors
 */
export interface ApiError {
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
}

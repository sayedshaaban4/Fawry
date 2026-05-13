import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PostRequest, PostResponse, PaginatedResponse } from '../models';

/**
 * PostService - handles blog post CRUD operations
 * 
 * Why this service:
 * - Centralizes all post-related API calls
 * - Components don't need to know API details (URL, headers, etc.)
 * - Reusable across multiple components
 * - Easy to mock for testing
 * 
 * Backend endpoints (from PostController.java):
 * - POST /api/posts - create new post
 * - GET /api/posts - list all posts (paginated)
 * - GET /api/posts/{id} - get single post
 * - PUT /api/posts/{id} - update post
 * - DELETE /api/posts/{id} - delete post
 * 
 * All endpoints except GET require authentication (JWT token)
 * JwtInterceptor automatically adds Authorization header
 */
@Injectable({
  providedIn: 'root'
})
export class PostService {
  /**
   * Base API URL for posts
   * Comes from environment.ts
   * Development: http://localhost:8080/api
   */
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  /**
   * Get all posts
   * 
   * Backend endpoint: GET /api/posts
   * Response: List<PostResponse>
   * 
   * @returns Observable<PostResponse[]>
   */
  getAllPosts(): Observable<PostResponse[]> {
    console.log('Fetching all posts');
    return this.http.get<PostResponse[]>(this.apiUrl);
  }

  /**
   * Get a single post by ID
   * 
   * Backend endpoint: GET /api/posts/{id}
   * Response: PostResponse with full details
   * 
   * @param id - post ID
   * @returns Observable<PostResponse>
   * 
   * Includes:
   * - Post content (title, content, tags)
   * - Author info (authorId, authorName)
   * - Statistics (likeCount, dislikeCount, commentCount, rating)
   * - Timestamps (createdAt, updatedAt)
   * 
   * Used by:
   * - PostDetailComponent (show full post)
   * - PostFormComponent (load post for editing)
   */
  getPostById(id: number): Observable<PostResponse> {
    console.log(`Fetching post ${id}`);
    
    return this.http.get<PostResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new blog post
   * 
   * Backend endpoint: POST /api/posts
   * Request body: { title, content, tags }
   * Response: PostResponse (created post with ID)
   * 
   * @param post - post data (title, content, tags)
   * @returns Observable<PostResponse>
   * 
   * Requires authentication:
   * - JwtInterceptor adds Authorization header
   * - Backend extracts author from JWT token
   * - Backend sets authorId automatically
   * 
   * Flow:
   * 1. User fills create form
   * 2. Component calls createPost()
   * 3. HTTP POST to backend
   * 4. Backend creates post, assigns ID and authorId
   * 5. Returns created post
   * 6. Component navigates to post detail page
   */
  createPost(post: PostRequest): Observable<PostResponse> {
    console.log('Creating post:', post);
    
    return this.http.post<PostResponse>(this.apiUrl, post);
  }

  /**
   * Update an existing post
   * 
   * Backend endpoint: PUT /api/posts/{id}
   * Request body: { title, content, tags }
   * Response: PostResponse (updated post)
   * 
   * @param id - post ID to update
   * @param post - updated post data
   * @returns Observable<PostResponse>
   * 
   * Authorization:
   * - Requires JWT token
   * - Backend checks if current user is the author
   * - Returns 403 Forbidden if not the owner
   * - See PostService.java updatePost() method
   * 
   * Flow:
   * 1. User clicks edit on their post
   * 2. Load post data into form
   * 3. User modifies and submits
   * 4. Component calls updatePost()
   * 5. Backend validates ownership
   * 6. Updates post if authorized
   * 7. Returns updated post
   */
  updatePost(id: number, post: PostRequest): Observable<PostResponse> {
    console.log(`Updating post ${id}:`, post);
    
    return this.http.put<PostResponse>(`${this.apiUrl}/${id}`, post);
  }

  /**
   * Delete a post
   * 
   * Backend endpoint: DELETE /api/posts/{id}
   * Response: 204 No Content (empty response)
   * 
   * @param id - post ID to delete
   * @returns Observable<void>
   * 
   * Authorization:
   * - Requires JWT token
   * - Backend checks if current user is the author
   * - Returns 403 Forbidden if not the owner
   * 
   * Why void return:
   * - DELETE returns 204 No Content (no body)
   * - Observable completes without emitting value
   * - Component just needs to know success/error
   * 
   * Flow:
   * 1. User clicks delete on their post
   * 2. Component shows confirmation dialog
   * 3. User confirms
   * 4. Component calls deletePost()
   * 5. Backend validates ownership and deletes
   * 6. Component navigates to home page
   */
  deletePost(id: number): Observable<void> {
    console.log(`Deleting post ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

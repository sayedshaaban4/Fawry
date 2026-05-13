import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommentRequest, CommentResponse, PaginatedResponse } from '../models';

/**
 * CommentService - handles comment operations
 * 
 * Why this service:
 * - Centralizes comment-related API calls
 * - Comments are always associated with a post
 * - Handles pagination for comment lists
 * 
 * Backend endpoints (from CommentController.java):
 * - POST /api/posts/{postId}/comments - add comment to post
 * - GET /api/posts/{postId}/comments - get comments for post (paginated)
 * 
 * Note: Comments are nested under posts in the API
 * URL structure: /api/posts/{postId}/comments
 * This makes the relationship clear
 */
@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  /**
   * Add a comment to a post
   * 
   * Backend endpoint: POST /api/posts/{postId}/comments
   * Request body: { content }
   * Response: CommentResponse (created comment with ID, author info, timestamp)
   * 
   * @param postId - ID of post to comment on
   * @param comment - comment data (just content)
   * @returns Observable<CommentResponse>
   * 
   * Requires authentication:
   * - JwtInterceptor adds Authorization header
   * - Backend extracts author from JWT token
   * - Backend sets authorId and authorName automatically
   * 
   * Flow:
   * 1. User types comment in post detail page
   * 2. Clicks submit
   * 3. Component calls addComment()
   * 4. Backend creates comment
   * 5. Returns comment with ID and metadata
   * 6. Component adds comment to list (or refreshes)
   * 
   * Example response:
   * {
   *   id: 123,
   *   content: "Great post!",
   *   authorId: 45,
   *   authorName: "John Doe",
   *   createdAt: "2026-05-13T15:30:00"
   * }
   */
  addComment(postId: number, comment: CommentRequest): Observable<CommentResponse> {
    console.log(`Adding comment to post ${postId}:`, comment);
    
    return this.http.post<CommentResponse>(`${this.apiUrl}/${postId}/comments`, comment);
  }

  /**
   * Get all comments for a post
   * 
   * Backend endpoint: GET /api/posts/{postId}/comments
   * Response: List<CommentResponse>
   * 
   * @param postId - ID of post
   * @returns Observable<CommentResponse[]>
   */
  getCommentsByPostId(postId: number): Observable<CommentResponse[]> {
    console.log(`Fetching comments for post ${postId}`);
    return this.http.get<CommentResponse[]>(`${this.apiUrl}/${postId}/comments`);
  }

  /**
   * Future enhancements (not in current scope):
   * 
   * 1. Delete comment:
   *    deleteComment(commentId: number): Observable<void>
   *    Requires backend endpoint: DELETE /api/comments/{id}
   * 
   * 2. Edit comment:
   *    updateComment(commentId: number, content: string): Observable<CommentResponse>
   *    Requires backend endpoint: PUT /api/comments/{id}
   * 
   * 3. Like comment:
   *    likeComment(commentId: number): Observable<void>
   *    Requires backend endpoint: POST /api/comments/{id}/like
   * 
   * These features would require additional backend endpoints
   * Not in current requirements, but could be added later
   */
}

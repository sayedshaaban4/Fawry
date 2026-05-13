import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReactionRequest, ReactionResponse } from '../models';

/**
 * ReactionService - handles like/dislike operations
 * 
 * Why this service:
 * - Manages post reactions (like/dislike)
 * - Simple API: just one endpoint for toggle/switch
 * - Backend handles all logic (create/update/delete)
 * 
 * Backend endpoint (from ReactionController.java):
 * - POST /api/posts/{postId}/reactions - react to post (like/dislike/remove)
 * 
 * How reactions work (from backend comments):
 * 1. First time: creates reaction (like or dislike)
 * 2. Same type again: removes it (toggle off - "unlike")
 * 3. Different type: switches it (like → dislike or dislike → like)
 * 
 * Example:
 * - User has no reaction → clicks Like → creates LIKE
 * - User has LIKE → clicks Like → removes reaction
 * - User has LIKE → clicks Dislike → switches to DISLIKE
 */
@Injectable({
  providedIn: 'root'
})
export class ReactionService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  /**
   * React to a post (like/dislike/remove)
   * 
   * Backend endpoint: POST /api/posts/{postId}/reactions
   * Request body: { type: 'LIKE' | 'DISLIKE' }
   * Response: ReactionResponse
   * 
   * @param postId - ID of post to react to
   * @param reaction - reaction type (LIKE or DISLIKE)
   * @returns Observable<ReactionResponse>
   * 
   * Requires authentication:
   * - JwtInterceptor adds Authorization header
   * - Backend extracts user from JWT
   * - Backend finds user's existing reaction (if any)
   * - Backend applies toggle/switch logic
   * 
   * Response includes:
   * - currentReaction: LIKE | DISLIKE | null (null if removed)
   * - message: "Post liked", "Like removed", "Switched to dislike", etc.
   * - likeCount: updated like count
   * - dislikeCount: updated dislike count
   * 
   * Why single endpoint for all actions:
   * - Simpler API (no separate like/unlike/dislike endpoints)
   * - Backend handles logic (toggle off if same, switch if different)
   * - Frontend just sends desired type
   * 
   * Example responses:
   * 
   * 1. Like a post (first time):
   * {
   *   currentReaction: 'LIKE',
   *   message: 'Post liked',
   *   likeCount: 5,
   *   dislikeCount: 2
   * }
   * 
   * 2. Unlike (click like again):
   * {
   *   currentReaction: null,
   *   message: 'Like removed',
   *   likeCount: 4,
   *   dislikeCount: 2
   * }
   * 
   * 3. Switch from like to dislike:
   * {
   *   currentReaction: 'DISLIKE',
   *   message: 'Switched to dislike',
   *   likeCount: 4,
   *   dislikeCount: 3
   * }
   * 
   * UI usage:
   * 1. Show like/dislike buttons on each post
   * 2. Highlight button if user has that reaction
   * 3. On click: call reactToPost()
   * 4. Update UI based on response:
   *    - Update like/dislike counts
   *    - Update button states (highlighted or not)
   * 5. Show message to user (optional)
   * 
   * Flow:
   * 1. User clicks like button on post
   * 2. Component calls reactToPost(postId, { type: 'LIKE' })
   * 3. Backend checks user's current reaction
   * 4. Backend toggles/switches accordingly
   * 5. Returns updated counts and current state
   * 6. Component updates button states and counts
   */
  reactToPost(postId: number, reaction: ReactionRequest): Observable<ReactionResponse> {
    return this.http.post<ReactionResponse>(`${this.apiUrl}/${postId}/reactions`, reaction);
  }
}

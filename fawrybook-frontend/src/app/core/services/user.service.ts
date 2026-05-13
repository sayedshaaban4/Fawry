import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse, UpdateUserRequest } from '../models';

/**
 * UserService - User profile operations
 * 
 * Why this service:
 * - Handles user profile CRUD operations
 * - Manages API calls for user data
 * - Centralizes user-related HTTP requests
 * 
 * Backend endpoints:
 * - GET /api/users/me - get current user profile
 * - PUT /api/users/me - update current user profile
 * 
 * @Injectable({ providedIn: 'root' }) makes this a singleton
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get current user's profile
   * 
   * Backend endpoint: GET /api/users/
   * Response: UserResponse with full user details
   * 
   * @returns Observable<UserResponse>
   * 
   * Why / (not /me):
   * - User ID extracted from JWT token automatically by backend
   * - No need to pass user ID as parameter
   * - Prevents accessing other users' profiles
   * 
   * Includes:
   * - id, firstName, lastName, email
   * - country (optional)
   * - createdAt (account creation date)
   */
  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/`);
  }

  /**
   * Update current user's profile
   * 
   * Backend endpoint: PUT /api/users/
   * Request body: { firstName?, lastName?, country? }
   * Response: UserResponse with updated data
   * 
   * @param request - fields to update
   * @returns Observable<UserResponse>
   * 
   * Updatable fields:
   * - firstName
   * - lastName
   * - country
   * 
   * Non-updatable:
   * - email (requires verification)
   * - password (separate endpoint needed)
   */
  updateCurrentUser(request: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/`, request);
  }
}

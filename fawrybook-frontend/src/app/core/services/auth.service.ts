import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models';

/**
 * AuthService - handles user authentication and JWT token management
 * 
 * Why @Injectable({ providedIn: 'root' }):
 * - Creates a singleton service (one instance for entire app)
 * - Automatically registered in root injector - no need to add to providers array
 * - State (currentUser, token) is shared across all components
 * 
 * Why BehaviorSubject:
 * - Stores current authentication state
 * - Components can subscribe to get notified when auth state changes
 * - Always has a value (starts with null) - no waiting for first emission
 * - Replays last value to new subscribers (components get current state immediately)
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * BehaviorSubject to track current authenticated user
   * null = not logged in, AuthResponse = logged in
   * 
   * Private: internal state, components should use currentUser$ observable
   */
  private currentUserSubject: BehaviorSubject<AuthResponse | null>;
  
  /**
   * Public observable that components can subscribe to
   * $ suffix is RxJS convention for observables
   */
  public currentUser$: Observable<AuthResponse | null>;

  /**
   * Platform ID to check if we're in a browser
   * Why: localStorage only exists in browser, not during SSR
   */
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    // Check if we're running in a browser environment
    this.isBrowser = isPlatformBrowser(platformId);
    /**
     * Initialize from localStorage on app startup
     * Why: preserves login across page refreshes
     * 
     * Steps:
     * 1. Check if 'currentUser' exists in localStorage (browser only)
     * 2. If yes, parse JSON and restore the user object
     * 3. If no, start with null (not logged in)
     * 
     * SSR: During server-side rendering, localStorage doesn't exist
     * So we default to null (not logged in) on the server
     */
    const storedUser = this.isBrowser ? localStorage.getItem('currentUser') : null;
    this.currentUserSubject = new BehaviorSubject<AuthResponse | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Get current user value synchronously (without subscribing)
   * Useful for guards and interceptors that need immediate access
   */
  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Register a new user account
   * 
   * Backend endpoint: POST /api/auth/register
   * Request body: { firstName, lastName, email, password, country }
   * Response: { token, email, fullName }
   * 
   * @param request RegisterRequest object
   * @returns Observable<AuthResponse> - emits the auth response with JWT token
   * 
   * Why tap operator:
   * - Performs side effects (save to localStorage) without modifying the stream
   * - Component still gets the original AuthResponse
   * - Similar to forEach but for observables
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => {
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(response));
          }
          this.currentUserSubject.next(response);
        })
      );
  }

  /**
   * Login with existing account
   * 
   * Backend endpoint: POST /api/auth/login
   * Request body: { email, password }
   * Response: { token, email, fullName }
   * 
   * @param request LoginRequest object
   * @returns Observable<AuthResponse> - emits the auth response with JWT token
   * 
   * Flow:
   * 1. Send credentials to backend
   * 2. Backend validates and returns JWT token
   * 3. Save token to localStorage (persists across page refreshes)
   * 4. Update BehaviorSubject (notifies all components of login)
   * 5. Component can navigate to home page
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => {
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(response));
          }
          this.currentUserSubject.next(response);
        })
      );
  }

  /**
   * Logout current user
   * 
   * No backend call needed - JWT is stateless
   * Just remove local data and update state
   * 
   * Why no backend call:
   * - JWT tokens are stateless (no session on server)
   * - Backend doesn't track "logged in" users
   * - Just delete local token to prevent future requests
   * 
   * Note: In production, you might want to:
   * - Blacklist the token on backend (requires additional infrastructure)
   * - Use refresh tokens with revocation
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user is currently authenticated
   * 
   * @returns boolean - true if user has a token
   * 
   * Why this is useful:
   * - Quick check for auth guards
   * - Show/hide UI elements (login button vs user menu)
   * - Can be called synchronously (no subscribe needed)
   * 
   * Note: This only checks if token EXISTS, not if it's VALID
   * Backend will reject expired/invalid tokens (HTTP interceptor handles this)
   */
  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  /**
   * Get the JWT token for the current user
   * 
   * @returns string | null - the JWT token or null if not logged in
   * 
   * Used by:
   * - JWT interceptor (attaches to all HTTP requests)
   * - Manual API calls that need authorization
   */
  getToken(): string | null {
    const user = this.currentUserValue;
    return user ? user.token : null;
  }
}

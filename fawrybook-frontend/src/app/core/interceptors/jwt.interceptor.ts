import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * JWT Interceptor - automatically attaches JWT token to all HTTP requests
 * 
 * What is an HTTP interceptor:
 * - Sits between your app and the HTTP requests
 * - Intercepts EVERY outgoing request before it's sent
 * - Can modify the request (add headers, log, etc.)
 * - Can also intercept responses (handle errors globally)
 * 
 * Why we need this:
 * - Backend requires "Authorization: Bearer <token>" header for protected endpoints
 * - Without interceptor: every component must manually add this header (tedious!)
 * - With interceptor: add token once, automatically applied to ALL requests
 * 
 * How it works:
 * 1. Component calls http.get('/api/posts')
 * 2. Interceptor catches the request BEFORE it's sent
 * 3. Check if user is logged in (has token)
 * 4. If yes: clone request and add Authorization header
 * 5. If no: send request unchanged
 * 6. Pass modified request to next handler (sends to backend)
 * 
 * Why functional interceptor (not class-based):
 * - Angular 15+ recommends HttpInterceptorFn (simpler)
 * - No need for @Injectable or implements HttpInterceptor
 * - Just a function that takes request and next handler
 * 
 * Setup (in app.config.ts):
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([jwtInterceptor]))
 *   ]
 * };
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  /**
   * inject() - get AuthService instance
   * Must be at top level of interceptor function
   */
  const authService = inject(AuthService);

  /**
   * Get current JWT token from AuthService
   * Returns null if user is not logged in
   */
  const token = authService.getToken();

  /**
   * Check if we should add Authorization header
   * 
   * Conditions:
   * 1. Token exists (user is logged in)
   * 2. Request is going to OUR backend (not 3rd party APIs)
   * 
   * Why check URL:
   * - Don't send our JWT to external APIs (security!)
   * - Only attach token to requests going to environment.apiUrl
   * 
   * Example:
   * - http.get('/api/posts') → ADD TOKEN (our backend)
   * - http.get('https://api.github.com/users') → NO TOKEN (external API)
   */
  if (token && req.url.includes('/api/')) {
    /**
     * Clone the request and add Authorization header
     * 
     * Why clone:
     * - HTTP requests are immutable (can't modify original)
     * - req.clone() creates a new request with our changes
     * 
     * Header format:
     * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     * 
     * Why "Bearer":
     * - Standard prefix for JWT tokens (RFC 6750)
     * - Backend expects this exact format
     * - Spring Security's JwtAuthenticationFilter looks for "Bearer " prefix
     */
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(`JWT Interceptor: Added token to ${req.method} ${req.url}`);
    
    /**
     * Pass cloned request to next handler
     * next() sends request to backend (or next interceptor if multiple)
     */
    return next(clonedRequest);
  }

  /**
   * No token or external URL - send original request unchanged
   * 
   * Cases:
   * - User not logged in (token is null)
   * - Public endpoints (/api/auth/login, /api/auth/register)
   * - External API calls
   */
  console.log(`JWT Interceptor: No token needed for ${req.method} ${req.url}`);
  return next(req);
};

/**
 * Future enhancements (add if needed):
 * 
 * 1. Handle 401 Unauthorized (token expired):
 *    - Intercept response
 *    - If 401, logout user and redirect to login
 *    - Or refresh token automatically
 * 
 * 2. Add loading indicator:
 *    - Track pending requests
 *    - Show global spinner while any request is in progress
 * 
 * 3. Global error handling:
 *    - Catch all HTTP errors
 *    - Show user-friendly error messages
 *    - Log errors to monitoring service
 * 
 * Example with error handling:
 * 
 * return next(clonedRequest).pipe(
 *   catchError((error: HttpErrorResponse) => {
 *     if (error.status === 401) {
 *       // Token expired - logout and redirect
 *       authService.logout();
 *       router.navigate(['/login']);
 *     }
 *     return throwError(() => error);
 *   })
 * );
 */

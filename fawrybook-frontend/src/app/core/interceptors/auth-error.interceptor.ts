import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Auth Error Interceptor - Handles 401/403 errors and redirects to login
 * 
 * Why this interceptor:
 * - Automatically detects when user is not authenticated
 * - Redirects to login page for 401 (Unauthorized) or 403 (Forbidden) errors
 * - Provides better UX - user knows they need to login
 * - Centralized error handling - no need to handle in every component
 * 
 * HTTP Status Codes:
 * - 401 Unauthorized: No valid JWT token (not logged in or token expired)
 * - 403 Forbidden: Valid token but insufficient permissions
 * 
 * For this app, both mean "please login"
 * 
 * Why functional interceptor:
 * - Angular 15+ modern approach
 * - Simpler than class-based interceptors
 * - Uses inject() instead of constructor injection
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if error is 401 or 403
      if (error.status === 401 || error.status === 403) {
        console.log('Auth Error Interceptor: Unauthorized/Forbidden request detected');
        console.log('Redirecting to login page...');
        
        // Clear any stale auth data
        authService.logout();
        
        // Redirect to login page
        router.navigate(['/login'], {
          queryParams: { 
            returnUrl: router.url,
            reason: error.status === 401 ? 'session-expired' : 'authentication-required'
          }
        });
      }
      
      // Re-throw error so components can still handle it if needed
      return throwError(() => error);
    })
  );
};

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard - protects routes that require authentication
 * 
 * What is a guard:
 * - Function that runs BEFORE navigating to a route
 * - Returns true (allow navigation) or false (block navigation)
 * - Perfect for protecting pages like "create post" or "profile"
 * 
 * Why functional guard (not class-based):
 * - Angular 15+ recommends functional guards (simpler, less boilerplate)
 * - No need for @Injectable decorator or implements CanActivate
 * - Uses inject() function instead of constructor injection
 * 
 * How it works:
 * 1. User tries to navigate to /create-post
 * 2. Router calls canActivate()
 * 3. We check if user is authenticated
 * 4. If yes: return true (allow navigation)
 * 5. If no: redirect to /login and return false (block navigation)
 * 
 * Usage in app.routes.ts:
 * {
 *   path: 'create-post',
 *   component: CreatePostComponent,
 *   canActivate: [canActivate]  // ← attach guard here
 * }
 */
export const canActivate = () => {
  /**
   * inject() - Angular's standalone way to get services
   * Works inside functions (not just constructors)
   * Must be called at top level of function (not inside if/loops)
   */
  const authService = inject(AuthService);
  const router = inject(Router);

  /**
   * Check if user is logged in
   * authService.isAuthenticated() checks if JWT token exists
   */
  if (authService.isAuthenticated()) {
    // User has token - allow navigation
    console.log('Auth guard: User authenticated, allowing access');
    return true;
  }

  /**
   * User not logged in - redirect to login page
   * 
   * Why redirect instead of just blocking:
   * - Better UX: user knows WHY they can't access the page
   * - Login page can redirect back after successful login (future enhancement)
   * 
   * Why return false:
   * - Tells router to cancel the navigation
   * - Browser URL won't change to the protected route
   */
  console.log('Auth guard: User not authenticated, redirecting to login');
  router.navigate(['/login']);
  return false;
};

/**
 * Alternative: Check if user is NOT authenticated
 * 
 * Use case: redirect away from login page if already logged in
 * Example: if user is logged in and visits /login, redirect to home
 * 
 * Usage:
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [canActivatePublicOnly]
 * }
 */
export const canActivatePublicOnly = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Already logged in - redirect to home
    console.log('Public-only guard: User already logged in, redirecting to home');
    router.navigate(['/']);
    return false;
  }

  // Not logged in - allow access to login/register pages
  return true;
};

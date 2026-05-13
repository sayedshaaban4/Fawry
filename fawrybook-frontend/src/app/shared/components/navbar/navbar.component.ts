import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models';

/**
 * NavbarComponent - Navigation bar with authentication state
 * 
 * Why this component:
 * - Shows different links based on login state (login/register vs logout/profile)
 * - Displays current user name when logged in
 * - Provides consistent navigation across all pages
 * - Reusable - included once in app.component
 * 
 * Why standalone component:
 * - Angular 15+ best practice - no NgModule needed
 * - Simpler to use and test
 * - Self-contained with all dependencies declared
 * 
 * Imports explained:
 * - CommonModule: provides *ngIf, *ngFor, pipes
 * - RouterModule: provides routerLink, routerLinkActive for navigation
 * - takeUntil: RxJS operator for managing subscription cleanup
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  /**
   * Current authenticated user (null if not logged in)
   * Used in template to show/hide elements
   */
  currentUser: AuthResponse | null = null;

  /**
   * Subject for managing RxJS subscription cleanup
   * 
   * Why needed:
   * - Prevents memory leaks when component is destroyed
   * - Without this: subscription keeps running even after component is gone
   * - takeUntil(destroy$) automatically unsubscribes when destroy$ emits
   * 
   * Pattern:
   * 1. Create private Subject
   * 2. Use .pipe(takeUntil(destroy$)) on all subscriptions
   * 3. In ngOnDestroy: call destroy$.next() and destroy$.complete()
   */
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * ngOnInit - runs once when component is created
   * 
   * Why subscribe here:
   * - Get notified whenever auth state changes (login/logout)
   * - Update UI immediately when user logs in or out
   * - currentUser$ is a BehaviorSubject, so we get current value immediately
   * 
   * takeUntil(destroy$):
   * - Automatically unsubscribe when component is destroyed
   * - Prevents memory leaks
   */
  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        console.log('Navbar: Auth state changed', user ? `Logged in as ${user.fullName}` : 'Not logged in');
      });
  }

  /**
   * ngOnDestroy - cleanup when component is removed
   * 
   * Why needed:
   * - Completes the destroy$ Subject
   * - Triggers takeUntil to unsubscribe from currentUser$
   * - Prevents memory leaks
   * 
   * What happens:
   * 1. destroy$.next() emits a value
   * 2. takeUntil sees the emission and unsubscribes
   * 3. destroy$.complete() marks Subject as finished
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check if user is currently logged in
   * 
   * @returns boolean - true if user has token
   * 
   * Used in template:
   * - Show "Login" button if not authenticated
   * - Show "Logout" and user name if authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Logout current user
   * 
   * Flow:
   * 1. Call authService.logout() - clears localStorage and updates state
   * 2. AuthService emits null to currentUser$ observable
   * 3. Our subscription updates this.currentUser to null
   * 4. Template automatically hides authenticated elements
   * 5. Navigate to home page
   * 
   * Why navigate to home:
   * - If user is on /profile when they logout, that page won't make sense anymore
   * - Home page is safe for both authenticated and unauthenticated users
   */
  logout(): void {
    console.log('Navbar: Logging out user');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * LoadingSpinnerComponent - Reusable loading indicator
 * 
 * Why this component:
 * - Shows user that something is loading (better UX)
 * - Reusable across the app (post list, login, etc.)
 * - Prevents confusion when waiting for API responses
 * - Customizable message for different contexts
 * 
 * Usage example:
 * <app-loading-spinner [message]="'Loading posts...'"></app-loading-spinner>
 * 
 * Or with default message:
 * <app-loading-spinner></app-loading-spinner>
 * 
 * Why standalone:
 * - Can be imported anywhere without NgModule
 * - Self-contained and portable
 * - Angular 15+ best practice
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css'
})
export class LoadingSpinnerComponent {
  /**
   * @Input - allows parent component to pass data
   * 
   * message: what to show below the spinner
   * Default: 'Loading...' if parent doesn't provide one
   * 
   * How parent passes value:
   * <app-loading-spinner [message]="'Fetching posts...'"></app-loading-spinner>
   * 
   * Why optional with default:
   * - Most cases just need generic "Loading..."
   * - Can customize for specific contexts (e.g., "Logging in...")
   */
  @Input() message: string = 'Loading...';

  /**
   * @Input - size of spinner
   * 
   * 'small' | 'medium' | 'large'
   * Default: 'medium'
   * 
   * Use cases:
   * - small: inline loading (e.g., inside a button)
   * - medium: default for most cases
   * - large: full page loading
   * 
   * Usage:
   * <app-loading-spinner [size]="'large'"></app-loading-spinner>
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}

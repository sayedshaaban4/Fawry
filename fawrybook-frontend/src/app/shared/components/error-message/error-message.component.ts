import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ErrorMessageComponent - Reusable error display
 * 
 * Why this component:
 * - Consistent error styling across the app
 * - Shows user-friendly error messages
 * - Dismissible (user can close it)
 * - Reusable for form errors, API errors, validation errors
 * 
 * Usage examples:
 * 
 * 1. Simple error message:
 * <app-error-message [message]="'Login failed. Please try again.'"></app-error-message>
 * 
 * 2. With close handler:
 * <app-error-message 
 *   [message]="errorMsg" 
 *   (close)="errorMsg = ''">
 * </app-error-message>
 * 
 * 3. Custom type:
 * <app-error-message 
 *   [message]="'Your session has expired'" 
 *   [type]="'warning'">
 * </app-error-message>
 * 
 * Why standalone:
 * - Can be imported anywhere without NgModule
 * - Self-contained
 * - Angular 15+ best practice
 */
@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css'
})
export class ErrorMessageComponent {
  /**
   * @Input - error message to display
   * 
   * Can be:
   * - Simple string: 'Invalid email or password'
   * - API error message from backend
   * - Validation error from form
   * 
   * If empty or null: component won't render (handled in template with *ngIf)
   */
  @Input() message: string = '';

  /**
   * @Input - type of alert
   * 
   * Options:
   * - 'danger': red alert (errors, failures)
   * - 'warning': yellow alert (warnings, cautions)
   * - 'info': blue alert (informational messages)
   * 
   * Default: 'danger' (most common use case is errors)
   * 
   * Maps to Bootstrap alert classes:
   * - danger → .alert-danger
   * - warning → .alert-warning
   * - info → .alert-info
   */
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';

  /**
   * @Input - whether to show close button
   * 
   * true: shows X button to dismiss alert
   * false: no close button (must be handled by parent)
   * 
   * Default: true (most alerts should be dismissible)
   * 
   * Use case for false:
   * - Critical errors that user must acknowledge differently
   * - Form validation errors that clear on input change
   */
  @Input() dismissible: boolean = true;

  /**
   * @Output - event when alert is closed
   * 
   * EventEmitter: Angular way to send events to parent component
   * 
   * Parent component can listen:
   * <app-error-message 
   *   [message]="error" 
   *   (close)="clearError()">
   * </app-error-message>
   * 
   * Why needed:
   * - Parent component needs to know alert was closed
   * - Usually to clear the error message variable
   * - Allows parent to perform cleanup (log, analytics, etc.)
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Handle close button click
   * 
   * What happens:
   * 1. User clicks X button
   * 2. This method is called
   * 3. Emits 'close' event to parent
   * 4. Parent's (close) handler runs
   * 5. Parent usually clears message: this.errorMsg = ''
   * 6. Component disappears because *ngIf="message" is now false
   * 
   * Why void:
   * - We're just signaling that close happened
   * - No data needs to be passed to parent
   */
  onClose(): void {
    this.close.emit();
  }
}

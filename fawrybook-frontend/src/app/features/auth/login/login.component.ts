import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/**
 * LoginComponent - User login page
 * 
 * Why this component:
 * - Allows existing users to authenticate
 * - Validates email/password before sending to backend
 * - Stores JWT token on successful login
 * - Redirects to home page after login
 * 
 * Form approach:
 * - Reactive forms (not template-driven)
 * - Better for validation and type safety
 * - Easier to test
 * - More control over form state
 * 
 * Why standalone:
 * - Angular 15+ best practice
 * - No NgModule needed
 * - Explicit imports make dependencies clear
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,  // Required for reactive forms
    RouterModule,         // Required for routerLink
    ErrorMessageComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  /**
   * Reactive form for login
   * 
   * FormGroup: container for form controls
   * Contains email and password controls with validation
   * 
   * Why FormGroup:
   * - Type-safe access to form values
   * - Built-in validation
   * - Track form state (valid, dirty, touched)
   */
  loginForm!: FormGroup;

  /**
   * Loading state - shows spinner during API call
   * 
   * true: form is submitting (show spinner, disable submit button)
   * false: idle (show form normally)
   * 
   * Why needed:
   * - Prevents double-submit (user clicking login multiple times)
   * - Better UX (user knows something is happening)
   * - Disable form while processing
   */
  isLoading = false;

  /**
   * Error message to display
   * 
   * Empty string: no error
   * Non-empty: shows error alert
   * 
   * Examples:
   * - "Invalid email or password"
   * - "Network error. Please try again."
   * - Backend error messages
   */
  errorMessage = '';

  /**
   * URL to redirect to after successful login
   * Default: '/' (home page)
   * Can be set via query parameter: /login?returnUrl=/posts/123
   */
  returnUrl = '/';

  constructor(
    private fb: FormBuilder,      // For creating reactive forms
    private authService: AuthService,  // For login API call
    private router: Router,       // For navigation after login
    private route: ActivatedRoute // For reading query parameters
  ) {}

  /**
   * ngOnInit - initialize component
   * 
   * Runs once when component is created
   * Perfect place to build the form
   * 
   * Why here (not constructor):
   * - Constructor should be lightweight (dependency injection only)
   * - ngOnInit is Angular's hook for initialization logic
   * - Best practice for setup code
   */
  ngOnInit(): void {
    this.buildForm();
    
    // Read returnUrl from query parameters
    // Example: /login?returnUrl=/posts/123
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Read reason (optional) to show a helpful message
    const reason = this.route.snapshot.queryParams['reason'];
    if (reason === 'authentication-required') {
      this.errorMessage = 'Please login to continue';
    } else if (reason === 'session-expired') {
      this.errorMessage = 'Your session has expired. Please login again.';
    }
  }

  /**
   * Build the login form with validation
   * 
   * FormBuilder.group() creates a FormGroup
   * Each property is a FormControl with validators
   * 
   * Form structure matches backend LoginRequest:
   * - email: string (required, must be valid email)
   * - password: string (required)
   * 
   * Why these validators:
   * - required: field cannot be empty
   * - email: must match email format (user@example.com)
   * - Matches backend validation rules (see LoginRequest.java)
   */
  buildForm(): void {
    this.loginForm = this.fb.group({
      /**
       * Email control
       * 
       * Validators.required: cannot be empty
       * Validators.email: must be valid email format
       * 
       * Why both:
       * - required catches empty input
       * - email catches invalid format like "notanemail"
       */
      email: ['', [Validators.required, Validators.email]],

      /**
       * Password control
       * 
       * Only required validator (no min length)
       * 
       * Why no minLength:
       * - This is login, not registration
       * - User might have old password from before min-length rule
       * - Backend will reject if credentials are wrong anyway
       * - Matches backend LoginRequest (no @Size annotation)
       */
      password: ['', [Validators.required]]
    });
  }

  /**
   * Handle form submission
   * 
   * Called when user clicks "Login" button
   * 
   * Flow:
   * 1. Check if form is valid
   * 2. Set loading state
   * 3. Call authService.login() - TODO: implement backend call
   * 4. On success: navigate to home
   * 5. On error: show error message
   * 6. Finally: clear loading state
   * 
   * Why check form.valid:
   * - Don't send invalid data to backend
   * - Save unnecessary API call
   * - Better UX (show validation errors)
   */
  onSubmit(): void {
    /**
     * Clear previous error message
     * User might be retrying after fixing their input
     */
    this.errorMessage = '';

    /**
     * Validate form before submitting
     * 
     * loginForm.invalid: true if any validator fails
     * 
     * If invalid:
     * - Mark all fields as touched (shows validation errors in UI)
     * - Return early (don't call API)
     * 
     * Why markAllAsTouched:
     * - Validation errors only show on touched fields
     * - User might not have interacted with all fields yet
     * - Force show all errors so user can fix them
     */
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    /**
     * Show loading spinner
     * Disable form while processing
     */
    this.isLoading = true;

    /**
     * Get form values
     * 
     * loginForm.value returns object with all form values:
     * { email: 'user@example.com', password: 'password123' }
     * 
     * Type matches LoginRequest interface
     */
    const loginRequest = this.loginForm.value;

    console.log('Login form submitted:', loginRequest);

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        // Success: user is logged in
        // AuthService already stored token in localStorage
        // AuthService already updated currentUser$ observable
        console.log('Login successful:', response);
        
        // Navigate to returnUrl (or home if not specified)
        console.log('Redirecting to:', this.returnUrl);
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        // Failed: show error message
        console.error('Login failed:', error);
        
        // Extract error message from backend response
        // Error structure: { message: 'Invalid credentials', status: 401 }
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        
        // Clear loading state so user can retry
        this.isLoading = false;
      },
      complete: () => {
        // Always runs after next or error
        // Clear loading state
        this.isLoading = false;
      }
    });
  }

  /**
   * Check if a form field has validation errors and was touched
   * 
   * Used in template to show error messages below inputs
   * 
   * @param fieldName - name of form control ('email' or 'password')
   * @returns boolean - true if field is invalid and touched
   * 
   * Why check both invalid AND touched:
   * - Don't show errors on pristine fields (user hasn't interacted yet)
   * - Only show errors after user has typed and left the field
   * - Better UX (not overwhelming with errors immediately)
   * 
   * Example usage in template:
   * <div *ngIf="isFieldInvalid('email')">Email is required</div>
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get specific validation error for a field
   * 
   * Used in template to show specific error messages
   * 
   * @param fieldName - name of form control
   * @param errorName - name of validator ('required', 'email', etc.)
   * @returns boolean - true if field has that specific error
   * 
   * Why specific errors:
   * - Different error messages for different problems
   * - "Email is required" vs "Email is invalid"
   * - Better UX (user knows exactly what's wrong)
   * 
   * Example usage in template:
   * <div *ngIf="hasError('email', 'required')">Email is required</div>
   * <div *ngIf="hasError('email', 'email')">Email must be valid</div>
   */
  hasError(fieldName: string, errorName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.hasError(errorName) && field.touched);
  }
}

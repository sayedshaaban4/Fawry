import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/**
 * RegisterComponent - New user registration page
 * 
 * Why this component:
 * - Allows new users to create accounts
 * - Collects required user information
 * - Validates data before sending to backend
 * - Stores JWT token on successful registration
 * - Redirects to home page after registration
 * 
 * Form approach:
 * - Reactive forms for better validation control
 * - Type-safe form values
 * - Easy to test
 * - Custom validators if needed (e.g., password confirmation)
 * 
 * Differences from LoginComponent:
 * - More fields (firstName, lastName, country)
 * - Password has minimum length validation
 * - All fields except country are required
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ErrorMessageComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  /**
   * Reactive form for registration
   * 
   * FormGroup with 5 controls:
   * - firstName: required
   * - lastName: required
   * - email: required, valid email format
   * - password: required, minimum 6 characters
   * - country: optional
   * 
   * Matches backend RegisterRequest.java
   */
  registerForm!: FormGroup;

  /**
   * Loading state during API call
   * 
   * true: submitting (show spinner, disable form)
   * false: idle (show form)
   */
  isLoading = false;

  /**
   * Error message to display
   * 
   * Empty: no error
   * Non-empty: show error alert
   * 
   * Examples:
   * - "Email already exists"
   * - "Password too weak"
   * - Network errors
   */
  errorMessage = '';

  /**
   * Success message to display
   * 
   * Shows after successful registration
   * Before redirecting to home
   * 
   * Optional: can skip and just redirect immediately
   */
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  /**
   * Build registration form with validation
   * 
   * Form structure matches backend RegisterRequest:
   * - firstName: @NotBlank
   * - lastName: @NotBlank
   * - email: @NotBlank @Email
   * - password: @NotBlank @Size(min=6)
   * - country: optional (no annotation)
   * 
   * Frontend validation mirrors backend validation
   * Provides immediate feedback before API call
   */
  buildForm(): void {
    this.registerForm = this.fb.group({
      /**
       * First name control
       * 
       * Validators.required: cannot be empty
       * 
       * Matches backend: @NotBlank(message = "First name is required")
       */
      firstName: ['', [Validators.required]],

      /**
       * Last name control
       * 
       * Validators.required: cannot be empty
       * 
       * Matches backend: @NotBlank(message = "Last name is required")
       */
      lastName: ['', [Validators.required]],

      /**
       * Email control
       * 
       * Validators.required: cannot be empty
       * Validators.email: must be valid email format
       * 
       * Matches backend:
       * @NotBlank(message = "Email is required")
       * @Email(message = "Email must be valid")
       */
      email: ['', [Validators.required, Validators.email]],

      /**
       * Password control
       * 
       * Validators.required: cannot be empty
       * Validators.minLength(6): minimum 6 characters
       * 
       * Matches backend:
       * @NotBlank(message = "Password is required")
       * @Size(min = 6, message = "Password must be at least 6 characters")
       * 
       * Why 6 characters:
       * - Backend requirement (see RegisterRequest.java)
       * - Balance between security and usability
       * - Can be increased later if needed
       */
      password: ['', [Validators.required, Validators.minLength(6)]],

      /**
       * Country control
       * 
       * No validators: optional field
       * 
       * Matches backend: private String country; (no validation annotations)
       * 
       * Why optional:
       * - Not critical for basic functionality
       * - Can be added/updated later in profile
       * - Reduces registration friction
       */
      country: ['']
    });
  }

  /**
   * Handle form submission
   * 
   * Flow:
   * 1. Validate form
   * 2. Set loading state
   * 3. Call authService.register() - TODO: implement backend call
   * 4. On success: show success message, navigate to home
   * 5. On error: show error message
   * 6. Finally: clear loading state
   */
  onSubmit(): void {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    /**
     * Validate form before submitting
     * 
     * If invalid:
     * - Mark all fields as touched (shows all errors)
     * - Return early (don't call API)
     * - User can see what needs to be fixed
     */
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Show loading state
    this.isLoading = true;

    /**
     * Get form values
     * 
     * registerForm.value returns:
     * {
     *   firstName: 'John',
     *   lastName: 'Doe',
     *   email: 'john@example.com',
     *   password: 'password123',
     *   country: 'USA'
     * }
     * 
     * Type matches RegisterRequest interface
     */
    const registerRequest = this.registerForm.value;

    console.log('Register form submitted:', { ...registerRequest, password: '***' });

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        // Success: user account created and logged in
        // AuthService already stored token in localStorage
        console.log('Registration successful:', response);
        
        // Show success message
        this.successMessage = 'Registration successful! Redirecting...';
        
        // Wait 1 second then navigate to home
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error) => {
        // Failed: show error message
        console.error('Registration failed:', error);
        
        // Extract error message from backend
        // Common errors:
        // - "Email already exists"
        // - "Validation failed"
        // - Network errors
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        
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
   * Check if a field is invalid and touched
   * 
   * Used to show/hide error messages
   * 
   * @param fieldName - name of form control
   * @returns boolean - true if field should show errors
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Check if a field has a specific error
   * 
   * Used to show specific error messages
   * 
   * @param fieldName - name of form control
   * @param errorName - name of validator
   * @returns boolean - true if field has that error
   */
  hasError(fieldName: string, errorName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.hasError(errorName) && field.touched);
  }
}

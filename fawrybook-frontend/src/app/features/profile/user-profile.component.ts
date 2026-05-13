import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserResponse } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

/**
 * UserProfileComponent - View current user's profile information
 * 
 * Why this component:
 * - Shows user's account details
 * - Allows viewing profile information
 * - Entry point for future profile editing features
 * 
 * Features:
 * - Displays user info (name, email, country, join date)
 * - Shows account statistics (posts, comments - TODO)
 * - View-only for simplicity (edit feature can be added later)
 * 
 * Design decision:
 * - View-only profile page for simplicity
 * - Edit functionality can be added as separate component later
 * - Focuses on displaying information clearly
 * 
 * URL: /profile
 * Protected by auth guard (must be logged in)
 */
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  /**
   * User profile data
   * 
   * Contains:
   * - id, firstName, lastName, email
   * - country (optional)
   * - createdAt (account creation date)
   */
  user: UserResponse | null = null;

  /**
   * Loading state
   */
  isLoading = false;

  /**
   * Error message
   */
  errorMessage = '';

  /**
   * Success message
   */
  successMessage = '';

  /**
   * Current user email from auth service
   * Used to identify which user to load
   */
  currentUserEmail: string | null = null;

  /**
   * Edit mode flag
   */
  isEditMode = false;

  /**
   * Form for editing profile
   */
  editForm!: FormGroup;

  /**
   * Submitting state
   */
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get current user from auth service
    const currentUser = this.authService.currentUserValue;
    this.currentUserEmail = currentUser ? currentUser.email : null;

    if (this.currentUserEmail) {
      this.loadUserProfile();
    } else {
      this.errorMessage = 'Not authenticated';
    }
  }

  /**
   * Load user profile from backend
   * 
   * Flow:
   * 1. Call API to fetch current user profile (GET /api/users/me)
   * 2. Display user information
   * 
   * Why fetch from API:
   * - AuthService only stores basic info (token, email, fullName)
   * - Profile needs full details (country, createdAt, etc.)
   * - Ensures data is up-to-date
   * 
   * Backend extracts user from JWT token automatically
   */
  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Loading user profile...');

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('User profile loaded successfully:', user);
        
        // Use setTimeout to avoid change detection issues
        setTimeout(() => {
          this.user = user;
          this.initializeForm();
          this.isLoading = false;
          console.log('Profile state updated, isLoading set to false');
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error('Failed to load user profile - ERROR:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        
        this.errorMessage = error.error?.message || 'Failed to load profile';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Initialize edit form with current user data
   * Fields are optional to allow partial updates
   */
  initializeForm(): void {
    if (!this.user) return;

    this.editForm = this.fb.group({
      firstName: [this.user.firstName, [Validators.minLength(2)]],
      lastName: [this.user.lastName, [Validators.minLength(2)]],
      country: [this.user.country || '']
    });
  }

  /**
   * Enter edit mode
   */
  enterEditMode(): void {
    this.isEditMode = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Cancel editing and return to view mode
   */
  cancelEdit(): void {
    this.isEditMode = false;
    this.initializeForm(); // Reset form to original values
    this.errorMessage = '';
  }

  /**
   * Submit profile update
   * Only sends fields that have values (allows partial updates)
   */
  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Only include fields that have values
    const formValue = this.editForm.value;
    const updateRequest: any = {};
    
    if (formValue.firstName && formValue.firstName.trim()) {
      updateRequest.firstName = formValue.firstName.trim();
    }
    if (formValue.lastName && formValue.lastName.trim()) {
      updateRequest.lastName = formValue.lastName.trim();
    }
    if (formValue.country !== undefined && formValue.country !== null) {
      updateRequest.country = formValue.country.trim();
    }

    this.userService.updateCurrentUser(updateRequest).subscribe({
      next: (updatedUser) => {
        console.log('Profile updated:', updatedUser);
        
        // Use setTimeout to avoid change detection issues
        setTimeout(() => {
          this.user = updatedUser;
          this.isEditMode = false;
          this.isSubmitting = false;
          this.successMessage = 'Profile updated successfully!';
          this.cdr.detectChanges();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        }, 0);
      },
      error: (error) => {
        console.error('Failed to update profile:', error);
        this.errorMessage = error.error?.message || 'Failed to update profile';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Check if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Format date for display
   * 
   * Shows when user joined the platform
   * 
   * @param dateString - ISO date string
   * @returns formatted date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}

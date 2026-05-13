import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommentRequest } from '../../../core/models';
import { ErrorMessageComponent } from '../error-message/error-message.component';

/**
 * AddCommentComponent - Form for adding comments to posts
 * 
 * Why separate component:
 * - Reusable for any context that needs comment input
 * - Encapsulates form logic and validation
 * - Easier to test form behavior independently
 * - Can be used on post detail, modals, etc.
 * 
 * Features:
 * - Reactive form with validation
 * - Submit button with loading state
 * - Error message display
 * - Auto-clears form on successful submit
 * 
 * Usage:
 * <app-add-comment
 *   [postId]="post.id"
 *   [isSubmitting]="isSubmittingComment"
 *   (submitComment)="onCommentSubmit($event)">
 * </app-add-comment>
 */
@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorMessageComponent
  ],
  templateUrl: './add-comment.component.html',
  styleUrl: './add-comment.component.css'
})
export class AddCommentComponent implements OnInit {
  /**
   * Post ID to comment on
   * 
   * Required input from parent
   * Parent must provide the post ID
   */
  @Input() postId!: number;

  /**
   * Submitting state from parent
   * 
   * true: comment being submitted to backend
   * false: idle
   * 
   * Parent controls this to show loading state
   * This component doesn't make API calls
   */
  @Input() isSubmitting = false;

  /**
   * Error message from parent
   * 
   * Parent sets this when submission fails
   * This component displays it
   */
  @Input() errorMessage = '';

  /**
   * Event emitted when user submits comment
   * 
   * Parent component should:
   * 1. Set isSubmitting = true
   * 2. Call API to save comment
   * 3. On success: add comment to list, call resetForm()
   * 4. On error: set errorMessage
   * 5. Set isSubmitting = false
   * 
   * Emits CommentRequest object: { content: string }
   */
  @Output() submitComment = new EventEmitter<CommentRequest>();

  /**
   * Comment form
   * 
   * Single field: content
   * Required, minimum 1 character
   */
  commentForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  /**
   * Build the comment form
   * 
   * Form structure matches backend CommentRequest:
   * - content: required, minLength 1
   */
  buildForm(): void {
    this.commentForm = this.fb.group({
      /**
       * Content field
       * 
       * Required
       * Minimum 1 character (prevents empty comments)
       * Backend: content (String, required)
       */
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  /**
   * Handle form submission
   * 
   * Flow:
   * 1. Validate form
   * 2. Create CommentRequest object
   * 3. Emit to parent component
   * 4. Parent handles API call
   * 5. Parent calls resetForm() on success
   */
  onSubmit(): void {
    // Validate form
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    // Create request object
    const request: CommentRequest = {
      content: this.commentForm.value.content.trim()
    };

    // Emit to parent
    this.submitComment.emit(request);
  }

  /**
   * Reset form to empty state
   * 
   * Called by parent component after successful submission
   * Clears the textarea
   * 
   * Why public:
   * - Parent needs to call this after API success
   * - Can't call automatically (don't know when API succeeds)
   */
  resetForm(): void {
    this.commentForm.reset();
    this.commentForm.markAsUntouched();
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorName: string): boolean {
    const field = this.commentForm.get(fieldName);
    return !!(field && field.hasError(errorName) && field.touched);
  }

  /**
   * Check if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.commentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

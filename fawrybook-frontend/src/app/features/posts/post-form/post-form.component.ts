import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { PostRequest } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

/**
 * PostFormComponent - Create or edit blog posts
 * 
 * Why this component:
 * - Reusable for both creating and editing posts
 * - Handles form validation
 * - Submits to backend API
 * 
 * Features:
 * - Form fields: title, content, tags
 * - Validation (required fields)
 * - Create mode: /create-post
 * - Edit mode: /edit-post/:id
 * - Auto-detects mode based on route
 * 
 * How it works:
 * - No post ID in route → create mode
 * - Post ID in route → edit mode (loads existing post)
 */
@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css'
})
export class PostFormComponent implements OnInit {
  /**
   * Post form
   */
  postForm!: FormGroup;

  /**
   * Edit mode flag
   * true: editing existing post
   * false: creating new post
   */
  isEditMode = false;

  /**
   * Post ID (for edit mode)
   */
  postId: number | null = null;

  /**
   * Loading states
   */
  isLoading = false;
  isSubmitting = false;

  /**
   * Error message
   */
  errorMessage = '';

  /**
   * Page title (changes based on mode)
   */
  pageTitle = 'Create Post';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.checkEditMode();
  }

  /**
   * Build the post form
   * 
   * Form structure matches backend PostRequest:
   * - title: required
   * - content: required
   * - tags: optional array
   */
  buildForm(): void {
    this.postForm = this.fb.group({
      /**
       * Title field
       * 
       * Required
       * Backend: title (String, required)
       */
      title: ['', [Validators.required, Validators.minLength(3)]],

      /**
       * Content field
       * 
       * Required, minimum 10 characters
       * Backend: content (String, required)
       */
      content: ['', [Validators.required, Validators.minLength(10)]],

      /**
       * Tags field
       * 
       * Optional
       * User enters comma-separated tags
       * We convert to array before sending
       * Backend: tags (List<String>, optional)
       */
      tags: ['']
    });
  }

  /**
   * Check if we're in edit mode
   * 
   * If route has :id parameter → edit mode
   * Otherwise → create mode
   */
  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.postId = +id;
      this.pageTitle = 'Edit Post';
      this.loadPost(+id);
    }
  }

  /**
   * Load existing post (for edit mode)
   */
  loadPost(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.postService.getPostById(id).subscribe({
      next: (post) => {
        console.log('Post loaded for editing:', post);
        
        // Use setTimeout to avoid change detection issues
        setTimeout(() => {
          // Populate form with existing data
          this.postForm.patchValue({
            title: post.title,
            content: post.content,
            tags: post.tags ? post.tags.join(', ') : ''
          });
          this.isLoading = false;
          console.log('Form populated, isLoading set to false');
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error('Failed to load post:', error);
        this.errorMessage = error.error?.message || 'Failed to load post';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Handle form submission
   * 
   * Flow:
   * 1. Validate form
   * 2. Convert tags string to array
   * 3. Call create or update based on mode
   * 4. Navigate to post detail page on success
   */
  onSubmit(): void {
    this.errorMessage = '';

    // Validate form
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Get form values
    const formValue = this.postForm.value;

    // Convert tags string to array
    const tags = formValue.tags
      ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
      : [];

    // Build request object
    const postRequest: PostRequest = {
      title: formValue.title,
      content: formValue.content,
      tags: tags.length > 0 ? tags : undefined
    };

    console.log('Post form submitted:', postRequest);

    if (this.isEditMode && this.postId) {
      this.updatePost(this.postId, postRequest);
    } else {
      this.createPost(postRequest);
    }
  }

  /**
   * Create new post
   */
  createPost(post: PostRequest): void {
    this.postService.createPost(post).subscribe({
      next: (createdPost) => {
        console.log('Post created:', createdPost);
        // Navigate to the new post detail page
        this.router.navigate(['/posts', createdPost.id]);
      },
      error: (error) => {
        console.error('Failed to create post:', error);
        this.errorMessage = error.error?.message || 'Failed to create post';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Update existing post
   */
  updatePost(id: number, post: PostRequest): void {
    this.postService.updatePost(id, post).subscribe({
      next: (updatedPost) => {
        console.log('Post updated:', updatedPost);
        // Navigate to the updated post detail page
        this.router.navigate(['/posts', updatedPost.id]);
      },
      error: (error) => {
        console.error('Failed to update post:', error);
        this.errorMessage = error.error?.message || 'Failed to update post';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    if (this.isEditMode && this.postId) {
      this.router.navigate(['/posts', this.postId]);
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Check if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.postForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Check if field has specific error
   */
  hasError(fieldName: string, errorName: string): boolean {
    const field = this.postForm.get(fieldName);
    return !!(field && field.hasError(errorName) && field.touched);
  }
}

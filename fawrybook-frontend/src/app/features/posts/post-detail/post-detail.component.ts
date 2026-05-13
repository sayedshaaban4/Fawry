import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { CommentService } from '../../../core/services/comment.service';
import { ReactionService } from '../../../core/services/reaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { PostResponse, CommentResponse, CommentRequest, ReactionType, AuthResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { CommentListComponent } from '../../../shared/components/comment-list/comment-list.component';
import { AddCommentComponent } from '../../../shared/components/add-comment/add-comment.component';

/**
 * PostDetailComponent - Single post view with comments and reactions
 * 
 * Why this component:
 * - Shows full post content (not just excerpt)
 * - Displays all comments
 * - Allows users to like/dislike
 * - Allows users to add comments
 * - Owner can edit/delete post
 * 
 * Features:
 * - Full post display
 * - Like/dislike buttons with counts
 * - Comment list with pagination (using CommentListComponent)
 * - Add comment form (using AddCommentComponent)
 * - Edit/delete buttons (for post owner)
 * 
 * Updated to use reusable comment components:
 * - CommentListComponent: displays comment list
 * - AddCommentComponent: handles comment form
 * 
 * URL: /posts/:id
 */
@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    CommentListComponent,
    AddCommentComponent
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  /**
   * Post data
   */
  post: PostResponse | null = null;

  /**
   * Comments array
   */
  comments: CommentResponse[] = [];

  /**
   * Reference to AddCommentComponent
   * 
   * Why ViewChild:
   * - Need to call resetForm() after successful comment submission
   * - Component exposes public resetForm() method
   * - ViewChild gives us access to component instance
   */
  @ViewChild(AddCommentComponent) addCommentComponent!: AddCommentComponent;

  /**
   * Loading states
   */
  isLoadingPost = false;
  isLoadingComments = false;
  isSubmittingComment = false;

  /**
   * Error messages
   */
  errorMessage = '';
  commentErrorMessage = '';

  /**
   * Current user info (for checking ownership)
   */
  currentUser: AuthResponse | null = null;

  /**
   * Expose ReactionType enum to template
   * 
   * Why: Templates can't directly access TypeScript enums
   * Solution: Create a readonly property that references the enum
   * Usage in template: ReactionType.LIKE, ReactionType.DISLIKE
   */
  readonly ReactionType = ReactionType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private commentService: CommentService,
    private reactionService: ReactionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get current user
    this.currentUser = this.authService.currentUserValue;

    // Get post ID from route and load post
    const postId = this.route.snapshot.paramMap.get('id');
    console.log('Post Detail - ngOnInit - Post ID from route:', postId);
    
    if (postId) {
      const numericPostId = +postId;
      console.log('Post Detail - Loading post with ID:', numericPostId);
      this.loadPost(numericPostId);
      this.loadComments(numericPostId);
    } else {
      console.error('Post Detail - No post ID found in route');
      this.errorMessage = 'Invalid post ID';
      this.isLoadingPost = false;
    }
  }

  /**
   * Load post by ID
   */
  loadPost(id: number): void {
    this.isLoadingPost = true;
    this.errorMessage = '';
    
    console.log('Loading post - setting isLoadingPost to true');

    this.postService.getPostById(id).subscribe({
      next: (post) => {
        console.log('Post loaded successfully:', post);
        this.post = post;
        this.isLoadingPost = false;
        console.log('Loading post - setting isLoadingPost to false');
        this.cdr.detectChanges(); // Manually trigger change detection
        console.log('Change detection triggered');
      },
      error: (error) => {
        console.error('Failed to load post - ERROR:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        this.errorMessage = error.error?.message || 'Failed to load post';
        this.isLoadingPost = false;
        console.log('Loading post failed - setting isLoadingPost to false');
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    });
  }

  /**
   * Load comments for post
   */
  loadComments(postId: number): void {
    this.isLoadingComments = true;

    this.commentService.getCommentsByPostId(postId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoadingComments = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load comments:', error);
        this.isLoadingComments = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Submit comment
   * 
   * Called when AddCommentComponent emits submitComment event
   * 
   * Flow:
   * 1. Receive CommentRequest from child component
   * 2. Set loading state
   * 3. Call API to save comment
   * 4. On success: add to list, reset form, update count
   * 5. On error: show error message
   * 
   * @param request - CommentRequest from add-comment component
   */
  onSubmitComment(request: CommentRequest): void {
    if (!this.post) {
      return;
    }

    this.isSubmittingComment = true;
    this.commentErrorMessage = '';

    this.commentService.addComment(this.post.id, request).subscribe({
      next: (comment) => {
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        // This defers the changes to the next change detection cycle
        setTimeout(() => {
          // Add new comment to the beginning of array
          this.comments = [comment, ...this.comments];
          
          // Increment comment count
          if (this.post) {
            this.post.commentCount++;
          }
          
          // Reset form via ViewChild
          if (this.addCommentComponent) {
            this.addCommentComponent.resetForm();
          }
          
          this.isSubmittingComment = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error('Failed to add comment:', error);
        this.commentErrorMessage = error.error?.message || 'Failed to add comment';
        this.isSubmittingComment = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * React to post (like/dislike)
   */
  reactToPost(type: ReactionType): void {
    if (!this.post) return;

    this.reactionService.reactToPost(this.post.id, { type }).subscribe({
      next: (response) => {
        // Use setTimeout to ensure UI updates properly
        setTimeout(() => {
          // Update post statistics
          if (this.post) {
            this.post.likeCount = response.likeCount;
            this.post.dislikeCount = response.dislikeCount;
            // Recalculate rating
            const total = response.likeCount + response.dislikeCount;
            this.post.rating = total > 0 ? response.likeCount / total : 0;
          }
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error('Failed to react to post:', error);
      }
    });
  }

  /**
   * Delete post
   */
  deletePost(): void {
    if (!this.post || !confirm('Are you sure you want to delete this post?')) {
      return;
    }

    this.postService.deletePost(this.post.id).subscribe({
      next: () => {
        // Navigate back to home
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Failed to delete post:', error);
        this.errorMessage = error.error?.message || 'Failed to delete post';
      }
    });
  }

  /**
   * Check if current user is post owner
   */
  isOwner(): boolean {
    return this.post !== null && 
           this.currentUser !== null && 
           this.post.authorName === this.currentUser.fullName;
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get rating percentage
   */
  getRatingPercentage(rating: number): number {
    return Math.round(rating * 100);
  }
}

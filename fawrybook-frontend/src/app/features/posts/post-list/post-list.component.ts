import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { ReactionService } from '../../../core/services/reaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { PostResponse, ReactionType, AuthResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

/**
 * PostListComponent - Home feed showing all blog posts
 * 
 * Why this component:
 * - Main landing page after login
 * - Shows all blog posts from all users
 * - Users can browse, click to read, see reactions
 * - Entry point to post detail pages
 * 
 * Features:
 * - Displays posts in card format
 * - Shows post metadata (author, date, stats)
 * - Pagination (load more posts)
 * - Links to post detail page
 * - Links to create new post (if authenticated)
 * 
 * This replaces the placeholder HomeComponent
 */
@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.css'
})
export class PostListComponent implements OnInit {
  /**
   * Array of posts to display
   */
  posts: PostResponse[] | undefined = [];

  /**
   * Loading state
   */
  isLoading = false;

  /**
   * Error message
   */
  errorMessage = '';

  /**
   * Track which posts are being reacted to
   */
  reactingPosts = new Set<number>();

  /**
   * Expose ReactionType enum to template
   */
  readonly ReactionType = ReactionType;

  /**
   * Check if user is authenticated
   */
  isAuthenticated = false;

  /**
   * Current user
   */
  currentUser: AuthResponse | null = null;

  constructor(
    private postService: PostService,
    private reactionService: ReactionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Load posts when component initializes
   */
  ngOnInit(): void {
    // Check authentication status
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Get current user
    this.currentUser = this.authService.currentUserValue;
    
    this.loadPosts();
  }

  /**
   * Load posts from backend
   */
  loadPosts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        console.log('Posts loaded:', posts);
        this.posts = posts;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load posts:', error);
        this.errorMessage = error.error?.message || 'Failed to load posts. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Get excerpt from post content
   * 
   * Truncates content to first 150 characters
   * Used in post cards to show preview
   * 
   * @param content - full post content
   * @param maxLength - maximum length (default 150)
   * @returns truncated string with "..." if truncated
   * 
   * Why needed:
   * - Post content can be very long
   * - Feed should show preview, not full content
   * - User clicks to read full post
   */
  getExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }

  /**
   * Format date for display
   * 
   * Converts ISO date string to readable format
   * Example: "2026-05-13T15:30:00" → "May 13, 2026"
   * 
   * @param dateString - ISO date string
   * @returns formatted date string
   * 
   * Could use date pipe in template instead:
   * {{ post.createdAt | date:'mediumDate' }}
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Calculate rating percentage for display
   * 
   * Backend returns rating as 0.0 to 1.0
   * Convert to percentage for UI display
   * 
   * @param rating - rating value (0.0 to 1.0)
   * @returns percentage (0 to 100)
   * 
   * Example: 0.88 → 88%
   */
  getRatingPercentage(rating: number): number {
    return Math.round(rating * 100);
  }

  /**
   * React to a post (like or dislike)
   * 
   * Flow:
   * 1. Check if user is authenticated (guard in template, but double-check here)
   * 2. Mark post as "reacting" (show loading state)
   * 3. Call reactionService.reactToPost()
   * 4. On success: update post counts in the list
   * 5. On error: show error message
   * 6. Finally: remove "reacting" state
   * 
   * Why update counts locally:
   * - Backend returns updated counts in response
   * - No need to reload entire post list
   * - Faster UI feedback
   * 
   * @param post - the post to react to
   * @param type - LIKE or DISLIKE
   */
  reactToPost(post: PostResponse, type: ReactionType): void {
    // Prevent if already reacting to this post
    if (this.reactingPosts.has(post.id)) {
      return;
    }

    // Must be authenticated
    if (!this.isAuthenticated) {
      this.errorMessage = 'Please login to react to posts';
      return;
    }

    // Mark as reacting (for loading state)
    this.reactingPosts.add(post.id);

    this.reactionService.reactToPost(post.id, { type }).subscribe({
      next: (response) => {
        console.log('Reaction response:', response);
        
        // Use setTimeout to ensure UI updates properly
        setTimeout(() => {
          // Update the post's counts with backend response
          post.likeCount = response.likeCount;
          post.dislikeCount = response.dislikeCount;
          
          // Recalculate rating
          const totalReactions = response.likeCount + response.dislikeCount;
          post.rating = totalReactions > 0 ? response.likeCount / totalReactions : 0;
          
          // Remove reacting state
          this.reactingPosts.delete(post.id);
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error('Failed to react to post:', error);
        this.errorMessage = error.error?.message || 'Failed to react to post';
        this.reactingPosts.delete(post.id);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Check if a post is currently being reacted to
   * Used to show loading state on buttons
   * 
   * @param postId - the post ID
   * @returns true if reaction in progress
   */
  isReacting(postId: number): boolean {
    return this.reactingPosts.has(postId);
  }

  /**
   * Check if current user owns a post
   * Used to show/hide edit and delete buttons
   * 
   * @param post - the post to check
   * @returns true if current user is the post author
   */
  isOwner(post: PostResponse): boolean {
    return this.currentUser !== null && post.authorName === this.currentUser.fullName;
  }

  /**
   * Delete a post
   * 
   * Flow:
   * 1. Show confirmation dialog
   * 2. Call postService.deletePost()
   * 3. On success: remove post from list
   * 4. On error: show error message
   * 
   * @param post - the post to delete
   */
  deletePost(post: PostResponse, event?: Event): void {
    // Prevent navigation to post detail when clicking delete
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    this.postService.deletePost(post.id).subscribe({
      next: () => {
        console.log('Post deleted successfully');
        
        // Remove post from list
        this.posts = this.posts?.filter(p => p.id !== post.id) || [];
        
        // Clear any previous errors
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to delete post:', error);
        this.errorMessage = error.error?.message || 'Failed to delete post';
        this.cdr.detectChanges();
      }
    });
  }
}

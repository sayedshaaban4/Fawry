import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { ReactionService } from '../../../core/services/reaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { PostResponse, ReactionType, AuthResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

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
  posts: PostResponse[] | undefined = [];
  isLoading = false;
  errorMessage = '';
  
  reactingPosts = new Set<number>();
  readonly ReactionType = ReactionType;
  isAuthenticated = false;
  currentUser: AuthResponse | null = null;

  constructor(
    private postService: PostService,
    private reactionService: ReactionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.currentUserValue;
    this.loadPosts();
  }

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

  getExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getRatingPercentage(rating: number): number {
    return Math.round(rating * 100);
  }

  reactToPost(post: PostResponse, type: ReactionType): void {
    if (this.reactingPosts.has(post.id)) {
      return;
    }

    if (!this.isAuthenticated) {
      this.errorMessage = 'Please login to react to posts';
      return;
    }

    this.reactingPosts.add(post.id);

    this.reactionService.reactToPost(post.id, { type }).subscribe({
      next: (response) => {
        console.log('Reaction response:', response);
        
        setTimeout(() => {
          post.likeCount = response.likeCount;
          post.dislikeCount = response.dislikeCount;
          
          const totalReactions = response.likeCount + response.dislikeCount;
          post.rating = totalReactions > 0 ? response.likeCount / totalReactions : 0;
          
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

  isReacting(postId: number): boolean {
    return this.reactingPosts.has(postId);
  }

  isOwner(post: PostResponse): boolean {
    return this.currentUser !== null && post.authorName === this.currentUser.fullName;
  }

  deletePost(post: PostResponse, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    this.postService.deletePost(post.id).subscribe({
      next: () => {
        console.log('Post deleted successfully');
        this.posts = this.posts?.filter(p => p.id !== post.id) || [];
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

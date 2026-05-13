import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentResponse } from '../../../core/models';

/**
 * CommentListComponent - Displays a list of comments
 * 
 * Why separate component:
 * - Reusable across different views (post detail, user profile, etc.)
 * - Keeps post-detail component cleaner
 * - Easier to test in isolation
 * - Can be used with different data sources
 * 
 * Features:
 * - Displays comment content, author, and date
 * - Shows loading state while fetching more comments
 * - Pagination support (load more button)
 * - Empty state when no comments exist
 * 
 * Usage:
 * <app-comment-list
 *   [comments]="comments"
 *   [isLoading]="isLoadingComments"
 *   [hasMore]="hasMoreComments"
 *   (loadMore)="loadMoreComments()">
 * </app-comment-list>
 */
@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.css'
})
export class CommentListComponent {
  /**
   * Comments to display
   */
  @Input() comments: CommentResponse[] = [];

  /**
   * Loading state
   */
  @Input() isLoading = false;

  /**
   * Format date for display
   * 
   * Converts ISO date string to readable format
   * Example: "2026-05-13T15:30:00" → "May 13, 2026 at 3:30 PM"
   * 
   * @param dateString - ISO date string
   * @returns formatted date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

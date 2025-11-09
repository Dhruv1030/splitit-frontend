import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ActivityService } from '../../../core/services/activity.service';
import { Activity, ActivityType } from '../../../core/models/activity.model';
import { ToastService } from '../../../core/services/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './activity-feed.html',
  styleUrls: ['./activity-feed.scss']
})
export class ActivityFeedComponent implements OnInit, OnDestroy {
  @Input() groupId?: number;
  @Input() userId?: string;
  @Input() maxItems = 20;
  @Input() showFilters = true;

  activities: Activity[] = [];
  loading = false;
  currentPage = 0;
  totalPages = 0;
  hasMore = false;
  selectedFilter: ActivityType | 'ALL' = 'ALL';
  
  private destroy$ = new Subject<void>();

  activityTypes = Object.values(ActivityType);

  constructor(
    private activityService: ActivityService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadActivities(append = false): void {
    if (this.loading) return;

    this.loading = true;
    const page = append ? this.currentPage + 1 : 0;

    const request$ = this.groupId
      ? this.activityService.getGroupActivities(this.groupId, page, this.maxItems)
      : this.userId
      ? this.activityService.getUserActivities(this.userId, page, this.maxItems)
      : null;

    if (!request$) {
      this.loading = false;
      this.toastService.error('Either groupId or userId must be provided');
      return;
    }

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('📊 Activity Feed Response:', response);
        console.log('📊 First activity:', response.content[0]);
        
        if (append) {
          this.activities = [...this.activities, ...response.content];
        } else {
          this.activities = response.content;
        }
        
        this.currentPage = response.number;
        this.totalPages = response.totalPages;
        this.hasMore = !response.last;
        this.loading = false;

        // Apply filter if selected
        if (this.selectedFilter !== 'ALL') {
          this.applyFilter(this.selectedFilter);
        }
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.toastService.error('Failed to load activities');
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    if (this.hasMore && !this.loading) {
      this.loadActivities(true);
    }
  }

  refresh(): void {
    this.currentPage = 0;
    this.loadActivities(false);
    this.toastService.success('Activities refreshed');
  }

  applyFilter(filter: ActivityType | 'ALL'): void {
    this.selectedFilter = filter;
    
    if (filter === 'ALL') {
      this.loadActivities(false);
      return;
    }

    // Filter activities locally
    this.loadActivities(false);
  }

  getFilteredActivities(): Activity[] {
    if (this.selectedFilter === 'ALL') {
      return this.activities;
    }
    return this.activities.filter(activity => activity.activityType === this.selectedFilter);
  }

  getActivityIcon(activityType: string): string {
    return this.activityService.getActivityIcon(activityType);
  }

  getActivityColor(activityType: string): string {
    return this.activityService.getActivityColor(activityType);
  }

  getRelativeTime(dateString: string): string {
    return this.activityService.getRelativeTime(dateString);
  }

  getFilterLabel(filter: ActivityType | 'ALL'): string {
    const labels: { [key: string]: string } = {
      'ALL': 'All Activities',
      'GROUP_CREATED': 'Group Created',
      'MEMBER_ADDED': 'Member Added',
      'MEMBER_REMOVED': 'Member Removed',
      'EXPENSE_ADDED': 'Expense Added',
      'EXPENSE_CREATED': 'Expense Created',
      'EXPENSE_UPDATED': 'Expense Updated',
      'EXPENSE_DELETED': 'Expense Deleted',
      'PAYMENT_RECORDED': 'Payment Recorded',
      'SETTLEMENT_COMPLETED': 'Settlement Completed'
    };
    return labels[filter] || filter;
  }

  trackByActivity(index: number, activity: Activity): number {
    return activity.id;
  }
}

import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ActivityService } from '../../../core/services/activity.service';
import { Activity, ActivityType } from '../../../core/models/activity.model';
import { ToastService } from '../../../core/services/toast.service';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './activity-feed.html',
  styleUrls: ['./activity-feed.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFeedComponent implements OnInit, OnChanges {
  /** Optional: pass groupId to show activities for a specific group */
  @Input() groupId?: number;
  /** Optional: max number of items to show (default: all) */
  @Input() maxItems?: number;
  @Input() initialFilter: ActivityType | 'ALL' = 'ALL';
  @Input() showFilters = true;

  private activityService = inject(ActivityService);
  private toastService = inject(ToastService);
  protected readonly authStore = inject(AuthStore);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  loading = false;
  hasMore = false;
  pageSize = 20;
  currentPage = 0;
  selectedFilter: ActivityType | 'ALL' = 'ALL';

  activityTypes: ActivityType[] = [
    ActivityType.EXPENSE_ADDED,
    ActivityType.EXPENSE_UPDATED,
    ActivityType.EXPENSE_DELETED,
    ActivityType.SETTLEMENT_COMPLETED,
    ActivityType.GROUP_CREATED,
    ActivityType.MEMBER_ADDED,
  ];

  ngOnInit(): void {
    this.selectedFilter = this.initialFilter;
    this.loadActivities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload if groupId changes after init
    if (changes['groupId'] && !changes['groupId'].firstChange) {
      this.loadActivities();
    }
  }

  loadActivities(loadMore = false): void {
    if (this.loading) return;

    this.loading = true;
    if (!loadMore) {
      this.currentPage = 0;
    }

    const size = this.maxItems ?? this.pageSize;
    const source$ = this.groupId
      ? this.activityService.getGroupActivities(this.groupId, this.currentPage, size)
      : (() => {
        const user = this.authStore.user();
        if (!user) {
          this.loading = false;
          this.cdr.markForCheck();
          return null;
        }
        return this.activityService.getUserActivities(user.id, this.currentPage, size);
      })();

    if (!source$) return;

    source$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const content = response?.content || [];
          if (loadMore) {
            this.activities = [...this.activities, ...content];
          } else {
            this.activities = content;
          }

          this.hasMore = !this.maxItems && !(response?.last ?? true);
          this.updateFilteredActivities();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('[ActivityFeedComponent] Error loading activities:', error);
          this.toastService.error('Failed to load activities');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadMore(): void {
    if (this.hasMore && !this.loading) {
      this.currentPage++;
      this.loadActivities(true);
    }
  }

  refresh(): void {
    this.loadActivities();
  }

  applyFilter(filter: ActivityType | 'ALL'): void {
    if (this.selectedFilter === filter) return;
    this.selectedFilter = filter;
    this.updateFilteredActivities();
    this.cdr.markForCheck();
  }

  private updateFilteredActivities(): void {
    if (!this.activities || !Array.isArray(this.activities)) {
      this.filteredActivities = [];
      return;
    }

    if (this.selectedFilter === 'ALL') {
      this.filteredActivities = [...this.activities];
    } else {
      this.filteredActivities = this.activities.filter(
        (activity) => activity.activityType === this.selectedFilter
      );
    }
  }

  getActivityIcon(activityType: string): string {
    return this.activityService.getActivityIcon(activityType);
  }

  getActivityColor(activityType: string): string {
    return this.activityService.getActivityColor(activityType);
  }

  getFilterLabel(type: string): string {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getRelativeTime(timestamp: string): string {
    return this.activityService.getRelativeTime(timestamp);
  }

  trackByActivity(index: number, activity: Activity): string {
    return activity.id?.toString() || index.toString();
  }
}

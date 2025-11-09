import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Activity, ActivityPage, ActivityCreate } from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated activities for a specific group
   */
  getGroupActivities(groupId: number, page = 0, size = 20): Observable<ActivityPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ActivityPage>(`${this.apiUrl}/group/${groupId}`, { params });
  }

  /**
   * Get recent activities for a group (last 10)
   */
  getRecentGroupActivities(groupId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/group/${groupId}/recent`);
  }

  /**
   * Get paginated activities for a specific user across all groups
   */
  getUserActivities(userId: string, page = 0, size = 20): Observable<ActivityPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ActivityPage>(`${this.apiUrl}/user/${userId}`, { params });
  }

  /**
   * Get activities within a date range for a group
   */
  getActivitiesByDateRange(
    groupId: number,
    startDate: Date,
    endDate: Date
  ): Observable<Activity[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<Activity[]>(`${this.apiUrl}/group/${groupId}/range`, { params });
  }

  /**
   * Get total count of activities for a group
   */
  getActivityCount(groupId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/group/${groupId}/count`);
  }

  /**
   * Create a new activity (usually called automatically by backend, but available if needed)
   */
  createActivity(activity: ActivityCreate): Observable<Activity> {
    return this.http.post<Activity>(this.apiUrl, activity);
  }

  /**
   * Get activity icon based on type
   */
  getActivityIcon(activityType: string): string {
    const icons: { [key: string]: string } = {
      'GROUP_CREATED': 'group_add',
      'MEMBER_ADDED': 'person_add',
      'MEMBER_REMOVED': 'person_remove',
      'EXPENSE_ADDED': 'add_circle',
      'EXPENSE_CREATED': 'add_circle',
      'EXPENSE_UPDATED': 'edit',
      'EXPENSE_DELETED': 'delete',
      'PAYMENT_RECORDED': 'payment',
      'SETTLEMENT_COMPLETED': 'check_circle'
    };
    return icons[activityType] || 'info';
  }

  /**
   * Get activity color based on type
   */
  getActivityColor(activityType: string): string {
    const colors: { [key: string]: string } = {
      'GROUP_CREATED': 'primary',
      'MEMBER_ADDED': 'accent',
      'MEMBER_REMOVED': 'warn',
      'EXPENSE_ADDED': 'primary',
      'EXPENSE_CREATED': 'primary',
      'EXPENSE_UPDATED': 'accent',
      'EXPENSE_DELETED': 'warn',
      'PAYMENT_RECORDED': 'success',
      'SETTLEMENT_COMPLETED': 'success'
    };
    return colors[activityType] || 'default';
  }

  /**
   * Format time relative to now (e.g., "2 hours ago", "yesterday")
   */
  getRelativeTime(dateString: string): string {
    if (!dateString) {
      return 'Unknown time';
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay === 1) {
      return 'yesterday';
    } else if (diffDay < 7) {
      return `${diffDay} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

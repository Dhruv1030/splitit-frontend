import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OfflineSyncService } from './offline-sync.service';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '../models/group.model';
import { ApiResponse } from '../models/api-response.model';
import { OverallBalance } from '../models/balance.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private http = inject(HttpClient);
  private offlineSync = inject(OfflineSyncService);
  private apiUrl = `${environment.apiUrl}/groups`;

  /**
   * Get all groups for the current user
   */
  getUserGroups(): Observable<ApiResponse<Group[]>> {
    if (!this.offlineSync.isOnline()) {
      return from(this.offlineSync.getCachedData<ApiResponse<Group[]>>('user-groups')).pipe(
        map(cached => cached || { success: true, data: [], message: 'Using offline data' })
      );
    }
    return this.http.get<ApiResponse<Group[]>>(this.apiUrl).pipe(
      tap(response => this.offlineSync.cacheData('user-groups', response))
    );
  }

  /**
   * Get a single group by ID
   */
  getGroup(groupId: number): Observable<ApiResponse<Group>> {
    return this.http.get<ApiResponse<Group>>(`${this.apiUrl}/${groupId}`);
  }

  /**
   * Create a new group
   */
  createGroup(request: CreateGroupRequest): Observable<ApiResponse<Group>> {
    if (!this.offlineSync.isOnline()) {
      this.offlineSync.queueAction('CREATE_GROUP', request);
      return of({
        success: true,
        message: 'Group being created offline.',
        data: { ...request, id: 0 } as any
      });
    }
    return this.http.post<ApiResponse<Group>>(this.apiUrl, request);
  }

  /**
   * Update an existing group
   */
  updateGroup(groupId: number, request: UpdateGroupRequest): Observable<ApiResponse<Group>> {
    return this.http.put<ApiResponse<Group>>(`${this.apiUrl}/${groupId}`, request);
  }

  /**
   * Delete a group
   */
  deleteGroup(groupId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${groupId}`);
  }

  /**
   * Add a member to a group
   */
  addMember(groupId: number, userId: string): Observable<ApiResponse<Group>> {
    return this.http.post<ApiResponse<Group>>(
      `${this.apiUrl}/${groupId}/members`,
      { userId }
    );
  }

  /**
   * Remove a member from a group
   */
  removeMember(groupId: number, userId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${groupId}/members/${userId}`);
  }

  /**
   * Get balance for all members in a group
   */
  getGroupBalance(groupId: number): Observable<ApiResponse<OverallBalance>> {
    return this.http.get<ApiResponse<OverallBalance>>(`${this.apiUrl}/${groupId}/balance`);
  }
}

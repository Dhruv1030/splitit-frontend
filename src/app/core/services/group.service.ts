import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '../models/group.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/groups`;

  /**
   * Get all groups for the current user
   */
  getUserGroups(): Observable<ApiResponse<Group[]>> {
    return this.http.get<ApiResponse<Group[]>>(this.apiUrl);
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
  addMember(groupId: number, userId: number): Observable<ApiResponse<Group>> {
    return this.http.post<ApiResponse<Group>>(`${this.apiUrl}/${groupId}/members/${userId}`, {});
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
  getGroupBalance(groupId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${groupId}/balance`);
  }
}

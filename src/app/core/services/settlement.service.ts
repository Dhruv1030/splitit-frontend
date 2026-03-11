import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Settlement, RecordSettlementRequest, FriendSettlementSuggestion } from '../models/settlement.model';
import { ApiResponse } from '../models/api-response.model';
import { SettlementSuggestionsResponse, PendingSettlement } from '../models/settlement-suggestion.model';

@Injectable({
  providedIn: 'root',
})
export class SettlementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/settlements`;

  /**
   * Get all settlements for a specific group
   */
  getGroupSettlements(groupId: number): Observable<ApiResponse<Settlement[]>> {
    return this.http.get<ApiResponse<Settlement[]>>(`${this.apiUrl}/group/${groupId}`);
  }

  /**
   * Get all settlements for the current user
   */
  getUserSettlements(): Observable<ApiResponse<Settlement[]>> {
    return this.http.get<ApiResponse<Settlement[]>>(`${this.apiUrl}/user`);
  }

  /**
   * Record a new settlement (group or friend)
   */
  recordSettlement(groupId: number | null, request: RecordSettlementRequest): Observable<Settlement> {
    return this.http.post<Settlement>(this.apiUrl, request);
  }

  /**
   * Get settlement suggestions for a group (optimized debt settlements)
   */
  getSettlementSuggestions(groupId: number): Observable<ApiResponse<SettlementSuggestionsResponse>> {
    return this.http.get<ApiResponse<SettlementSuggestionsResponse>>(`${this.apiUrl}/group/${groupId}/suggestions`);
  }

  /**
   * Get settlements by date range
   */
  getSettlementsByDateRange(
    startDate: string,
    endDate: string,
    groupId?: number
  ): Observable<ApiResponse<Settlement[]>> {
    let url = `${this.apiUrl}?startDate=${startDate}&endDate=${endDate}`;
    if (groupId) {
      url += `&groupId=${groupId}`;
    }
    return this.http.get<ApiResponse<Settlement[]>>(url);
  }

  /**
   * Get pending settlements (amounts still owed)
   */
  getPendingSettlements(groupId?: number): Observable<ApiResponse<PendingSettlement[]>> {
    const url = groupId
      ? `${this.apiUrl}/pending?groupId=${groupId}`
      : `${this.apiUrl}/pending`;
    return this.http.get<ApiResponse<PendingSettlement[]>>(url);
  }

  /**
   * Get settlement suggestion between current user and a friend.
   * Aggregates ALL debts (group + friend expenses) into a single net balance.
   */
  getFriendSettlementSuggestion(friendId: string): Observable<FriendSettlementSuggestion | null> {
    return this.http.get<FriendSettlementSuggestion | null>(`${this.apiUrl}/friend/${friendId}/suggestion`);
  }

  /**
   * Get all settlement history between current user and a friend
   */
  getFriendSettlements(friendId: string): Observable<Settlement[]> {
    return this.http.get<Settlement[]>(`${this.apiUrl}/friend/${friendId}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Settlement, RecordSettlementRequest } from '../models/settlement.model';
import { ApiResponse } from '../models/api-response.model';

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
   * Record a new settlement
   */
  recordSettlement(groupId: number, request: RecordSettlementRequest): Observable<ApiResponse<Settlement>> {
    return this.http.post<ApiResponse<Settlement>>(`${this.apiUrl}?groupId=${groupId}`, request);
  }

  /**
   * Get settlement suggestions for a group (optimized debt settlements)
   */
  getSettlementSuggestions(groupId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/group/${groupId}/suggestions`);
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
  getPendingSettlements(groupId?: number): Observable<ApiResponse<any[]>> {
    const url = groupId 
      ? `${this.apiUrl}/pending?groupId=${groupId}` 
      : `${this.apiUrl}/pending`;
    return this.http.get<ApiResponse<any[]>>(url);
  }
}

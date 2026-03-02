import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, from, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OfflineSyncService } from './offline-sync.service';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../models/expense.model';
import { ApiResponse } from '../models/api-response.model';
import { OverallBalance, GroupMemberBalance } from '../models/balance.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private http = inject(HttpClient);
  private offlineSync = inject(OfflineSyncService);
  private apiUrl = `${environment.apiUrl}/expenses`;

  /**
   * Create a new expense in a group
   */
  createExpense(groupId: number, request: CreateExpenseRequest): Observable<ApiResponse<Expense>> {
    const requestBody = { ...request, groupId };

    if (!this.offlineSync.isOnline()) {
      this.offlineSync.queueAction('CREATE_EXPENSE', requestBody);
      return of({
        success: true,
        message: 'Expense saved offline and will sync when you are back online.',
        data: { ...requestBody, id: 0 } as any // Temporary ID for UI
      });
    }

    return this.http.post<ApiResponse<Expense>>(this.apiUrl, requestBody);
  }

  /**
   * Get all expenses for a specific group
   */
  getGroupExpenses(groupId: number): Observable<ApiResponse<Expense[]>> {
    return this.http.get<ApiResponse<Expense[]>>(`${this.apiUrl}/group/${groupId}`);
  }

  /**
   * Get all expenses for the current user
   * Using /my-expenses endpoint (backend implementation confirmed working)
   */
  getUserExpenses(): Observable<ApiResponse<Expense[]>> {
    if (!this.offlineSync.isOnline()) {
      return from(this.offlineSync.getCachedData<ApiResponse<Expense[]>>('user-expenses')).pipe(
        map(cached => cached || { success: true, data: [], message: 'Using offline data' })
      );
    }
    return this.http.get<ApiResponse<Expense[]>>(`${this.apiUrl}/my-expenses`).pipe(
      tap(response => this.offlineSync.cacheData('user-expenses', response))
    );
  }

  /**
   * Get a single expense by ID
   */
  getExpense(expenseId: number): Observable<ApiResponse<Expense>> {
    return this.http.get<ApiResponse<Expense>>(`${this.apiUrl}/${expenseId}`);
  }

  /**
   * Update an existing expense
   */
  updateExpense(expenseId: number, request: UpdateExpenseRequest): Observable<ApiResponse<Expense>> {
    if (!this.offlineSync.isOnline()) {
      this.offlineSync.queueAction('UPDATE_EXPENSE', { ...request, id: expenseId });
      return of({ success: true, message: 'Update saved offline.', data: null as any });
    }
    return this.http.put<ApiResponse<Expense>>(`${this.apiUrl}/${expenseId}`, request);
  }

  /**
   * Delete an expense
   */
  deleteExpense(expenseId: number): Observable<ApiResponse<void>> {
    if (!this.offlineSync.isOnline()) {
      this.offlineSync.queueAction('DELETE_EXPENSE', { id: expenseId });
      return of({ success: true, message: 'Delete saved offline.', data: null as any });
    }
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${expenseId}`);
  }

  /**
   * Get user's balance in a specific group
   */
  getUserBalance(groupId: number): Observable<ApiResponse<OverallBalance>> {
    return this.http.get<ApiResponse<OverallBalance>>(`${this.apiUrl}/balance?groupId=${groupId}`);
  }

  /**
   * Get user's overall balance across all groups
   */
  getOverallBalance(): Observable<ApiResponse<OverallBalance>> {
    if (!this.offlineSync.isOnline()) {
      return from(this.offlineSync.getCachedData<ApiResponse<OverallBalance>>('overall-balance')).pipe(
        map(cached => cached || { success: true, data: { totalOwed: 0, totalOwing: 0, netBalance: 0 } as any, message: 'Using offline data' })
      );
    }
    return this.http.get<ApiResponse<OverallBalance>>(`${this.apiUrl}/balance`).pipe(
      tap(response => this.offlineSync.cacheData('overall-balance', response))
    );
  }

  /**
   * Get balances for all members in a group
   */
  getGroupBalances(groupId: number): Observable<GroupMemberBalance> {
    return this.http.get<GroupMemberBalance>(`${this.apiUrl}/group/${groupId}/balances`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../models/expense.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expenses`;

  /**
   * Create a new expense in a group
   */
  createExpense(groupId: number, request: CreateExpenseRequest): Observable<ApiResponse<Expense>> {
    // Include groupId in the request body
    const requestBody = { ...request, groupId };
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
    return this.http.get<ApiResponse<Expense[]>>(`${this.apiUrl}/my-expenses`);
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
    return this.http.put<ApiResponse<Expense>>(`${this.apiUrl}/${expenseId}`, request);
  }

  /**
   * Delete an expense
   */
  deleteExpense(expenseId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${expenseId}`);
  }

  /**
   * Get user's balance in a specific group
   */
  getUserBalance(groupId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/balance?groupId=${groupId}`);
  }

  /**
   * Get user's overall balance across all groups
   */
  getOverallBalance(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/balance`);
  }

  /**
   * Get balances for all members in a group
   */
  getGroupBalances(groupId: number): Observable<{ [userId: string]: number }> {
    return this.http.get<{ [userId: string]: number }>(`${this.apiUrl}/group/${groupId}/balances`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  searchUsers(query: string): Observable<User[]> {
    // Backend returns array directly, not wrapped in ApiResponse
    // Parameter name is 'query' for searching by name, email, or phone
    const params = new HttpParams().set('query', query);
    return this.http.get<User[]>(`${this.apiUrl}/search`, { params });
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  updateUser(userId: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, data);
  }

  getUserFriends(userId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${userId}/friends`);
  }

  addFriend(userId: string, friendId: string): Observable<void> {
    // Backend expects friendId as query parameter, not path parameter
    return this.http.post<void>(`${this.apiUrl}/${userId}/friends?friendId=${friendId}`, {});
  }

  removeFriend(userId: string, friendId: string): Observable<void> {
    // Backend expects friendId as query parameter, not path parameter
    return this.http.delete<void>(`${this.apiUrl}/${userId}/friends?friendId=${friendId}`);
  }

  getUsersByGroup(groupId: number): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/group/${groupId}`);
  }

  getCurrentUserProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`);
  }
}

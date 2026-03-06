import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { User, FriendRequest, SendFriendRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  searchUsers(query: string): Observable<User[]> {
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
    return this.http.post<void>(`${this.apiUrl}/${userId}/friends?friendId=${friendId}`, {});
  }

  removeFriend(userId: string, friendId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/friends?friendId=${friendId}`);
  }

  getUsersByGroup(groupId: number): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/group/${groupId}`);
  }

  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  // Friend Request Methods

  sendFriendRequest(request: SendFriendRequest): Observable<FriendRequest> {
    return this.http.post<FriendRequest>(`${this.apiUrl}/friend-requests`, request);
  }

  getPendingFriendRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/friend-requests/pending`);
  }

  getSentFriendRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/friend-requests/sent`);
  }

  acceptFriendRequest(requestId: string): Observable<FriendRequest> {
    return this.http.put<FriendRequest>(`${this.apiUrl}/friend-requests/${requestId}/accept`, {});
  }

  declineFriendRequest(requestId: string): Observable<FriendRequest> {
    return this.http.put<FriendRequest>(`${this.apiUrl}/friend-requests/${requestId}/decline`, {});
  }
}

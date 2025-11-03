import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = environment.apiUrl;

  constructor() {
    // Initialize current user from localStorage on service creation
    this.loadCurrentUser();
  }

  /**
   * Register a new user
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/register`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  /**
   * Login existing user
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/login`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  /**
   * Logout user - clear tokens and navigate to login
   */
  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      return false;
    }

    // Check if token is expired
    try {
      const payload = this.parseJwt(token);
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current logged in user
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Handle successful authentication response
   */
  private handleAuthResponse(response: any): void {
    console.log('[AuthService] Handling auth response:', response);
    
    if (!response.token) {
      console.error('[AuthService] No token in response!');
      return;
    }
    
    localStorage.setItem('jwt_token', response.token);
    console.log('[AuthService] JWT token saved to localStorage');
    
    // Backend returns user data in a 'user' object
    const userData = response.user || {};
    console.log('[AuthService] User data from response:', userData);
    
    // Create a user object from the auth response
    const user: User = {
      id: userData.id || userData.userId,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || userData.phoneNumber,
      defaultCurrency: userData.defaultCurrency || 'USD',
      friendIds: userData.friendIds || [],
      createdAt: userData.createdAt || new Date().toISOString(),
      emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : true
    };
    
    console.log('[AuthService] User object created:', user);
    
    if (!user.id || !user.email || !user.name) {
      console.error('[AuthService] Warning: User object has missing fields!', {
        hasId: !!user.id,
        hasEmail: !!user.email,
        hasName: !!user.name,
        originalResponse: response,
        userData: userData
      });
    }
    
    localStorage.setItem('current_user', JSON.stringify(user));
    console.log('[AuthService] Current user saved to localStorage');
    
    this.currentUserSubject.next(user);
  }

  /**
   * Load current user from localStorage
   */
  private loadCurrentUser(): void {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing current user:', error);
        this.currentUserSubject.next(null);
      }
    }
  }

  /**
   * Get user from localStorage
   */
  private getCurrentUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  /**
   * Parse JWT token to get payload
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

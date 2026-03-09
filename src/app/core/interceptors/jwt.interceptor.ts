import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Public endpoints that should never receive auth headers
const PUBLIC_ENDPOINTS = ['/users/register', '/users/login', '/users/refresh-token'];

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function addAuthHeaders(req: HttpRequest<unknown>): HttpRequest<unknown> {
  const token = localStorage.getItem('jwt_token');
  const currentUser = localStorage.getItem('current_user');

  if (!token) {
    return req;
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`
  };

  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      if (user.id) {
        headers['X-User-Id'] = user.id;
      }
    } catch {
      // Invalid user data in localStorage
    }
  }

  return req.clone({ setHeaders: headers });
}

function handleTokenRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.token);
        // Retry the original request with the new token
        return next(addAuthHeaders(req));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        // Refresh failed — force logout
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('current_user');
        router.navigate(['/login']);
        return throwError(() => refreshError);
      })
    );
  } else {
    // Another request is already refreshing — wait for the new token
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next(addAuthHeaders(req)))
    );
  }
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Skip auth headers for public endpoints
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => req.url.includes(endpoint));
  if (isPublicEndpoint) {
    return next(req);
  }

  // Add auth headers
  const authReq = addAuthHeaders(req);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Attempt silent token refresh before logging out
        return handleTokenRefresh(req, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

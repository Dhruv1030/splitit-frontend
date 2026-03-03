import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Public endpoints that should never receive auth headers
const PUBLIC_ENDPOINTS = ['/users/register', '/users/login'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Skip auth headers for public endpoints (register, login)
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => req.url.includes(endpoint));
  if (isPublicEndpoint) {
    return next(req).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  const token = localStorage.getItem('jwt_token');
  const currentUser = localStorage.getItem('current_user');

  // Clone request and add Authorization header if token exists
  if (token) {
    console.log('[JWT Interceptor] Adding token to request:', req.url);
    console.log('[JWT Interceptor] Token:', token.substring(0, 20) + '...');
    
    const headers: any = {
      'Authorization': `Bearer ${token}`
    };

    // Add X-User-Id header if user is logged in
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user.id) {
          headers['X-User-Id'] = user.id;
          console.log('[JWT Interceptor] Adding X-User-Id:', user.id);
        }
      } catch (e) {
        console.error('Error parsing current_user from localStorage:', e);
      }
    }

    req = req.clone({ setHeaders: headers });
  } else {
    console.warn('[JWT Interceptor] No token found for request:', req.url);
  }

  // Handle response and errors
  return next(req).pipe(
    catchError((error) => {
      // Auto logout on 401 Unauthorized
      if (error.status === 401) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('current_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

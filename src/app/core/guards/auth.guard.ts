import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('jwt_token');

  console.log('[AuthGuard] Checking authentication for:', state.url);
  console.log('[AuthGuard] Token present:', !!token);

  if (!token) {
    // Not authenticated, redirect to login
    console.log('[AuthGuard] No token found, redirecting to login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  console.log('[AuthGuard] Authentication successful');
  return true;
};

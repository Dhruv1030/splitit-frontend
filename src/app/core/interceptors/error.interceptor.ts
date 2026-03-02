import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';
import { AuthStore } from '../store/auth.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);
    const authStore = inject(AuthStore);

    return next(req).pipe(
        retry(1), // Retry once before failing
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unknown error occurred!';

            if (error.error instanceof ErrorEvent) {
                // Client-side or network error
                errorMessage = `Error: ${error.error.message}`;
            } else {
                // Backend returned an unsuccessful response code
                errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;

                if (error.status === 401) {
                    // Unauthorized - likely token expired
                    authStore.logout();
                    toastService.error('Session expired. Please login again.');
                } else if (error.status === 403) {
                    toastService.error('You do not have permission to perform this action.');
                } else if (error.status === 404) {
                    // Silent or handled by component if needed, but usually worth a toast if unexpected
                    toastService.error('Resource not found.');
                } else if (error.status >= 500) {
                    toastService.error('Server error. Please try again later.');
                } else {
                    toastService.error(errorMessage);
                }
            }

            console.error('[ErrorInterceptor]', error);
            return throwError(() => new Error(errorMessage));
        })
    );
};

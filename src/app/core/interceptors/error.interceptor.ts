import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, timer } from 'rxjs';
import { catchError, retry, switchMap } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

const MAX_RATE_LIMIT_RETRIES = 3;

function retryWithBackoff(req: HttpRequest<unknown>, next: HttpHandlerFn, delaySec: number) {
    const delayMs = delaySec * 1000;
    return timer(delayMs).pipe(
        switchMap(() => next(req))
    );
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);
    let rateLimitRetries = 0;

    return next(req).pipe(
        // Only retry on network errors (status 0) or 5xx server errors — never on 4xx
        retry({
            count: 1,
            delay: (error) => {
                if (error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)) {
                    return timer(0);
                }
                throw error;
            }
        }),
        catchError((error: HttpErrorResponse) => {
            // Handle 429 rate limiting with retry-after backoff
            if (error.status === 429 && rateLimitRetries < MAX_RATE_LIMIT_RETRIES) {
                rateLimitRetries++;
                const retryAfter = parseInt(error.headers.get('X-RateLimit-Retry-After') || '1', 10);
                return retryWithBackoff(req, next, retryAfter);
            }

            let errorMessage = 'An unknown error occurred!';

            if (error.error instanceof ErrorEvent) {
                // Client-side or network error
                errorMessage = `Error: ${error.error.message}`;
            } else {
                // Backend returned an unsuccessful response code
                errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;

                if (error.status === 401) {
                    // JWT interceptor already handles refresh + logout on failure
                    // Just show the toast here
                    toastService.error('Session expired. Please login again.');
                } else if (error.status === 403) {
                    toastService.error('You do not have permission to perform this action.');
                } else if (error.status === 404) {
                    toastService.error('Resource not found.');
                } else if (error.status === 429) {
                    toastService.error('Too many requests. Please wait a moment and try again.');
                } else if (error.status >= 500) {
                    toastService.error('Server error. Please try again later.');
                } else {
                    toastService.error(errorMessage);
                }
            }

            return throwError(() => new Error(errorMessage));
        })
    );
};

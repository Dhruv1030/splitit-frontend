import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
};

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
        async login(credentials: { email: string; password: string }) {
            patchState(store, { loading: true, error: null });
            try {
                const response = await firstValueFrom(authService.login(credentials));
                // Note: AuthService.login already handles localStorage via tap()
                // We sync the store state with what AuthService managed
                patchState(store, {
                    user: authService.getCurrentUserValue(),
                    token: localStorage.getItem('jwt_token'),
                    loading: false
                });
                router.navigate(['/dashboard']);
            } catch (err: any) {
                patchState(store, {
                    error: err.error?.message || 'Login failed',
                    loading: false
                });
            }
        },

        async register(data: any) {
            patchState(store, { loading: true, error: null });
            try {
                await firstValueFrom(authService.register(data));
                patchState(store, {
                    user: authService.getCurrentUserValue(),
                    token: localStorage.getItem('jwt_token'),
                    loading: false
                });
                router.navigate(['/dashboard']);
            } catch (err: any) {
                patchState(store, {
                    error: err.error?.message || 'Registration failed',
                    loading: false
                });
            }
        },

        logout() {
            authService.logout();
            patchState(store, initialState);
        },

        clearError() {
            patchState(store, { error: null });
        }
    })),
    withHooks({
        onInit(store, authService = inject(AuthService)) {
            const user = authService.getCurrentUserValue();
            const token = localStorage.getItem('jwt_token');
            if (user && token) {
                patchState(store, { user, token });
            }
        }
    })
);

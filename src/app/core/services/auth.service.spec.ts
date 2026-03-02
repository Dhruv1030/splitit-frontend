import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AuthService,
                { provide: Router, useValue: spy }
            ]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

        // Clear localStorage before each test
        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('should authenticate user and save data to localStorage', () => {
            const mockResponse: AuthResponse = {
                token: 'mock-jwt-token',
                user: {
                    id: '1',
                    email: 'test@example.com',
                    name: 'Test User'
                } as any
            };

            service.login({ email: 'test@example.com', password: 'password' }).subscribe(response => {
                expect(response).toEqual(mockResponse);
                expect(localStorage.getItem('jwt_token')).toBe('mock-jwt-token');
                expect(localStorage.getItem('current_user')).toContain('Test User');
                expect(service.getCurrentUserValue()?.name).toBe('Test User');
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/users/login`);
            expect(req.request.method).toBe('POST');
            req.flush(mockResponse);
        });
    });

    describe('logout', () => {
        it('should clear localStorage and navigate to login', () => {
            localStorage.setItem('jwt_token', 'token');
            localStorage.setItem('current_user', JSON.stringify({ name: 'User' }));

            service.logout();

            expect(localStorage.getItem('jwt_token')).toBeNull();
            expect(localStorage.getItem('current_user')).toBeNull();
            expect(service.getCurrentUserValue()).toBeNull();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        });
    });

    describe('isAuthenticated', () => {
        it('should return false when no token exists', () => {
            expect(service.isAuthenticated()).toBeFalse();
        });

        it('should return false when token is invalid', () => {
            localStorage.setItem('jwt_token', 'invalid-token');
            expect(service.isAuthenticated()).toBeFalse();
        });

        // Note: Valid JWT testing would require a properly formatted mock token with exp claim
    });
});

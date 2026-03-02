import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExpenseService } from './expense.service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Expense } from '../models/expense.model';

describe('ExpenseService', () => {
    let service: ExpenseService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ExpenseService]
        });

        service = TestBed.inject(ExpenseService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getGroupExpenses', () => {
        it('should fetch expenses for a group', () => {
            const mockExpenses: ApiResponse<Expense[]> = {
                data: [
                    { id: 1, amount: 50, description: 'Dinner' } as any,
                    { id: 2, amount: 30, description: 'Drinks' } as any
                ],
                success: true,
                message: 'Success'
            };

            service.getGroupExpenses(123).subscribe(response => {
                expect(response.data.length).toBe(2);
                expect(response.data).toEqual(mockExpenses.data);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/expenses/group/123`);
            expect(req.request.method).toBe('GET');
            req.flush(mockExpenses);
        });
    });

    describe('createExpense', () => {
        it('should post a new expense', () => {
            const mockExpense: ApiResponse<Expense> = {
                data: { id: 1, amount: 100, description: 'New Expense' } as any,
                success: true,
                message: 'Created'
            };
            const createRequest = { amount: 100, description: 'New Expense' } as any;

            service.createExpense(123, createRequest).subscribe(response => {
                expect(response.data).toEqual(mockExpense.data);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/expenses`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body.groupId).toBe(123);
            req.flush(mockExpense);
        });
    });

    describe('getUserExpenses', () => {
        it('should fetch user specific expenses', () => {
            const mockExpenses: ApiResponse<Expense[]> = {
                data: [{ id: 1, amount: 20 } as any],
                success: true,
                message: 'Success'
            };

            service.getUserExpenses().subscribe(response => {
                expect(response.data.length).toBe(1);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/expenses/my-expenses`);
            expect(req.request.method).toBe('GET');
            req.flush(mockExpenses);
        });
    });
});

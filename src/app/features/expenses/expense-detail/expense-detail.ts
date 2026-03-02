import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenseService } from '../../../core/services/expense.service';
import { GroupService } from '../../../core/services/group.service';
import { Expense, ExpenseCategory, SplitType } from '../../../core/models/expense.model';
import { ExpenseFormDialogComponent } from '../expense-form-dialog/expense-form-dialog';

interface GroupMember {
  userId: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

interface GroupDetail {
  id: number;
  name: string;
  description?: string;
  category: string;
  currency: string;
  createdBy: string;
  members: GroupMember[];
  totalExpenses: number;
  createdAt: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatMenuModule,
  ],
  templateUrl: './expense-detail.html',
  styleUrls: ['./expense-detail.scss'],
})
export class ExpenseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private expenseService = inject(ExpenseService);
  private groupService = inject(GroupService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  expense: Expense | null = null;
  group: GroupDetail | null = null;
  loading = true;
  currentUserId = localStorage.getItem('userId') || '';

  // Expose enums to template
  ExpenseCategory = ExpenseCategory;
  SplitType = SplitType;

  ngOnInit(): void {
    const expenseId = this.route.snapshot.paramMap.get('id');
    if (expenseId) {
      this.loadExpenseDetail(+expenseId);
    }
  }

  loadExpenseDetail(expenseId: number): void {
    this.loading = true;

    this.expenseService.getExpense(expenseId).subscribe({
      next: (response) => {
        this.expense = response.data;
        this.loading = false;

        // Load group details if we have groupId
        if (this.expense?.groupId) {
          this.loadGroupDetails(this.expense.groupId);
        }
      },
      error: (error) => {
        console.error('Error loading expense:', error);
        this.loading = false;
        this.snackBar.open('Failed to load expense details', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/expenses']);
      },
    });
  }

  loadGroupDetails(groupId: number): void {
    this.groupService.getGroup(groupId).subscribe({
      next: (response) => {
        this.group = response.data as any;
      },
      error: (error) => {
        console.error('Error loading group:', error);
      },
    });
  }

  getCategoryIcon(category: ExpenseCategory): string {
    const icons: { [key in ExpenseCategory]: string } = {
      FOOD: 'restaurant',
      TRANSPORT: 'directions_car',
      ACCOMMODATION: 'hotel',
      ENTERTAINMENT: 'movie',
      UTILITIES: 'electrical_services',
      SHOPPING: 'shopping_cart',
      OTHER: 'category',
    };
    return icons[category] || 'category';
  }

  getSplitTypeLabel(splitType: SplitType): string {
    const labels: { [key in SplitType]: string } = {
      EQUAL: 'Split Equally',
      EXACT: 'Exact Amounts',
      PERCENTAGE: 'By Percentage',
    };
    return labels[splitType] || splitType;
  }

  canEditOrDelete(): boolean {
    // Allow the person who recorded the expense (createdBy) OR who paid it (paidBy)
    return this.expense?.createdBy === this.currentUserId ||
           this.expense?.paidBy === this.currentUserId;
  }

  onEdit(): void {
    if (!this.expense || !this.group) return;

    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        expense: this.expense,
        group: this.group,
        mode: 'edit',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadExpenseDetail(this.expense!.id);
        this.snackBar.open('Expense updated successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  onDelete(): void {
    if (!this.expense) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${this.expense.description}"?`
    );

    if (confirmed) {
      this.expenseService.deleteExpense(this.expense.id).subscribe({
        next: () => {
          this.snackBar.open('Expense deleted successfully!', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/expenses']);
        },
        error: (error) => {
          console.error('Error deleting expense:', error);
          this.snackBar.open('Failed to delete expense', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  onBack(): void {
    // Navigate back to expenses list or group detail
    if (this.expense?.groupId) {
      this.router.navigate(['/groups', this.expense.groupId]);
    } else {
      this.router.navigate(['/expenses']);
    }
  }

  getParticipantName(userId: string): string {
    if (!this.group) return userId;

    const member = this.group.members?.find((m) => m.userId === userId);
    return member?.name || userId;
  }

  getTotalParticipantsAmount(): number {
    if (!this.expense?.participants) return 0;
    return this.expense.participants.reduce((sum, p) => sum + p.amount, 0);
  }
}

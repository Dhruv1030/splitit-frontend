import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GroupService } from '../../core/services/group.service';
import { ExpenseService } from '../../core/services/expense.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Group } from '../../core/models/group.model';
import { Expense } from '../../core/models/expense.model';

interface DashboardStats {
  totalGroups: number;
  totalExpenses: number;
  amountOwed: number;
  amountOwing: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  private groupService = inject(GroupService);
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);

  loading = true;
  userName = '';
  stats: DashboardStats = {
    totalGroups: 0,
    totalExpenses: 0,
    amountOwed: 0,
    amountOwing: 0,
  };
  recentExpenses: Expense[] = [];
  groups: Group[] = [];

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUserValue();
    this.userName = currentUser?.name || 'User';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load groups
    this.groupService.getUserGroups().subscribe({
      next: (response) => {
        this.groups = response.data;
        this.stats.totalGroups = this.groups.length;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.checkLoadingComplete();
      },
    });

    // Load expenses using the working /my-expenses endpoint
    this.expenseService.getUserExpenses().subscribe({
      next: (response) => {
        const expenses = response.data;
        this.stats.totalExpenses = expenses.length;
        // Get last 5 expenses
        this.recentExpenses = expenses.slice(0, 5);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.checkLoadingComplete();
      },
    });

    // Load balance
    this.expenseService.getOverallBalance().subscribe({
      next: (response) => {
        const balance = response.data;
        this.stats.amountOwed = balance.totalOwed || 0;
        this.stats.amountOwing = balance.totalOwing || 0;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading balance:', error);
        // Set default values on error (e.g., network issues)
        this.stats.amountOwed = 0;
        this.stats.amountOwing = 0;
        this.checkLoadingComplete();
      },
    });
  }

  private loadCounter = 0;
  private checkLoadingComplete(): void {
    this.loadCounter++;
    if (this.loadCounter >= 3) {
      this.loading = false;
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      FOOD: 'restaurant',
      TRANSPORT: 'directions_car',
      ACCOMMODATION: 'hotel',
      ENTERTAINMENT: 'movie',
      UTILITIES: 'lightbulb',
      SHOPPING: 'shopping_cart',
      OTHER: 'more_horiz',
    };
    return icons[category] || 'receipt';
  }

  onAddExpense(): void {
    // Check if user has at least one group
    if (this.groups.length === 0) {
      this.toastService.info('Please create a group first before adding expenses.');
      return;
    }

    import('../expenses/expense-form-dialog/expense-form-dialog').then((m) => {
      const dialogRef = this.dialog.open(m.ExpenseFormDialogComponent, {
        width: '90vw',
        maxWidth: '700px',
        disableClose: false,
        panelClass: 'expense-form-dialog-container',
        data: {
          groups: this.groups, // Pass available groups
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // Reload dashboard data after expense creation
          this.loadDashboardData();
        }
      });
    });
  }

  onCreateGroup(): void {
    import('../groups/group-form-dialog/group-form-dialog').then((m) => {
      const dialogRef = this.dialog.open(m.GroupFormDialogComponent, {
        width: '600px',
        disableClose: false,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // Reload dashboard data after group creation
          this.loadDashboardData();
        }
      });
    });
  }
}

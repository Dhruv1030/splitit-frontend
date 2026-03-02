import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GroupService } from '../../core/services/group.service';
import { ExpenseService } from '../../core/services/expense.service';
import { AuthStore } from '../../core/store/auth.store';
import { ToastService } from '../../core/services/toast.service';
import { Group } from '../../core/models/group.model';
import { Expense } from '../../core/models/expense.model';
import { ExpenseChartComponent } from './expense-chart/expense-chart.component';
import { ExpenseDonutComponent } from './expense-donut/expense-donut.component';
import { ActivityFeedComponent } from '../activities/activity-feed/activity-feed';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

interface DashboardStats {
  totalGroups: number;
  totalExpenses: number;
  amountOwed: number;
  amountOwing: number;
  netBalance: number;
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
    ActivityFeedComponent,
    ExpenseChartComponent,
    ExpenseDonutComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    CurrencyPipe,
    DatePipe,
    NgClass,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private groupService = inject(GroupService);
  private expenseService = inject(ExpenseService);
  protected readonly authStore = inject(AuthStore);
  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  // Expose Math to template
  Math = Math;

  loading = true;
  stats: DashboardStats = {
    totalGroups: 0,
    totalExpenses: 0,
    amountOwed: 0,
    amountOwing: 0,
    netBalance: 0,
  };
  recentExpenses: Expense[] = [];
  expenses: Expense[] = [];
  groups: Group[] = [];
  private loadCounter = 0;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.loadCounter = 0;
    this.cdr.markForCheck();

    // Load groups
    this.groupService.getUserGroups()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.groups = response?.data || [];
          this.stats = { ...this.stats, totalGroups: this.groups.length };
          this.checkLoadingComplete();
        },
        error: () => {
          this.groups = [];
          this.checkLoadingComplete();
        },
      });

    // Load expenses
    this.expenseService.getUserExpenses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.expenses = response?.data || [];
          this.recentExpenses = this.expenses.slice(0, 5);
          this.stats = { ...this.stats, totalExpenses: this.expenses.length };
          this.checkLoadingComplete();
        },
        error: () => {
          this.expenses = [];
          this.checkLoadingComplete();
        },
      });

    // Load balance
    this.expenseService.getOverallBalance()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const balance = response?.data || { totalOwed: 0, totalOwing: 0, netBalance: 0 };
          this.stats = {
            ...this.stats,
            amountOwed: balance.totalOwed || 0,
            amountOwing: balance.totalOwing || 0,
            netBalance: (balance.totalOwing || 0) - (balance.totalOwed || 0),
          };
          this.checkLoadingComplete();
        },
        error: () => {
          this.stats = { ...this.stats, amountOwed: 0, amountOwing: 0, netBalance: 0 };
          this.checkLoadingComplete();
        },
      });
  }

  private checkLoadingComplete(): void {
    this.loadCounter++;
    if (this.loadCounter >= 3) {
      this.loading = false;
      this.cdr.markForCheck();
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
        data: { groups: this.groups },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
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
          this.loadDashboardData();
        }
      });
    });
  }
}

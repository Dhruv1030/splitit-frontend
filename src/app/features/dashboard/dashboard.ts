import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GroupService } from '../../core/services/group.service';
import { ExpenseService } from '../../core/services/expense.service';
import { UserService } from '../../core/services/user.service';
import { AuthStore } from '../../core/store/auth.store';
import { ToastService } from '../../core/services/toast.service';
import { Group } from '../../core/models/group.model';
import { Expense } from '../../core/models/expense.model';
import { User, FriendRequest } from '../../core/models/user.model';
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
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
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
  private userService = inject(UserService);
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

  // Friends widget
  friends: User[] = [];
  friendSearchResults: User[] = [];
  friendSearchQuery = '';
  searchingFriends = false;
  pendingFriendRequests: FriendRequest[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.loadCounter = 0;
    this.cdr.markForCheck();

    // Load friends & pending requests
    this.loadFriends();
    this.loadPendingRequests();

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

  // --- Friends Widget ---

  loadFriends(): void {
    const userId = this.authStore.user()?.id;
    if (!userId) return;

    this.userService.getUserFriends(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (friends) => {
          this.friends = friends || [];
          this.cdr.markForCheck();
        },
        error: () => {
          this.friends = [];
          this.cdr.markForCheck();
        },
      });
  }

  searchFriends(): void {
    const query = this.friendSearchQuery.trim();
    if (query.length < 2) {
      this.friendSearchResults = [];
      return;
    }

    this.searchingFriends = true;
    this.cdr.markForCheck();

    const userId = this.authStore.user()?.id;
    const friendIds = this.friends.map(f => f.id);

    this.userService.searchUsers(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.friendSearchResults = users.filter(
            u => u.id !== userId && !friendIds.includes(u.id)
          );
          this.searchingFriends = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.friendSearchResults = [];
          this.searchingFriends = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadPendingRequests(): void {
    this.userService.getPendingFriendRequests()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (requests) => {
          this.pendingFriendRequests = requests || [];
          this.cdr.markForCheck();
        },
        error: () => {
          this.pendingFriendRequests = [];
          this.cdr.markForCheck();
        },
      });
  }

  sendFriendRequest(user: User): void {
    this.userService.sendFriendRequest({ receiverId: user.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success(`Friend request sent to ${user.name}!`);
          this.friendSearchResults = this.friendSearchResults.filter(u => u.id !== user.id);
          this.friendSearchQuery = '';
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to send friend request.';
          this.toastService.error(message);
        },
      });
  }

  acceptFriendRequest(requestId: string): void {
    this.userService.acceptFriendRequest(requestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Friend request accepted!');
          this.loadFriends();
          this.loadPendingRequests();
        },
        error: () => {
          this.toastService.error('Failed to accept request.');
        },
      });
  }

  declineFriendRequest(requestId: string): void {
    this.userService.declineFriendRequest(requestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Friend request declined.');
          this.loadPendingRequests();
        },
        error: () => {
          this.toastService.error('Failed to decline request.');
        },
      });
  }

  removeFriend(friendId: string): void {
    const userId = this.authStore.user()?.id;
    if (!userId) return;

    this.userService.removeFriend(userId, friendId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Friend removed.');
          this.loadFriends();
        },
        error: () => {
          this.toastService.error('Failed to remove friend.');
        },
      });
  }
}

import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '../../../core/services/user.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { SettlementService } from '../../../core/services/settlement.service';
import { AuthStore } from '../../../core/store/auth.store';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';
import { Expense } from '../../../core/models/expense.model';
import { Settlement } from '../../../core/models/settlement.model';
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-friend-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './friend-detail.html',
  styleUrls: ['./friend-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FriendDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private expenseService = inject(ExpenseService);
  private settlementService = inject(SettlementService);
  protected readonly authStore = inject(AuthStore);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  friend: User | null = null;
  sharedExpenses: Expense[] = [];
  settlements: Settlement[] = [];
  netBalance = 0;

  ngOnInit(): void {
    const friendId = this.route.snapshot.paramMap.get('id');
    if (friendId) {
      this.loadFriendData(friendId);
    }
  }

  private loadFriendData(friendId: string): void {
    this.loading = true;
    this.cdr.markForCheck();

    forkJoin({
      friend: this.userService.getUserById(friendId),
      expenses: this.expenseService.getUserExpenses(),
      settlements: this.settlementService.getUserSettlements(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ friend, expenses, settlements }) => {
          this.friend = friend;
          const allExpenses = expenses?.data || [];
          const allSettlements = settlements?.data || [];

          // Filter shared expenses
          this.sharedExpenses = allExpenses.filter(
            (e) =>
              e.participants?.some((p) => p.userId === friendId) ||
              e.paidBy === friendId
          );

          // Filter settlements between current user and friend
          const userId = this.authStore.user()?.id;
          this.settlements = allSettlements.filter(
            (s) =>
              (s.payerId === userId && s.payeeId === friendId) ||
              (s.payerId === friendId && s.payeeId === userId)
          );

          // Calculate net balance
          this.calculateNetBalance(friendId, userId!);

          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private calculateNetBalance(friendId: string, userId: string): void {
    let balance = 0;

    // From settlements
    for (const s of this.settlements) {
      if (s.payerId === userId && s.payeeId === friendId) {
        balance -= s.amount;
      } else if (s.payerId === friendId && s.payeeId === userId) {
        balance += s.amount;
      }
    }

    // From shared expenses
    for (const e of this.sharedExpenses) {
      if (e.paidBy === userId) {
        const friendShare = e.participants?.find((p) => p.userId === friendId);
        if (friendShare) {
          balance += friendShare.amount;
        }
      } else if (e.paidBy === friendId) {
        const myShare = e.participants?.find((p) => p.userId === userId);
        if (myShare) {
          balance -= myShare.amount;
        }
      }
    }

    this.netBalance = balance;
  }

  removeFriend(): void {
    const userId = this.authStore.user()?.id;
    if (!userId || !this.friend) return;

    this.userService
      .removeFriend(userId, this.friend.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Friend removed.');
        },
        error: () => {
          this.toastService.error('Failed to remove friend.');
        },
      });
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

  getSettlementStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }
}

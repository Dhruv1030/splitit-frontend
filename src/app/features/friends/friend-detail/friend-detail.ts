import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { SettlementService } from '../../../core/services/settlement.service';
import { AuthStore } from '../../../core/store/auth.store';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';
import { Expense } from '../../../core/models/expense.model';
import { Settlement, FriendSettlementSuggestion } from '../../../core/models/settlement.model';
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ExpenseFormDialogComponent } from '../../expenses/expense-form-dialog/expense-form-dialog';
import { RecordPaymentDialogComponent } from '../../settlements/record-payment-dialog/record-payment-dialog';
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
    MatDialogModule,
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
  private dialog = inject(MatDialog);

  loading = true;
  friend: User | null = null;
  friendId = '';
  sharedExpenses: Expense[] = [];
  settlements: Settlement[] = [];
  netBalance = 0;
  settlementSuggestion: FriendSettlementSuggestion | null = null;

  ngOnInit(): void {
    this.friendId = this.route.snapshot.paramMap.get('id') || '';
    if (this.friendId) {
      this.loadFriendData(this.friendId);
    }
  }

  private loadFriendData(friendId: string): void {
    this.loading = true;
    this.cdr.markForCheck();

    forkJoin({
      friend: this.userService.getUserById(friendId),
      expenses: this.expenseService.getFriendExpenses(friendId),
      netBalance: this.expenseService.getFriendNetBalance(friendId),
      settlements: this.settlementService.getFriendSettlements(friendId),
      suggestion: this.settlementService.getFriendSettlementSuggestion(friendId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ friend, expenses, netBalance, settlements, suggestion }) => {
          this.friend = friend;
          this.sharedExpenses = expenses?.data || [];
          this.settlements = settlements || [];
          this.netBalance = netBalance || 0;
          this.settlementSuggestion = suggestion;

          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  addExpense(): void {
    if (!this.friend) return;

    const userId = this.authStore.user()?.id;
    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, {
      width: '500px',
      data: {
        friendMode: true,
        friendId: this.friendId,
        friendName: this.friend.name,
        members: [
          { userId: userId, name: 'You', role: 'MEMBER' },
          { userId: this.friendId, name: this.friend.name, role: 'MEMBER' },
        ],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadFriendData(this.friendId);
      }
    });
  }

  settleUp(): void {
    if (!this.settlementSuggestion || !this.friend) return;

    const dialogRef = this.dialog.open(RecordPaymentDialogComponent, {
      width: '450px',
      data: {
        groupId: null,
        suggestion: this.settlementSuggestion,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadFriendData(this.friendId);
      }
    });
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

import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { UserService } from '../../../core/services/user.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { SettlementService } from '../../../core/services/settlement.service';
import { AuthStore } from '../../../core/store/auth.store';
import { ToastService } from '../../../core/services/toast.service';
import { User, FriendRequest } from '../../../core/models/user.model';
import { Expense } from '../../../core/models/expense.model';
import { Settlement } from '../../../core/models/settlement.model';
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader';
import { forkJoin } from 'rxjs';

interface FriendSummary {
  user: User;
  sharedExpenseCount: number;
  netBalance: number;
}

@Component({
  selector: 'app-friends-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    SkeletonLoaderComponent,
    CurrencyPipe,
  ],
  templateUrl: './friends-list.html',
  styleUrls: ['./friends-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FriendsListComponent implements OnInit {
  private userService = inject(UserService);
  private expenseService = inject(ExpenseService);
  private settlementService = inject(SettlementService);
  protected readonly authStore = inject(AuthStore);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  friends: FriendSummary[] = [];
  filteredFriends: FriendSummary[] = [];
  filterQuery = '';

  // Add friend search
  searchQuery = '';
  searchResults: User[] = [];
  searching = false;

  // Friend requests
  pendingRequests: FriendRequest[] = [];
  sentRequests: FriendRequest[] = [];

  private expenses: Expense[] = [];
  private settlements: Settlement[] = [];

  ngOnInit(): void {
    this.loadData();
    this.loadFriendRequests();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const userId = this.authStore.user()?.id;
    if (!userId) return;

    forkJoin({
      friends: this.userService.getUserFriends(userId),
      expenses: this.expenseService.getUserExpenses(),
      settlements: this.settlementService.getUserSettlements(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ friends, expenses, settlements }) => {
          this.expenses = expenses?.data || [];
          this.settlements = settlements?.data || [];
          this.friends = (friends || []).map((f) => this.buildFriendSummary(f, userId));
          this.filteredFriends = [...this.friends];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.friends = [];
          this.filteredFriends = [];
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadFriendRequests(): void {
    this.userService.getPendingFriendRequests()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (requests) => {
          this.pendingRequests = requests || [];
          this.cdr.markForCheck();
        },
        error: () => {
          this.pendingRequests = [];
          this.cdr.markForCheck();
        },
      });

    this.userService.getSentFriendRequests()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (requests) => {
          this.sentRequests = requests || [];
          this.cdr.markForCheck();
        },
        error: () => {
          this.sentRequests = [];
          this.cdr.markForCheck();
        },
      });
  }

  private buildFriendSummary(friend: User, userId: string): FriendSummary {
    const sharedExpenses = this.expenses.filter(
      (e) =>
        e.participants?.some((p) => p.userId === friend.id) ||
        e.paidBy === friend.id
    );

    let netBalance = 0;
    for (const s of this.settlements) {
      if (s.payerId === userId && s.payeeId === friend.id) {
        netBalance -= s.amount;
      } else if (s.payerId === friend.id && s.payeeId === userId) {
        netBalance += s.amount;
      }
    }

    for (const e of sharedExpenses) {
      if (e.paidBy === userId) {
        const friendShare = e.participants?.find((p) => p.userId === friend.id);
        if (friendShare) {
          netBalance += friendShare.amount;
        }
      } else if (e.paidBy === friend.id) {
        const myShare = e.participants?.find((p) => p.userId === userId);
        if (myShare) {
          netBalance -= myShare.amount;
        }
      }
    }

    return {
      user: friend,
      sharedExpenseCount: sharedExpenses.length,
      netBalance,
    };
  }

  onFilter(): void {
    const query = this.filterQuery.toLowerCase().trim();
    if (!query) {
      this.filteredFriends = [...this.friends];
      return;
    }
    this.filteredFriends = this.friends.filter(
      (f) =>
        f.user.name.toLowerCase().includes(query) ||
        f.user.email.toLowerCase().includes(query)
    );
  }

  searchUsers(): void {
    const query = this.searchQuery.trim();
    if (query.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searching = true;
    this.cdr.markForCheck();

    const userId = this.authStore.user()?.id;
    const friendIds = this.friends.map((f) => f.user.id);
    const sentRequestIds = this.sentRequests.map((r) => r.receiverId);

    this.userService
      .searchUsers(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.searchResults = users.filter(
            (u) => u.id !== userId && !friendIds.includes(u.id) && !sentRequestIds.includes(u.id)
          );
          this.searching = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.searchResults = [];
          this.searching = false;
          this.cdr.markForCheck();
        },
      });
  }

  sendFriendRequest(user: User): void {
    this.userService
      .sendFriendRequest({ receiverId: user.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success(`Friend request sent to ${user.name}!`);
          this.searchResults = this.searchResults.filter((u) => u.id !== user.id);
          this.searchQuery = '';
          this.loadFriendRequests();
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to send friend request.';
          this.toastService.error(message);
        },
      });
  }

  acceptRequest(requestId: string): void {
    this.userService
      .acceptFriendRequest(requestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Friend request accepted!');
          this.loadData();
          this.loadFriendRequests();
        },
        error: () => {
          this.toastService.error('Failed to accept request.');
        },
      });
  }

  declineRequest(requestId: string): void {
    this.userService
      .declineFriendRequest(requestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Friend request declined.');
          this.loadFriendRequests();
        },
        error: () => {
          this.toastService.error('Failed to decline request.');
        },
      });
  }

  removeFriend(friendId: string, event: Event): void {
    event.stopPropagation();
    const userId = this.authStore.user()?.id;
    if (!userId) return;

    this.userService
      .removeFriend(userId, friendId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Friend removed.');
          this.loadData();
        },
        error: () => {
          this.toastService.error('Failed to remove friend.');
        },
      });
  }
}

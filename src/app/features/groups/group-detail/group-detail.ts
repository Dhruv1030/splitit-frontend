import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GroupService } from '../../../core/services/group.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { SettlementService } from '../../../core/services/settlement.service';
import { ToastService } from '../../../core/services/toast.service';
import { Group } from '../../../core/models/group.model';
import { Expense } from '../../../core/models/expense.model';
import { Settlement } from '../../../core/models/settlement.model';
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader';
import { ActivityFeedComponent } from '../../activities/activity-feed/activity-feed';

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
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    SkeletonLoaderComponent,
    ActivityFeedComponent,
  ],
  templateUrl: './group-detail.html',
  styleUrls: ['./group-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private groupService = inject(GroupService);
  private expenseService = inject(ExpenseService);
  private settlementService = inject(SettlementService);
  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  groupId!: number;
  group: GroupDetail | null = null;
  expenses: Expense[] = [];
  settlements: Settlement[] = [];
  settlementSuggestions: any[] = [];
  groupBalances: { [userId: string]: number } = {};
  loading = true;
  activeTab = 0;

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const groupId = +params['id'];
        if (groupId) {
          this.groupId = groupId;
          this.loadGroupDetails(groupId);
        }
      });
  }

  loadGroupDetails(groupId: number): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.groupService.getGroup(groupId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.group = response.data as any;
          this.loadExpenses(groupId);
          this.loadGroupBalances(groupId);
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error loading group:', error);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadExpenses(groupId: number): void {
    this.expenseService.getGroupExpenses(groupId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.expenses = response.data || [];
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error loading expenses:', error);
          this.expenses = [];
          this.cdr.markForCheck();
        },
      });
  }

  loadGroupBalances(groupId: number): void {
    this.expenseService.getGroupBalances(groupId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (balances: { [userId: string]: number }) => {
          this.groupBalances = balances;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error loading balances:', error);
          this.cdr.markForCheck();
        },
      });
  }

  loadSettlements(groupId: number): void {
    this.settlementService.getGroupSettlements(groupId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.settlements = response.data || [];
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error loading settlements:', error);
          this.settlements = [];
          this.cdr.markForCheck();
        },
      });
  }

  loadSettlementSuggestions(groupId: number): void {
    this.settlementService.getSettlementSuggestions(groupId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if ((response as any).suggestions) {
            this.settlementSuggestions = (response as any).suggestions;
          } else if (response.data && (response.data as any).suggestions) {
            this.settlementSuggestions = (response.data as any).suggestions;
          } else if (Array.isArray(response)) {
            this.settlementSuggestions = response;
          } else if (Array.isArray(response.data)) {
            this.settlementSuggestions = response.data;
          } else {
            this.settlementSuggestions = [];
          }
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error loading settlement suggestions:', error);
          this.settlementSuggestions = [];
          this.cdr.markForCheck();
        },
      });
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    if (index === 3 && this.group) {
      this.loadSettlements(this.group.id);
      this.loadSettlementSuggestions(this.group.id);
    }
    this.cdr.markForCheck();
  }

  onAddExpense(): void {
    if (!this.group) return;

    import('../../expenses/expense-form-dialog/expense-form-dialog').then((m) => {
      const dialogRef = this.dialog.open(m.ExpenseFormDialogComponent, {
        width: '90vw',
        maxWidth: '700px',
        maxHeight: '90vh',
        panelClass: 'expense-form-dialog-container',
        data: {
          groupId: this.group!.id,
          members: this.group!.members,
        },
      });

      dialogRef.afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          if (result && this.group) {
            this.loadExpenses(this.group.id);
            this.loadGroupBalances(this.group.id);
            this.loadGroupDetails(this.group.id);
          }
        });
    });
  }

  onEditGroup(): void {
    if (!this.group) return;

    import('../group-form-dialog/group-form-dialog').then((m) => {
      const dialogRef = this.dialog.open(m.GroupFormDialogComponent, {
        width: '600px',
        data: { group: this.group },
      });

      dialogRef.afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          if (result && this.group) {
            this.loadGroupDetails(this.group.id);
          }
        });
    });
  }

  onDeleteGroup(): void {
    if (!this.group) return;

    if (confirm(`Are you sure you want to delete "${this.group.name}"? This action cannot be undone.`)) {
      this.groupService.deleteGroup(this.group.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toastService.success('Group deleted successfully');
            this.router.navigate(['/groups']);
          },
          error: (error) => {
            console.error('Error deleting group:', error);
            this.toastService.error('Failed to delete group. Please try again.');
          },
        });
    }
  }

  onAddMember(): void {
    if (!this.group) return;

    import('../add-member-dialog/add-member-dialog').then((m) => {
      const dialogRef = this.dialog.open(m.AddMemberDialogComponent, {
        width: '600px',
        disableClose: false,
      });

      dialogRef.afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((selectedUser) => {
          if (selectedUser && this.group) {
            const isAlreadyMember = this.group.members.some(
              (member) => member.userId === selectedUser.id
            );

            if (isAlreadyMember) {
              this.toastService.warning('This user is already a member of the group');
              return;
            }

            this.addMemberToGroup(selectedUser.id);
          }
        });
    });
  }

  addMemberToGroup(userId: string): void {
    if (!this.group) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.groupService.addMember(this.group.id, userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          this.loadGroupDetails(this.group!.id);
          this.toastService.success('Member added successfully!');
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error adding member:', error);
          this.loading = false;
          const errorMessage = error.error?.message || 'Failed to add member';
          this.toastService.error(errorMessage);
          this.cdr.markForCheck();
        },
      });
  }

  onRemoveMember(memberId: string): void {
    if (!this.group) return;

    if (confirm('Are you sure you want to remove this member?')) {
      const memberIdNum = parseInt(memberId, 10);
      if (isNaN(memberIdNum)) {
        console.error('Invalid member ID');
        return;
      }

      this.groupService.removeMember(this.group.id, memberIdNum)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            if (this.group) {
              this.loadGroupDetails(this.group.id);
              this.toastService.success('Member removed successfully');
            }
          },
          error: (error: any) => {
            console.error('Error removing member:', error);
            this.toastService.error('Failed to remove member. Please try again.');
          },
        });
    }
  }

  onSettleUp(): void {
    if (!this.group) return;

    import('../../settlements/settlement-dialog/settlement-dialog').then((m) => {
      const dialogRef = this.dialog.open(m.SettlementDialogComponent, {
        width: '700px',
        maxHeight: '90vh',
        data: {
          groupId: this.group!.id,
          groupName: this.group!.name,
          currency: this.group!.currency,
        },
      });

      dialogRef.afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          if (result && this.group) {
            this.loadGroupDetails(this.group.id);
            this.loadGroupBalances(this.group.id);
            this.loadSettlements(this.group.id);
          }
        });
    });
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      TRIP: 'flight',
      HOME: 'home',
      COUPLE: 'favorite',
      OTHER: 'groups',
    };
    return icons[category] || 'group';
  }

  getMemberBalance(userId: string): number {
    return this.groupBalances[userId] || 0;
  }

  getBalanceColor(balance: number): string {
    if (balance > 0) return 'success';
    if (balance < 0) return 'warn';
    return 'primary';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.group?.currency || 'USD',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
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
import { Group } from '../../../core/models/group.model';
import { Expense } from '../../../core/models/expense.model';
import { Settlement } from '../../../core/models/settlement.model';

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
  ],
  templateUrl: './group-detail.html',
  styleUrls: ['./group-detail.scss'],
})
export class GroupDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private groupService = inject(GroupService);
  private expenseService = inject(ExpenseService);
  private settlementService = inject(SettlementService);
  private dialog = inject(MatDialog);

  group: GroupDetail | null = null;
  expenses: Expense[] = [];
  settlements: Settlement[] = [];
  groupBalances: { [userId: string]: number } = {};
  loading = true;
  activeTab = 0;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const groupId = +params['id'];
      if (groupId) {
        this.loadGroupDetails(groupId);
      }
    });
  }

  loadGroupDetails(groupId: number): void {
    this.loading = true;
    this.groupService.getGroup(groupId).subscribe({
      next: (response) => {
        this.group = response.data as any;
        this.loadExpenses(groupId);
        this.loadGroupBalances(groupId);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading group:', error);
        this.loading = false;
      },
    });
  }

  loadExpenses(groupId: number): void {
    this.expenseService.getGroupExpenses(groupId).subscribe({
      next: (response) => {
        this.expenses = response.data || [];
      },
      error: (error: any) => {
        console.error('Error loading expenses:', error);
        this.expenses = [];
      },
    });
  }

  loadGroupBalances(groupId: number): void {
    this.expenseService.getGroupBalances(groupId).subscribe({
      next: (balances: { [userId: string]: number }) => {
        this.groupBalances = balances;
      },
      error: (error: any) => {
        console.error('Error loading balances:', error);
      },
    });
  }

  loadSettlements(groupId: number): void {
    if (this.settlements.length === 0) {
      this.settlementService.getGroupSettlements(groupId).subscribe({
        next: (response) => {
          this.settlements = response.data || [];
        },
        error: (error: any) => {
          console.error('Error loading settlements:', error);
          this.settlements = [];
        },
      });
    }
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    if (index === 3 && this.group) {
      // Settlements tab
      this.loadSettlements(this.group.id);
    }
  }

  onAddExpense(): void {
    if (!this.group) return;

    import('../../expenses/expense-form-dialog/expense-form-dialog').then((m) => {
      const dialogRef = this.dialog.open(m.ExpenseFormDialogComponent, {
        width: '700px',
        maxHeight: '90vh',
        data: {
          groupId: this.group!.id,
          members: this.group!.members,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
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

      dialogRef.afterClosed().subscribe((result) => {
        if (result && this.group) {
          this.loadGroupDetails(this.group.id);
        }
      });
    });
  }

  onDeleteGroup(): void {
    if (!this.group) return;
    
    if (confirm(`Are you sure you want to delete "${this.group.name}"? This action cannot be undone.`)) {
      this.groupService.deleteGroup(this.group.id).subscribe({
        next: () => {
          this.router.navigate(['/groups']);
        },
        error: (error) => {
          console.error('Error deleting group:', error);
          alert('Failed to delete group. Please try again.');
        },
      });
    }
  }

  onAddMember(): void {
    // TODO: Open add member dialog
    console.log('Add member clicked');
  }

  onRemoveMember(memberId: string): void {
    if (!this.group) return;
    
    if (confirm('Are you sure you want to remove this member?')) {
      // Note: Backend expects userId as string, but we need to check the actual API
      // For now, treating memberId as string
      const memberIdNum = parseInt(memberId, 10);
      if (isNaN(memberIdNum)) {
        console.error('Invalid member ID');
        return;
      }
      
      this.groupService.removeMember(this.group.id, memberIdNum).subscribe({
        next: () => {
          if (this.group) {
            this.loadGroupDetails(this.group.id);
          }
        },
        error: (error: any) => {
          console.error('Error removing member:', error);
          alert('Failed to remove member. Please try again.');
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

      dialogRef.afterClosed().subscribe((result) => {
        if (result && this.group) {
          // Refresh group data after settlements
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

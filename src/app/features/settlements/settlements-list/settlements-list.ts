import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { SettlementService } from '../../../core/services/settlement.service';
import { GroupService } from '../../../core/services/group.service';
import { Settlement, SettlementStatus } from '../../../core/models/settlement.model';
import { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-settlements-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './settlements-list.html',
  styleUrls: ['./settlements-list.scss'],
})
export class SettlementsListComponent implements OnInit {
  private settlementService = inject(SettlementService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  allSettlements: Settlement[] = [];
  pendingSettlements: Settlement[] = [];
  completedSettlements: Settlement[] = [];
  groups: Group[] = [];
  loading = true;

  // Filters
  selectedGroup: number | 'all' = 'all';

  ngOnInit(): void {
    this.loadGroups();
    this.loadSettlements();
  }

  loadGroups(): void {
    this.groupService.getUserGroups().subscribe({
      next: (response: any) => {
        this.groups = response.data;
      },
      error: (error: any) => {
        console.error('Error loading groups:', error);
      },
    });
  }

  loadSettlements(): void {
    this.loading = true;
    this.groupService.getUserGroups().subscribe({
      next: (response: any) => {
        const groupIds = response.data.map((g: any) => g.id);
        const settlementRequests = groupIds.map((id: any) => 
          this.settlementService.getGroupSettlements(id)
        );

        Promise.all(
          settlementRequests.map((req: any) => 
            req.toPromise().catch(() => ({ data: [] }))
          )
        ).then((results: any[]) => {
          this.allSettlements = results.flatMap(r => r?.data || []);
          this.filterSettlements();
          this.loading = false;
        });
      },
      error: (error: any) => {
        console.error('Error loading settlements:', error);
        this.loading = false;
      },
    });
  }

  filterSettlements(): void {
    let filtered = this.allSettlements;

    if (this.selectedGroup !== 'all') {
      filtered = filtered.filter(s => s.groupId === this.selectedGroup);
    }

    this.pendingSettlements = filtered.filter(s => s.status === SettlementStatus.PENDING);
    this.completedSettlements = filtered.filter(s => s.status === SettlementStatus.COMPLETED);
  }

  onGroupChange(): void {
    this.filterSettlements();
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getGroupName(groupId: number): string {
    const group = this.groups.find(g => g.id === groupId);
    return group?.name || 'Unknown Group';
  }

  getStatusColor(status: SettlementStatus): string {
    switch (status) {
      case SettlementStatus.PENDING:
        return 'warn';
      case SettlementStatus.COMPLETED:
        return 'primary';
      case SettlementStatus.CANCELLED:
        return 'accent';
      default:
        return '';
    }
  }

  onSettlementClick(settlement: Settlement): void {
    this.router.navigate(['/groups', settlement.groupId]);
  }
}


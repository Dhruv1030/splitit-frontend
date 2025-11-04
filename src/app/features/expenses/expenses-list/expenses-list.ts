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
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../core/services/expense.service';
import { GroupService } from '../../../core/services/group.service';
import { ToastService } from '../../../core/services/toast.service';
import { Expense, ExpenseCategory } from '../../../core/models/expense.model';
import { Group } from '../../../core/models/group.model';
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-expenses-list',
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
    SkeletonLoaderComponent,
  ],
  templateUrl: './expenses-list.html',
  styleUrls: ['./expenses-list.scss'],
})
export class ExpensesListComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private groupService = inject(GroupService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  groups: Group[] = [];
  loading = true;

  // Filters
  searchQuery = '';
  selectedGroup: number | 'all' = 'all';
  selectedCategory: ExpenseCategory | 'all' = 'all';

  categories = Object.values(ExpenseCategory);

  ngOnInit(): void {
    this.loadGroups();
    this.loadExpenses();
  }

  loadGroups(): void {
    this.groupService.getUserGroups().subscribe({
      next: (response: any) => {
        this.groups = response.data;
      },
      error: (error: any) => {
        console.error('Error loading groups:', error);
        this.toastService.error('Failed to load groups. Please try again.');
      },
    });
  }

  loadExpenses(): void {
    this.loading = true;
    // Load expenses from all groups
    this.groupService.getUserGroups().subscribe({
      next: (response: any) => {
        const groupIds = response.data.map((g: any) => g.id);
        const expenseRequests = groupIds.map((id: any) => 
          this.expenseService.getGroupExpenses(id)
        );

        // Wait for all expense requests
        Promise.all(
          expenseRequests.map((req: any) => 
            req.toPromise().catch(() => ({ data: [] }))
          )
        ).then((results: any[]) => {
          this.expenses = results.flatMap(r => r?.data || []);
          this.applyFilters();
          this.loading = false;
        });
      },
      error: (error: any) => {
        console.error('Error loading expenses:', error);
        this.toastService.error('Failed to load expenses. Please try again.');
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filteredExpenses = this.expenses.filter(expense => {
      const matchesSearch = !this.searchQuery || 
        expense.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesGroup = this.selectedGroup === 'all' || 
        expense.groupId === this.selectedGroup;
      
      const matchesCategory = this.selectedCategory === 'all' || 
        expense.category === this.selectedCategory;

      return matchesSearch && matchesGroup && matchesCategory;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onGroupChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  getCategoryIcon(category: ExpenseCategory): string {
    const icons: Record<ExpenseCategory, string> = {
      [ExpenseCategory.FOOD]: 'restaurant',
      [ExpenseCategory.TRANSPORT]: 'directions_car',
      [ExpenseCategory.ACCOMMODATION]: 'hotel',
      [ExpenseCategory.ENTERTAINMENT]: 'movie',
      [ExpenseCategory.UTILITIES]: 'bolt',
      [ExpenseCategory.SHOPPING]: 'shopping_cart',
      [ExpenseCategory.OTHER]: 'category',
    };
    return icons[category];
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
    });
  }

  getGroupName(groupId: number): string {
    const group = this.groups.find(g => g.id === groupId);
    return group?.name || 'Unknown Group';
  }

  onExpenseClick(expense: Expense): void {
    this.router.navigate(['/groups', expense.groupId]);
  }
}


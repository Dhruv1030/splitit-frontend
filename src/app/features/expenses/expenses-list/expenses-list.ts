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
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../core/services/expense.service';
import { GroupService } from '../../../core/services/group.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Expense, ExpenseCategory, SplitType } from '../../../core/models/expense.model';
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
    MatSliderModule,
    MatExpansionModule,
    MatBadgeModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './expenses-list.html',
  styleUrls: ['./expenses-list.scss'],
})
export class ExpensesListComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private groupService = inject(GroupService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  groups: Group[] = [];
  loading = true;
  currentUserId = '';

  // Basic Filters
  searchQuery = '';
  selectedGroup: number | 'all' = 'all';
  selectedCategory: ExpenseCategory | 'all' = 'all';

  // Advanced Filters
  selectedSplitType: SplitType | 'all' = 'all';
  minAmount = 0;
  maxAmount = 1000;
  currentMinAmount = 0;
  currentMaxAmount = 1000;
  createdByMe = false;
  showAdvancedFilters = false;

  categories = Object.values(ExpenseCategory);
  splitTypes = Object.values(SplitType);

  get activeFiltersCount(): number {
    let count = 0;
    if (this.searchQuery) count++;
    if (this.selectedGroup !== 'all') count++;
    if (this.selectedCategory !== 'all') count++;
    if (this.selectedSplitType !== 'all') count++;
    if (this.currentMinAmount > this.minAmount || this.currentMaxAmount < this.maxAmount) count++;
    if (this.createdByMe) count++;
    return count;
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUserValue();
    this.currentUserId = currentUser?.id || '';
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
          this.calculateAmountRange();
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

  calculateAmountRange(): void {
    if (this.expenses.length === 0) return;
    
    const amounts = this.expenses.map(e => e.amount);
    this.minAmount = Math.floor(Math.min(...amounts));
    this.maxAmount = Math.ceil(Math.max(...amounts));
    this.currentMinAmount = this.minAmount;
    this.currentMaxAmount = this.maxAmount;
  }

  applyFilters(): void {
    this.filteredExpenses = this.expenses.filter(expense => {
      const matchesSearch = !this.searchQuery || 
        expense.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesGroup = this.selectedGroup === 'all' || 
        expense.groupId === this.selectedGroup;
      
      const matchesCategory = this.selectedCategory === 'all' || 
        expense.category === this.selectedCategory;

      const matchesSplitType = this.selectedSplitType === 'all' ||
        expense.splitType === this.selectedSplitType;

      const matchesAmount = expense.amount >= this.currentMinAmount &&
        expense.amount <= this.currentMaxAmount;

      const matchesCreator = !this.createdByMe ||
        expense.paidBy === this.currentUserId;

      return matchesSearch && matchesGroup && matchesCategory && 
             matchesSplitType && matchesAmount && matchesCreator;
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

  onSplitTypeChange(): void {
    this.applyFilters();
  }

  onAmountRangeChange(): void {
    this.applyFilters();
  }

  onCreatedByMeChange(): void {
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedGroup = 'all';
    this.selectedCategory = 'all';
    this.selectedSplitType = 'all';
    this.currentMinAmount = this.minAmount;
    this.currentMaxAmount = this.maxAmount;
    this.createdByMe = false;
    this.applyFilters();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  formatSliderValue(value: number): string {
    return `$${value}`;
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
    this.router.navigate(['/expenses', expense.id]);
  }
}


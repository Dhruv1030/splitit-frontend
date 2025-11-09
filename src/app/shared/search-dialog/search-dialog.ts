import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { GroupService } from '../../core/services/group.service';
import { ExpenseService } from '../../core/services/expense.service';
import { UserService } from '../../core/services/user.service';
import { Group } from '../../core/models/group.model';
import { Expense } from '../../core/models/expense.model';
import { User } from '../../core/models/user.model';

interface SearchResult {
  type: 'group' | 'expense' | 'user';
  id: string | number;
  title: string;
  subtitle: string;
  icon: string;
  data: any;
}

@Component({
  selector: 'app-search-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './search-dialog.html',
  styleUrls: ['./search-dialog.scss'],
})
export class SearchDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<SearchDialogComponent>);
  private router = inject(Router);
  private groupService = inject(GroupService);
  private expenseService = inject(ExpenseService);
  private userService = inject(UserService);

  searchQuery = '';
  searchSubject = new Subject<string>();
  loading = false;
  results: SearchResult[] = [];
  selectedIndex = -1;

  ngOnInit(): void {
    // Setup debounced search
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        this.performSearch(query);
      });

    // Focus the input on open
    setTimeout(() => {
      const input = document.querySelector('input[name="search"]') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    this.selectedIndex = -1;
    
    if (query.trim().length === 0) {
      this.results = [];
      return;
    }

    this.searchSubject.next(query);
  }

  performSearch(query: string): void {
    if (query.trim().length < 2) {
      this.results = [];
      return;
    }

    this.loading = true;
    const lowerQuery = query.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search Groups
    this.groupService.getUserGroups().subscribe({
      next: (response) => {
        const groups = response.data || [];
        const groupResults = groups
          .filter((group: Group) =>
            group.name.toLowerCase().includes(lowerQuery) ||
            group.description?.toLowerCase().includes(lowerQuery)
          )
          .map((group: Group) => ({
            type: 'group' as const,
            id: group.id,
            title: group.name,
            subtitle: `${group.members?.length || 0} members`,
            icon: 'group',
            data: group,
          }));
        
        allResults.push(...groupResults);
        this.updateResults(allResults);
      },
      error: (err) => console.error('Error searching groups:', err),
    });

    // Search Expenses
    this.expenseService.getUserExpenses().subscribe({
      next: (response) => {
        const expenses = response.data || [];
        const expenseResults = expenses
          .filter((expense: Expense) =>
            expense.description.toLowerCase().includes(lowerQuery) ||
            expense.category.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 10) // Limit to 10 expenses
          .map((expense: Expense) => ({
            type: 'expense' as const,
            id: expense.id,
            title: expense.description,
            subtitle: `$${expense.amount.toFixed(2)} • ${expense.category}`,
            icon: this.getCategoryIcon(expense.category),
            data: expense,
          }));
        
        allResults.push(...expenseResults);
        this.updateResults(allResults);
      },
      error: (err) => console.error('Error searching expenses:', err),
    });

    // Search Users
    this.userService.searchUsers(query).subscribe({
      next: (users) => {
        const userResults = (users || [])
          .slice(0, 5) // Limit to 5 users
          .map((user: User) => ({
            type: 'user' as const,
            id: user.id,
            title: user.name,
            subtitle: user.email,
            icon: 'person',
            data: user,
          }));
        
        allResults.push(...userResults);
        this.updateResults(allResults);
      },
      error: (err) => console.error('Error searching users:', err),
    });
  }

  updateResults(results: SearchResult[]): void {
    // Sort by type priority: groups, expenses, users
    const typePriority = { group: 0, expense: 1, user: 2 };
    this.results = results.sort((a, b) => typePriority[a.type] - typePriority[b.type]);
    this.loading = false;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      FOOD: 'restaurant',
      TRANSPORT: 'directions_car',
      ACCOMMODATION: 'hotel',
      ENTERTAINMENT: 'movie',
      UTILITIES: 'lightbulb',
      SHOPPING: 'shopping_cart',
      OTHER: 'receipt',
    };
    return icons[category] || 'receipt';
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.results.length - 1);
      this.scrollToSelected();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
      this.scrollToSelected();
    } else if (event.key === 'Enter' && this.selectedIndex >= 0) {
      event.preventDefault();
      this.selectResult(this.results[this.selectedIndex]);
    }
  }

  scrollToSelected(): void {
    setTimeout(() => {
      const selectedElement = document.querySelector('.search-result.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  }

  selectResult(result: SearchResult): void {
    this.dialogRef.close();

    switch (result.type) {
      case 'group':
        this.router.navigate(['/groups', result.id]);
        break;
      case 'expense':
        // Navigate to expense detail or the group containing the expense
        if (result.data.groupId) {
          this.router.navigate(['/groups', result.data.groupId]);
        }
        break;
      case 'user':
        // Could navigate to user profile or show user details
        console.log('User selected:', result.data);
        break;
    }
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      group: 'Group',
      expense: 'Expense',
      user: 'User',
    };
    return labels[type] || type;
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      group: 'primary',
      expense: 'accent',
      user: 'warn',
    };
    return colors[type] || 'primary';
  }

  close(): void {
    this.dialogRef.close();
  }
}

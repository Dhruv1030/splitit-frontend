import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-groups-list',
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
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './groups-list.html',
  styleUrls: ['./groups-list.scss'],
})
export class GroupsListComponent implements OnInit {
  private groupService = inject(GroupService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  groups: Group[] = [];
  filteredGroups: Group[] = [];
  loading = true;
  searchQuery = '';

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.groupService.getUserGroups().subscribe({
      next: (response) => {
        this.groups = response.data;
        this.filteredGroups = [...this.groups];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredGroups = [...this.groups];
      return;
    }

    this.filteredGroups = this.groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query) ||
        group.category.toLowerCase().includes(query)
    );
  }

  onCreateGroup(): void {
    import('../group-form-dialog/group-form-dialog').then((m) => {
      const dialogRef = this.dialog.open(m.GroupFormDialogComponent, {
        width: '600px',
        disableClose: false,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadGroups();
        }
      });
    });
  }

  onGroupClick(groupId: number): void {
    this.router.navigate(['/groups', groupId]);
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

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      TRIP: '#2196f3',
      HOME: '#4caf50',
      COUPLE: '#e91e63',
      OTHER: '#9e9e9e',
    };
    return colors[category] || '#9e9e9e';
  }
}


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
  templateUrl: './add-member-dialog.html',
  styleUrls: ['./add-member-dialog.scss'],
})
export class AddMemberDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  private snackBar = inject(MatSnackBar);

  searchForm!: FormGroup;
  searchResults: User[] = [];
  loading = false;
  searching = false;

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchQuery: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      return;
    }

    const query = this.searchForm.get('searchQuery')?.value;
    this.searching = true;

    this.userService.searchUsers(query).subscribe({
      next: (users) => {
        this.searching = false;
        this.searchResults = users;
        
        if (users.length === 0) {
          this.snackBar.open('No users found', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.searching = false;
        this.snackBar.open('Failed to search users', 'Close', { duration: 3000 });
      },
    });
  }

  onSelectUser(user: User): void {
    this.dialogRef.close(user);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

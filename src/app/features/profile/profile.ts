import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  currentUser: User | null = null;
  friends: User[] = [];
  searchResults: User[] = [];
  
  profileForm: FormGroup;
  passwordForm: FormGroup;
  searchQuery = '';
  
  loading = true;
  savingProfile = false;
  savingPassword = false;
  searching = false;
  loadingFriends = false;
  activeTab = 0;
  
  // Password visibility toggles
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      defaultCurrency: ['USD', Validators.required],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadFriends();
  }

  passwordMatchValidator(g: FormGroup) {
    const newPass = g.get('newPassword')?.value;
    const confirmPass = g.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  loadUserProfile(): void {
    const currentUserStr = localStorage.getItem('current_user');
    if (!currentUserStr) {
      console.log('[Profile] No current_user in localStorage, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      const userId = currentUser.id || currentUser.userId;
      
      console.log('[Profile] Current user from localStorage:', currentUser);
      console.log('[Profile] User ID:', userId);
      
      if (!userId) {
        console.error('[Profile] No userId found in current_user, redirecting to login');
        this.router.navigate(['/login']);
        return;
      }

      this.loading = true;
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          console.log('[Profile] User profile loaded:', user);
          this.currentUser = user;
          this.profileForm.patchValue({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            defaultCurrency: user.defaultCurrency || 'USD',
          });
          this.loading = false;
        },
        error: (error: any) => {
          console.error('[Profile] Error loading profile:', error);
          this.loading = false;
          this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
        },
      });
    } catch (error) {
      console.error('[Profile] Error parsing current_user from localStorage:', error);
      this.router.navigate(['/login']);
    }
  }

  loadFriends(): void {
    const currentUserStr = localStorage.getItem('current_user');
    if (!currentUserStr) return;

    const currentUser = JSON.parse(currentUserStr);
    const userId = currentUser.userId || currentUser.id;
    if (!userId) return;

    this.userService.getUserFriends(userId).subscribe({
      next: (friends) => {
        this.friends = friends;
      },
      error: (error: any) => {
        console.error('Error loading friends:', error);
      },
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid || !this.currentUser) return;

    this.savingProfile = true;
    const formValue = this.profileForm.value;

    this.userService.updateUser(this.currentUser.id, formValue).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.savingProfile = false;
        this.snackBar.open('Profile updated successfully!', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.savingProfile = false;
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
      },
    });
  }

  onSaveProfile(): void {
    this.onUpdateProfile();
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.savingPassword = true;
    const formValue = this.passwordForm.value;

    // Use separate password endpoint
    if (this.currentUser && formValue.newPassword) {
      this.http.put(`${environment.apiUrl}/users/${this.currentUser.id}/password`, {
        currentPassword: formValue.currentPassword,
        newPassword: formValue.newPassword
      }).subscribe({
        next: () => {
          this.savingPassword = false;
          this.passwordForm.reset();
          this.snackBar.open('Password changed successfully!', 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error: any) => {
          console.error('Error changing password:', error);
          this.savingPassword = false;
          this.snackBar.open('Failed to change password', 'Close', { duration: 3000 });
        },
      });
    }
  }

  searchFriends(): void {
    const query = this.searchQuery.trim();
    if (query.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searching = true;
    this.userService.searchUsers(query).subscribe({
      next: (response) => {
        this.searchResults = response.data.filter(user =>
          user.id !== this.currentUser?.id &&
          !this.friends.some(friend => friend.id === user.id)
        );
        this.searching = false;
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.snackBar.open('Failed to search users', 'Close', { duration: 3000 });
        this.searching = false;
      }
    });
  }

  onAddFriend(friendId: string): void {
    if (!this.currentUser) return;

    this.userService.addFriend(this.currentUser.id, friendId).subscribe({
      next: () => {
        this.loadFriends();
        this.searchResults = this.searchResults.filter(user => user.id !== friendId);
        this.snackBar.open('Friend added successfully!', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error: any) => {
        console.error('Error adding friend:', error);
        this.snackBar.open('Failed to add friend', 'Close', { duration: 3000 });
      },
    });
  }

  removeFriend(friendId: string): void {
    if (!this.currentUser) return;
    
    if (confirm('Are you sure you want to remove this friend?')) {
      this.userService.removeFriend(this.currentUser.id, friendId).subscribe({
        next: () => {
          this.snackBar.open('Friend removed successfully', 'Close', { duration: 3000 });
          this.loadFriends();
        },
        error: (error) => {
          console.error('Error removing friend:', error);
          this.snackBar.open('Failed to remove friend', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}

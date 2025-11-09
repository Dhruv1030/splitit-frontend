import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface EmailPreferences {
  paymentReminders: boolean;
  paymentReceived: boolean;
  groupInvitations: boolean;
  weeklyDigest: boolean;
  newExpenseNotifications: boolean;
  settlementReminders: boolean;
}

@Component({
  selector: 'app-email-preferences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './email-preferences.html',
  styleUrls: ['./email-preferences.scss'],
})
export class EmailPreferencesComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  loading = true;
  saving = false;
  sendingTestEmail = false;

  preferences: EmailPreferences = {
    paymentReminders: true,
    paymentReceived: true,
    groupInvitations: true,
    weeklyDigest: false,
    newExpenseNotifications: true,
    settlementReminders: true,
  };

  // Track initial state to detect changes
  private initialPreferences: EmailPreferences = { ...this.preferences };

  ngOnInit(): void {
    this.loadPreferences();
  }

  loadPreferences(): void {
    this.loading = true;
    
    // In a real app, this would load from the backend
    // For now, we'll simulate with localStorage
    const saved = localStorage.getItem('emailPreferences');
    if (saved) {
      try {
        this.preferences = JSON.parse(saved);
        this.initialPreferences = { ...this.preferences };
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
    
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  savePreferences(): void {
    this.saving = true;

    // In a real app, this would save to the backend
    // For now, we'll save to localStorage
    setTimeout(() => {
      try {
        localStorage.setItem('emailPreferences', JSON.stringify(this.preferences));
        this.initialPreferences = { ...this.preferences };
        this.toastService.success('Email preferences saved successfully');
      } catch (error) {
        console.error('Error saving preferences:', error);
        this.toastService.error('Failed to save preferences');
      }
      this.saving = false;
    }, 800);
  }

  sendTestEmail(): void {
    this.sendingTestEmail = true;

    // Simulate sending a test email
    setTimeout(() => {
      this.toastService.success('Test email sent! Check your inbox.');
      this.sendingTestEmail = false;
    }, 1500);
  }

  resetToDefaults(): void {
    this.preferences = {
      paymentReminders: true,
      paymentReceived: true,
      groupInvitations: true,
      weeklyDigest: false,
      newExpenseNotifications: true,
      settlementReminders: true,
    };
    this.toastService.info('Preferences reset to defaults');
  }

  hasChanges(): boolean {
    return JSON.stringify(this.preferences) !== JSON.stringify(this.initialPreferences);
  }

  enableAll(): void {
    Object.keys(this.preferences).forEach(key => {
      this.preferences[key as keyof EmailPreferences] = true;
    });
  }

  disableAll(): void {
    Object.keys(this.preferences).forEach(key => {
      this.preferences[key as keyof EmailPreferences] = false;
    });
  }

  get currentUserEmail(): string {
    return this.authService.getCurrentUserValue()?.email || '';
  }
}

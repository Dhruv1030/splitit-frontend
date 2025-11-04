import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  success(message: string, action?: string): void {
    this.snackBar.open(message, action || 'Close', {
      ...this.defaultConfig,
      panelClass: ['toast-success'],
      duration: 3000,
    });
  }

  error(message: string, action?: string): void {
    this.snackBar.open(message, action || 'Close', {
      ...this.defaultConfig,
      panelClass: ['toast-error'],
      duration: 5000,
    });
  }

  warning(message: string, action?: string): void {
    this.snackBar.open(message, action || 'Close', {
      ...this.defaultConfig,
      panelClass: ['toast-warning'],
      duration: 4000,
    });
  }

  info(message: string, action?: string): void {
    this.snackBar.open(message, action || 'Close', {
      ...this.defaultConfig,
      panelClass: ['toast-info'],
      duration: 3000,
    });
  }

  show(message: string, action?: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, action || 'Close', {
      ...this.defaultConfig,
      ...config,
    });
  }

  showWithAction(message: string, action: string, callback: () => void, duration = 5000): void {
    const snackBarRef = this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration,
    });

    snackBarRef.onAction().subscribe(() => {
      callback();
    });
  }
}

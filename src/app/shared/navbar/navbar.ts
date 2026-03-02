import { Component, inject, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthStore } from '../../core/store/auth.store';
import { User } from '../../core/models/user.model';
import { OfflineSyncService } from '../../core/services/offline-sync.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent {
  @Output() menuToggle = new EventEmitter<void>();

  protected readonly authStore = inject(AuthStore);
  protected readonly offlineSync = inject(OfflineSyncService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    // Ctrl+K or Cmd+K to open search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.openSearch();
    }
  }

  openSearch(): void {
    import('../search-dialog/search-dialog').then((m) => {
      this.dialog.open(m.SearchDialogComponent, {
        width: '600px',
        maxWidth: '90vw',
        panelClass: 'search-dialog-container',
        autoFocus: true,
      });
    });
  }

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  onLogout(): void {
    this.authStore.logout();
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  switchLanguage(locale: string): void {
    const currentPath = window.location.pathname;
    // Simple redirect logic for dev/prod build-time i18n
    // In a real prod env, this would be handled by the server (e.g. Nginx)
    // Here we'll just try to replace the locale segment if it exists
    if (locale === 'en-US') {
      window.location.href = '/';
    } else {
      window.location.href = `/${locale}/`;
    }
  }
}

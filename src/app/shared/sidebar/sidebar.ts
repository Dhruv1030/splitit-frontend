import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatDividerModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  mainNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Groups', icon: 'group', route: '/groups' },
    { label: 'Expenses', icon: 'receipt', route: '/expenses' },
    { label: 'Settlements', icon: 'account_balance_wallet', route: '/settlements' },
  ];

  accountNavItems: NavItem[] = [
    { label: 'Profile', icon: 'person', route: '/profile' },
  ];

  onNavItemClick(): void {
    this.closeSidebar.emit();
  }
}

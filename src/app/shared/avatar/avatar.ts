import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './avatar.html',
  styleUrls: ['./avatar.scss'],
})
export class AvatarComponent {
  @Input() name: string = '';
  @Input() imageUrl?: string;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showTooltip: boolean = true;
  @Input() color?: string;

  /**
   * Get initials from name
   */
  getInitials(): string {
    if (!this.name) return '?';

    return this.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Get background color based on name
   */
  getBackgroundColor(): string {
    if (this.color) return this.color;

    // Generate a consistent color based on name
    const colors = [
      '#667eea', // Purple
      '#764ba2', // Dark Purple
      '#f093fb', // Pink
      '#4facfe', // Blue
      '#00f2fe', // Cyan
      '#43e97b', // Green
      '#38f9d7', // Teal
      '#fa709a', // Rose
      '#fee140', // Yellow
      '#fa8231', // Orange
    ];

    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }
}

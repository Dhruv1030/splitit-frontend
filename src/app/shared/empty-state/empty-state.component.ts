import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-empty-state',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    template: `
    <div class="empty-state-container" [class.compact]="compact">
      <div class="empty-state-icon-wrapper">
        <mat-icon class="empty-state-icon">{{ icon }}</mat-icon>
      </div>
      <h3 class="empty-state-title">{{ title }}</h3>
      <p class="empty-state-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      <button
        *ngIf="actionLabel"
        mat-raised-button
        color="primary"
        class="empty-state-action"
        (click)="action.emit()"
      >
        <mat-icon *ngIf="actionIcon">{{ actionIcon }}</mat-icon>
        {{ actionLabel }}
      </button>
    </div>
  `,
    styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      gap: 12px;

      &.compact {
        padding: 32px 16px;
        .empty-state-icon { font-size: 40px; width: 40px; height: 40px; }
        .empty-state-title { font-size: 16px; }
      }
    }

    .empty-state-icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .empty-state-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--color-primary, #3b82f6);
      opacity: 0.7;
    }

    .empty-state-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary, #f8fafc);
      margin: 0;
    }

    .empty-state-subtitle {
      font-size: 14px;
      color: var(--color-text-secondary, #94a3b8);
      margin: 0;
      max-width: 320px;
      line-height: 1.6;
    }

    .empty-state-action {
      margin-top: 8px;
      border-radius: 8px;

      mat-icon {
        margin-right: 6px;
        font-size: 18px;
        height: 18px;
        width: 18px;
      }
    }
  `]
})
export class EmptyStateComponent {
    @Input() icon = 'inbox';
    @Input() title = 'Nothing here yet';
    @Input() subtitle = '';
    @Input() actionLabel = '';
    @Input() actionIcon = '';
    @Input() compact = false;
    @Output() action = new EventEmitter<void>();
}

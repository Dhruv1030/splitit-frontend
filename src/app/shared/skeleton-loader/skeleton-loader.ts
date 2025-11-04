import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType = 'text' | 'card' | 'list' | 'table' | 'expense-card' | 'group-card';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.html',
  styleUrls: ['./skeleton-loader.scss'],
})
export class SkeletonLoaderComponent {
  @Input() type: SkeletonType = 'text';
  @Input() count: number = 1;
  @Input() height: string = 'auto';
  @Input() width: string = '100%';

  get items(): number[] {
    return Array(this.count).fill(0);
  }
}

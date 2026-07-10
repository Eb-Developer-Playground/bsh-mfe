import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss'
})
export class SkeletonLoaderComponent {
  @Input() headers: string[] = [];
  @Input() itemCount = 10;
  /** Optional per-column cell type: 'stacked' | 'radio' | 'long' | 'short' | 'xs' | 'badge' | 'text' */
  @Input() cellTypes: string[] = [];

  get skeletonRows(): number[] {
    return Array.from({ length: this.itemCount }, (_, i) => i);
  }

  getCellType(i: number): string {
    if (this.cellTypes.length > 0) {
      return this.cellTypes[i] ?? 'text';
    }
    // Default: dashboard layout
    if (i === 0) return 'stacked';
    if (i === this.headers.length - 1) return 'badge';
    if (i === 2) return 'short';
    if (i === 3) return 'xs';
    if (i === 4) return 'long';
    return 'text';
  }
}

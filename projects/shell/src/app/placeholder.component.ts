import { Component, signal } from '@angular/core';

export const placeholderDisplayName = signal('');

@Component({
  standalone: true,
  selector: 'app-remote-placeholder',
  template: `
    <div class="placeholder-container">
      <div class="placeholder-content">
        <p class="placeholder-message">Could not load {{ displayName() }}</p>
        <button class="placeholder-retry-btn" (click)="retry()">Retry</button>
      </div>
    </div>
  `,
  styles: [
    `
    :host {
      display: flex;
      min-height: 100dvh;
      width: 100%;
    }
    .placeholder-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    }
    .placeholder-content {
      text-align: center;
      padding: 2rem;
    }
    .placeholder-message {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      color: #333;
    }
    .placeholder-retry-btn {
      padding: 0.5rem 1.5rem;
      font-size: 0.875rem;
      cursor: pointer;
      background: #a32a29;
      color: #fff;
      border: none;
      border-radius: 4px;
    }
    .placeholder-retry-btn:hover {
      background: #8a2221;
    }
    `,
  ],
})
export class PlaceholderComponent {
  displayName = placeholderDisplayName;

  retry(): void {
    window.location.reload();
  }
}

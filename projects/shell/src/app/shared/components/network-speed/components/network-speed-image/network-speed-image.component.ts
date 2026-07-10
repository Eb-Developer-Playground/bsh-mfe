import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-network-speed-image',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .speed-icon {
        width: 25px;
        transition: opacity 0.5s ease;
      }

      .icon-2g {
        animation: zoom-in-zoom-out 1s ease infinite;
      }

      .big-image {
        width: 50px;
      }

      @keyframes zoom-in-zoom-out {
        0% {
          scale: 100%;
        }
        50% {
          scale: 150%;
        }
        100% {
          scale: 100%;
        }
      }
    `,
  ],
  template: `
    <img
      class="speed-icon"
      [ngClass]="{
        'icon-2g': imageType === '2g',
        'icon-3g': imageType === '3g',
        'icon-4g': imageType === '4g',
        'icon-5g': imageType === '5g',
        'big-image': bigImage
      }"
      [src]="'assets/icons/icon-' + imageType + '.svg'"
      alt="Network Speed Image" />
  `,

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkSpeedImageComponent {
  @Input() imageType: '2g' | '3g' | '4g' | '5g' | string = '2g';
  @Input() bigImage = false;
}

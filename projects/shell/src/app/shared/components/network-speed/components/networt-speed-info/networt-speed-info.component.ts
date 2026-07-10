import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NetworkSpeedInterface } from '../../interfaces/network-speed.interface';

import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { NetworkSpeedImageComponent } from '../network-speed-image/network-speed-image.component';

@Component({
  selector: 'app-networt-speed-info',
  standalone: true,
  imports: [MatMenuModule, CommonModule, NetworkSpeedImageComponent],
  template: `
    <section
      class="cursor-pointer"
      [matMenuTriggerFor]="speedMenu"
      #menuTrigger="matMenuTrigger">
      <app-network-speed-image [imageType]="speedInfo.effectiveType" />

      <mat-menu #speedMenu xPosition="before">
        <section class="d-flex flex-column pt-8 pl-8 pb-8">
          <article class="d-flex justify-content-center">
            <app-network-speed-image
              [imageType]="speedInfo.effectiveType"
              [bigImage]="true" />
          </article>

          <span>
            <p class="mat-body-2 m-0">Connection</p>
            <p class="mat-caption text-muted m-0 ">
              {{ speedInfo.effectiveType }}
            </p>
          </span>
          <span>
            <p class="mat-body-2 m-0">Speed</p>
            <p class="mat-caption text-muted m-0">
              {{ speedInfo.speed | number: '1.0-1' }} Mbps
            </p>
          </span>
        </section>
      </mat-menu>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetwortSpeedInfoComponent {
  @Input() speedInfo!: NetworkSpeedInterface;
}

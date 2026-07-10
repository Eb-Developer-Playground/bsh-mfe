import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NetworkSpeedService } from '../service/network-speed.service';
import { NetwortSpeedInfoComponent } from './networt-speed-info/networt-speed-info.component';

@Component({
  selector: 'app-network-speed',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NetwortSpeedInfoComponent],
  providers: [NetworkSpeedService],
  host: {
    class: 'pl-8 pr-8',
  },

  template: `
    @if (networkSpeedInfo$ | async; as speedInfo) {
      <ng-container>
        <app-networt-speed-info
          [speedInfo]="speedInfo"></app-networt-speed-info>
      </ng-container>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkSpeedComponent {
  private networkSpeedService = inject(NetworkSpeedService);
  networkSpeedInfo$ = this.networkSpeedService.getSpeed();
}

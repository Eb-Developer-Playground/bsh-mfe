import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  fromEvent,
  map,
  Observable,
  of,
  startWith,
} from 'rxjs';
import { NetworkSpeedInterface } from '../interfaces/network-speed.interface';

@Injectable({
  providedIn: 'root',
})
export class NetworkSpeedService {
  private dateOfLastMessageSubject = new BehaviorSubject<Date | null>(null);
  dateOfLastMessageSubject$ = this.dateOfLastMessageSubject.asObservable();

  private connection =
    (navigator as any)?.connection ||
    (navigator as any)?.mozConnection ||
    (navigator as any)?.webkitConnection;

  speedConnectionChange() {
    if (!this.connection || !this.connection.downlink) {
      this.connectionFailback();
    }

    return fromEvent(this.connection, 'change').pipe(
      startWith(this.connection),
      map((event: any) => {
        if (!event?.currentTarget) {
          return {
            speed: event.downlink || 0,
            type: event.type || 'COMMON.UNKNOWN',
            effectiveType: event.effectiveType || 'COMMON.UNKNOWN',
            rtt: event.rtt
              ? `${event.rtt} ms`
              : 'NETWORK-SPEED.RTT-NOT AVAILABLE',
          };
        }

        const { currentTarget: navigationInformation } = event;

        return {
          speed: navigationInformation.downlink || 0,
          type: navigationInformation.type || 'COMMON.UNKNOWN',
          effectiveType:
            navigationInformation.effectiveType || 'COMMON.UNKNOWN',
          rtt: navigationInformation.rtt
            ? `${navigationInformation.rtt} ms`
            : 'NETWORK-SPEED.RTT-NOT AVAILABLE',
        };
      })
    );
  }
  getSpeed(): Observable<NetworkSpeedInterface> {
    if (this.connection || this.connection.downlink) {
      this.connectionFailback();
    }

    const networkSpeedEvent$ = of(this.connection).pipe(
      map(navigationInformation => {
        return {
          speed:
            navigationInformation.downlink ||
            'NETWORK-SPEED.NETWORK-SPEED-NOT-AVAILABLE',
          type: navigationInformation.type || 'COMMON.UNKNOWN',
          effectiveType:
            navigationInformation.effectiveType || 'COMMON.UNKNOWN',
          rtt: navigationInformation.rtt
            ? `${navigationInformation.rtt} ms`
            : 'NETWORK-SPEED.RTT-NOT AVAILABLE',
        };
      })
    );
    return networkSpeedEvent$;
  }

  setDateOfLastMessage(date: Date) {
    this.dateOfLastMessageSubject.next(date);
  }

  checkIfLastMessageIsExpired(): boolean {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const date = this.dateOfLastMessageSubject.value;
    return date ? Date.now() - date.getTime() > FIVE_MINUTES : true;
  }

  private connectionFailback(): Observable<NetworkSpeedInterface> {
    return of({
      speed: '0',
      type: 'COMMON.UNKNOWN',
      effectiveType: '2g',
      rtt: 'NETWORK-SPEED.RTT-NOT AVAILABLE',
    });
  }
}

import { Injectable, NgZone } from '@angular/core';
import { buffer, firstValueFrom, fromEvent, interval, merge, of } from 'rxjs';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class TimeoutService {
  private _idleSeconds = 0;
  private _maxIdleSeconds: number = 4 * 60;
  private _sessionBuffer = 90;

  constructor(private zone: NgZone) {}

  init(session: any) {
    merge(
      ...[
        'click',
        'wheel',
        'scroll',
        'mousemove',
        'touchstart',
        'keydown',
        'resize',
      ].map(ev => fromEvent(document, ev))
    )
      .pipe(buffer(interval(1_000)))
      .subscribe(events => {
        if (events?.length === 0) {
          this._idleSeconds++;
        } else {
          this._idleSeconds = 0;
          // Reload session if it ends within next 90 seconds
          if (
            moment()
              .add(this._sessionBuffer, 'seconds')
              .isAfter(session.expiresAt)
          ) {
            session
              .updateSession(undefined, session.userBank, false)
              .subscribe(() => {});
          }
          if (
            moment().add(1, 'seconds').isAfter(session.expiresAt) &&
            localStorage.getItem('access_token')
          ) {
            localStorage.removeItem('expires_at');
            localStorage.removeItem('access_token');
            window.location.reload();
          }
        }
        if (
          session.isLoggedIn() &&
          this._maxIdleSeconds === this._idleSeconds
        ) {
          session.showInactivityCountdown();
          this._idleSeconds = 0;
        }
        // console.log("TIMEOUT IN ", this._maxIdleSeconds - this._idleSeconds)
      });
    return firstValueFrom(of(true));
  }
}

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class SessionResolver implements Resolve<any> {
  constructor(private session: SessionService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const oldReIssueToken = this.session.reissueToken || '';
    const reIssueToken =
      (route.queryParams || route.parent?.queryParams)?.rt || '';
    if (
      reIssueToken &&
      reIssueToken !== oldReIssueToken &&
      reIssueToken !== this.session.syncToken
    ) {
      return this.session.updateSession(reIssueToken);
    }
    return of(this.session.isLoggedIn());
  }
}

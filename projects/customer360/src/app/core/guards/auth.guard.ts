import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private router = inject(Router);
  private session = inject(SessionService);
  private translate = inject(TranslateService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const params = route.queryParams || route.parent?.queryParams || {};
    const oldReIssueToken = this.session.reissueToken || '';
    const reIssueToken = (params['rt'] as string) || '';
    const bankId = (params['bankId'] as string) || '';
    const lang = (params['lang'] as string) || '';

    if (
      reIssueToken &&
      reIssueToken !== oldReIssueToken &&
      reIssueToken !== this.session.syncToken
    ) {
      return this.session.updateSession(reIssueToken, bankId).pipe(
        map(isLoggedIn => {
          if (isLoggedIn) {
            const url: UrlTree = this.router.parseUrl(state.url);
            delete url.queryParams['rt'];
            delete url.queryParams['bankId'];
            if (lang) {
              localStorage.setItem('user-locale', JSON.stringify({ language: lang }));
              this.translate.use(lang);
            }
            return url;
          }
          return false;
        })
      );
    } else {
      if (!this.session.isLoggedIn()) {
        this.session.setUrlParameter(state.url);
        return this.router.navigate(['/auth']);
      }
      return true;
    }
  }
}

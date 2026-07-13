import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from '../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class FeatureRoleGuard {
  private router = inject(Router);
  private session = inject(SessionService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const feature = route.data?.['feature'];
    if (feature?.['role']) {
      if (!this.session.hasFeatureRole(feature['role'])) {
        // TODO: restore toast + redirect once shared/modules/toast is migrated
        // this.router.navigate([feature['redirectUrl']]);
        // return false;
      }
    }
    return true;
  }
}

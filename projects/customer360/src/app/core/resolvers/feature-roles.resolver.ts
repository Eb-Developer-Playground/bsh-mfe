import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService, SessionService } from '../../shared/services';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FeatureRolesResolver {
  private api = inject(ApiService);
  private ses = inject(SessionService);

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any[]> {
    return this.api.get('/v1/backoffice/user/features').pipe(
      map((r: any) => {
        this.ses.updateFeatureRoles(r.responseObject);
        return r.responseObject;
      })
    );
  }
}

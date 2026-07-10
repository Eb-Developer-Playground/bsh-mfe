import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { SessionService } from '@app/shared/services';
import { currentEnviroment } from '@app/shared/utils';
import { Observable, of } from 'rxjs';
import { FeatureAccess } from './feature-access.interface';
import { default as featureAccessData } from '@assets/data/feature-access-data.json';

@Injectable({
  providedIn: 'root',
})
export class FeatureAccessService {
  features: FeatureAccess[] = [];

  constructor(
    private router: Router,
    private session: SessionService,
    private toast: ToastService
  ) {
    this.getFeatures().subscribe(data => {
      this.features = data;
    });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isEnabled = this.isEnabled(state.url);
    if (isEnabled !== true) {
      this.toast.show(
        'Error',
        `this Feature is not available `,
        MessageBoxType.WARNING
      );
    }
    return true;
  }

  isEnabled(featureName: string): boolean {
    const isEnabled = this.features
      .find(f =>
        featureName
          .replace(/[^a-zA-Z]/g, '')
          .toLocaleLowerCase()
          .includes(f.name.replace(/[^a-zA-Z]/g, '').toLocaleLowerCase())
      )
      ?.subsidiary.find(
        subsidiary => subsidiary.name === this.session.subsidiary.countryCode
      )
      ?.enabled.map(env => {
        return { env: env[currentEnviroment()!] };
      })
      .find(isEnabled => isEnabled)?.env;

    return isEnabled !== undefined ? isEnabled : false;
  }
  private getFeatures(): Observable<FeatureAccess[]> {
    return of(featureAccessData);
  }
}

export const FeatureAccessGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  return inject(FeatureAccessService).canActivate(next, state);
};

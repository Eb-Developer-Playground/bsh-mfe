import { inject, Injectable } from '@angular/core';
import { SessionService } from './session/session.service';
import { MenuItem } from '../models';
import { environment as env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BSHServices {
  private readonly session = inject(SessionService);

  get lang(): string {
    if (localStorage.getItem('user-locale')) {
      return (JSON.parse(localStorage.getItem('user-locale') as string) as { language: string }).language;
    }
    return '';
  }

  get MENU_ITEMS(): MenuItem[] {
    const reissue = this.session.user?.reissue ?? '';
    const params = reissue ? new URLSearchParams({ rt: reissue }) : new URLSearchParams();
    const makeUrl = (url: string): URL | null => {
      try { return new URL(url); } catch { return null; }
    };
    const addParams = (u: URL | null): URL | null => {
      if (u) u.search = params.toString();
      return u;
    };
    const swiftUrl = addParams(makeUrl(env.swiftUrl));
    const onboardingUrl = addParams(makeUrl(env.customerOnboardingUrl));
    const adminPortalUrl = addParams(makeUrl(env.adminPortalUrl));
    const bankId = this.session.userBank;
    const lang = this.lang;

    return [
      { name: 'MENU.MY-DASHBOARD', icon: 'ic-dashboard', path: '/dashboard', sub_menu: false },
      { name: 'MENU.CUSTOMER-SERVICES', icon: 'ic-person', path: '/services', sub_menu: false },
      {
        name: 'MENU.CUSTOMER-MAIN',
        icon: 'ic-account-services',
        path: adminPortalUrl ? `${adminPortalUrl}&bankId=${bankId}&lang=${lang}` : '#',
        sub_menu: true,
      },
      {
        name: 'MENU.CUSTOMER-ONBOARDING',
        icon: 'ic-acc-opening',
        path: onboardingUrl ? `${onboardingUrl}&bankId=${bankId}&lang=${lang}` : '#',
        sub_menu: true,
      },
      {
        name: 'MENU.CUSTOMER-SWIFT',
        icon: 'ic-agency',
        path: swiftUrl ? `${swiftUrl}&bankId=${bankId}&lang=${lang}` : '#',
        sub_menu: true,
      },
      { name: 'MENU.TICKETS', icon: 'ic-tickets', path: '/dashboard', sub_menu: false },
      { name: 'MENU.CORPORATE-SERVICES', icon: 'ic-corprate-services', path: '/dashboard', sub_menu: false },
      { name: 'MENU.CREDIT-SERVICES', icon: 'ic-credit-services', path: '/dashboard', sub_menu: false },
      { name: 'MENU.AGENCY-SERVICES', icon: 'ic-agency-services', path: '/dashboard', sub_menu: false },
      { name: 'MENU.SPECIAL-PROJECTS', icon: 'ic-special-projects', path: '/dashboard', sub_menu: false },
      { name: 'MENU.INSURANCE', icon: 'ic-menu-insurance', path: '/dashboard', sub_menu: false },
      { name: 'MENU.CUSTODY', icon: 'ic-custody', path: '/dashboard', sub_menu: false },
      { name: 'MENU.FOREIGN-EXCHANGE', icon: 'ic-foreign-exchange', path: '/dashboard', sub_menu: false },
      { name: 'MENU.REPORTS', icon: 'ic-reports', path: '/dashboard', sub_menu: false },
      { name: 'MENU.ADMINISTRATION', icon: 'ic-administration', path: '/dashboard', sub_menu: false },
      { name: 'MENU.MORE', icon: 'ic-more', path: '/more', sub_menu: false },
    ];
  }
}

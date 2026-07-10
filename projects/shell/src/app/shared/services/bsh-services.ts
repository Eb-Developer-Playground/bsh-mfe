import { Injectable } from '@angular/core';
import { SessionService } from './index';
import { MenuItem } from '../models';
import { environment as env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BSHServices {
  constructor(private session: SessionService) { }

  get lang(): string {
    let lang = '';
    if (localStorage.getItem('user-locale'))
      lang = JSON.parse(<string>localStorage.getItem('user-locale')).language;
    return lang;
  }

  get MENU_ITEMS(): MenuItem[] {
    const params = this.session.user
      ? new URLSearchParams({ rt: this.session.user.reissue })
      : new URLSearchParams();
    const makeUrl = (url: string | undefined): URL | null => {
      try { return url ? new URL(url) : null; }
      catch { return null; }
    };
    const addParams = (url: URL | null): URL | null => {
      if (url) url.search = params.toString();
      return url;
    };
    const swiftUrl = addParams(makeUrl((env as any).swiftUrl));
    const onboardingUrl = addParams(makeUrl(env.customerOnboardingUrl));
    const adminPortalUrl = addParams(makeUrl((env as any).adminPortalUrl));
    const cardPortalUrl = addParams(makeUrl((env as any).cardsPortalUrl));
    const bankId = this.session.userBank || '';
    return [
      {
        name: 'MENU.MY-DASHBOARD',
        icon: 'ic-dashboard',
        path: '/dashboard',
        sub_menu: false,
      },
      {
        name: 'MENU.MORE',
        icon: 'ic-grid-dots',
        path: '#',
        sub_menu: false,
        isExpanded: true,
        children: [
          {
            name: 'MENU.CUSTOMER-MAIN',
            icon: 'ic-account-services',
            path: adminPortalUrl ? `${adminPortalUrl.toString()}&bankId=${bankId}&lang=${this.lang}` : '#',
            sub_menu: true,
          },
          {
            name: 'MENU.CUSTOMER-ONBOARDING',
            icon: 'ic-acc-opening',
            path: onboardingUrl ? `${onboardingUrl.toString()}&bankId=${bankId}&lang=${this.lang}` : '#',
            sub_menu: true,
          },
          {
            name: 'MENU.CUSTOMER-SWIFT',
            icon: 'ic-agency',
            path: swiftUrl ? `${swiftUrl.toString()}&bankId=${bankId}&lang=${this.lang}` : '#',
            sub_menu: true,
          },
          {
            name: 'MENU.CARD-PORTAL',
            icon: 'ic-card',
            path: cardPortalUrl ? `${cardPortalUrl.toString()}&bankId=${bankId}&lang=${this.lang}` : '#',
            sub_menu: true,
          },
        ]
      }
    ];
  }
}

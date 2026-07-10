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
    const params = new URLSearchParams({ rt: this.session.user.reissue });
    const swiftUrl = new URL(env.swiftUrl);
    swiftUrl.search = params.toString();
    const onboardingUrl = new URL(env.customerOnboardingUrl);
    onboardingUrl.search = params.toString();
    const adminPortalUrl = new URL(env.adminPortalUrl);
    adminPortalUrl.search = params.toString();
    const cardPortalUrl = new URL(env.cardsPortalUrl);
    cardPortalUrl.search = params.toString();
    return [
      {
        name: 'MENU.MY-DASHBOARD',
        icon: 'ic-dashboard',
        path: '/dashboard',
        sub_menu: false,
      },
      {
        name: 'MENU.CUSTOMER-SERVICES',
        icon: 'ic-person',
        path: '/services',
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
            path: `${adminPortalUrl.toString()}&bankId=${this.session.userBank}&lang=${this.lang}`,
            sub_menu: true,
          },
          {
            name: 'MENU.CUSTOMER-ONBOARDING',
            icon: 'ic-acc-opening',
            path: `${onboardingUrl.toString()}&bankId=${this.session.userBank}&lang=${this.lang}`,
            sub_menu: true,
          },
          {
            name: 'MENU.CUSTOMER-SWIFT',
            icon: 'ic-agency',
            path: `${swiftUrl.toString()}&bankId=${this.session.userBank}&lang=${this.lang}`,
            sub_menu: true,
          },
          {
            name: 'MENU.CARD-PORTAL',
            icon: 'ic-card',
            path: `${cardPortalUrl.toString()}&bankId=${this.session.userBank}&lang=${this.lang}`,
            sub_menu: true,
          },
          {
            name: 'MENU.TICKETS',
            icon: 'ic-tickets',
            path: '/dashboard',
            sub_menu: false,
          },
          {
            name: 'MENU.CORPORATE-SERVICES',
            icon: 'ic-corprate-services',
            path: '/dashboard',
            sub_menu: false,
          },
          {
            name: 'MENU.CREDIT-SERVICES',
            icon: 'ic-credit-services',
            path: '/dashboard',
            sub_menu: false,
          },
          {
            name: 'MENU.AGENCY-SERVICES',
            icon: 'ic-agency-services',
            path: '/dashboard',
            sub_menu: false,
          },
          {
            name: 'MENU.SPECIAL-PROJECTS',
            icon: 'ic-special-projects',
            path: '/dashboard',
            sub_menu: false,
          },
          {
            name: 'MENU.INSURANCE',
            icon: 'ic-menu-insurance',
            path: '/dashboard',
            sub_menu: false,
          },
          {
            name: 'MENU.CUSTODY',
            icon: 'ic-custody',
            path: '/dashboard',
            sub_menu: false,
          },
          {
            name: 'MENU.FOREIGN-EXCHANGE',
            icon: 'ic-foreign-exchange',
            path: '/dashboard',
            sub_menu: false,
          },
          {
            name: 'MENU.REPORTS',
            icon: 'ic-reports',
            path: '/dashboard',
            sub_menu: false,
          },
          {
            name: 'MENU.ADMINISTRATION',
            icon: 'ic-administration',
            path: '/dashboard',
            sub_menu: false,
          },
        ]
      }
    ];
  }
}

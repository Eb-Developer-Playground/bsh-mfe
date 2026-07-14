import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, Input } from '@angular/core';
import { MenuItem } from '../../shared/models';
import { SessionService } from '@app/shared/services/session/session.service';
import { COMPAT_IMPORTS } from '../../shared/compat-barrel';
import { SessionProfileProjectionService } from '../../shared/services/session/session-profile-projection.service';
import { environment as env } from '../../../environments/environment';

@Component({
  selector: 'app-navigation',
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  menuItems!: MenuItem[];
  @Input() isSidenavOpened: boolean = true;
  private cdr = inject(ChangeDetectorRef);
  private sessionProfileProjection = inject(SessionProfileProjectionService);

  constructor(
    private session: SessionService
  ) {
    effect(() => {
      this.session.user;
      this.updateItems();
      this.cdr.markForCheck();
    });
  }

  updateItems() {
    this.menuItems = this.buildMenuItems();
  }

  toggleMenu(nav: MenuItem, event: Event) {
    if (nav.children) {
      event.preventDefault();
      nav.isExpanded = !nav.isExpanded;
    }
  }

  private buildMenuItems(): MenuItem[] {
    const params = this.session.user
      ? new URLSearchParams({ rt: this.session.user.reissue })
      : new URLSearchParams();
    const bankId = this.session.userBank || '';
    const language = this.sessionProfileProjection.getCurrentLanguage() || '';
    const swiftUrl = this.appendAuthToken(this.makeUrl((env as { swiftUrl?: string }).swiftUrl), params);
    const onboardingUrl = this.appendAuthToken(
      this.makeUrl(env.customerOnboardingUrl),
      params
    );
    const adminPortalUrl = this.appendAuthToken(
      this.makeUrl((env as { adminPortalUrl?: string }).adminPortalUrl),
      params
    );
    const cardPortalUrl = this.appendAuthToken(
      this.makeUrl((env as { cardsPortalUrl?: string }).cardsPortalUrl),
      params
    );

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
            path: adminPortalUrl ? `${adminPortalUrl.toString()}&bankId=${bankId}&lang=${language}` : '#',
            sub_menu: true,
          },
          {
            name: 'MENU.CUSTOMER-ONBOARDING',
            icon: 'ic-acc-opening',
            path: onboardingUrl ? `${onboardingUrl.toString()}&bankId=${bankId}&lang=${language}` : '#',
            sub_menu: true,
          },
          {
            name: 'MENU.CUSTOMER-SWIFT',
            icon: 'ic-agency',
            path: swiftUrl ? `${swiftUrl.toString()}&bankId=${bankId}&lang=${language}` : '#',
            sub_menu: true,
          },
          {
            name: 'MENU.CARD-PORTAL',
            icon: 'ic-card',
            path: cardPortalUrl ? `${cardPortalUrl.toString()}&bankId=${bankId}&lang=${language}` : '#',
            sub_menu: true,
          },
        ],
      },
    ];
  }

  private makeUrl(url: string | undefined): URL | null {
    try {
      return url ? new URL(url) : null;
    } catch {
      return null;
    }
  }

  private appendAuthToken(url: URL | null, params: URLSearchParams): URL | null {
    if (url) {
      url.search = params.toString();
    }

    return url;
  }
}

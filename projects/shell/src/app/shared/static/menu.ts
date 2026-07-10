import { MenuItem } from '../models';
import { environment as env } from '../../../environments/environment';

export const MENU_ITEMS: MenuItem[] = [
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
    name: 'MENU.CUSTOMER-MAIN',
    icon: '',
    path: `${(env as any).adminPortalUrl}`,
    sub_menu: true,
  },
  {
    name: 'MENU.CUSTOMER-ONBOARDING',
    icon: '',
    path: `${env.customerOnboardingUrl}`,
    sub_menu: true,
  },
  {
    name: 'MENU.CUSTOMER-SWIFT',
    icon: '',
    path: `${(env as any).swiftUrl}`,
    sub_menu: true,
  },
  {
    name: 'MENU.MORE',
    icon: 'ic-more',
    path: '/more',
    sub_menu: false,
  },
];

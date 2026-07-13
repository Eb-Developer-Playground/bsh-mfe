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
    return [
      { name: 'MENU.TICKETS', icon: '', path: 'dashboard', sub_menu: false },
      { name: 'MENU.CUSTOMER-SERVICES', icon: '', path: 'services', sub_menu: false },
      { name: 'MENU.CORPORATE-SERVICES', icon: '', path: 'dashboard', sub_menu: false },
      { name: 'MENU.CREDIT-SERVICES', icon: '', path: 'dashboard', sub_menu: false },
      { name: 'MENU.AGENCY-SERVICES', icon: '', path: 'dashboard', sub_menu: false },
      { name: 'MENU.SPECIAL-PROJECTS', icon: '', path: 'dashboard', sub_menu: false },
      { name: 'MENU.INSURANCE', icon: '', path: 'dashboard', sub_menu: false },
      { name: 'MENU.CUSTODY', icon: '', path: 'dashboard', sub_menu: false },
      { name: 'MENU.FOREIGN-EXCHANGE', icon: '', path: 'dashboard', sub_menu: false },
      { name: 'MENU.REPORTS', icon: '', path: 'dashboard', sub_menu: false },
      { name: 'MENU.ADMINISTRATION', icon: '', path: 'dashboard', sub_menu: false },
      { name: 'MENU.MORE', icon: '', path: 'more', sub_menu: false },
    ];
  }
}

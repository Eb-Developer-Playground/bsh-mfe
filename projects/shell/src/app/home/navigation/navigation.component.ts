import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, Input } from '@angular/core';
import { MenuItem } from '../../shared/models';
import { SessionService } from '../../shared/services';
import { BSHServices } from '../../shared/services/bsh-services';
import { COMPAT_IMPORTS } from '../../shared/compat-barrel';

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

  constructor(
    private bshService: BSHServices,
    private session: SessionService
  ) {
    effect(() => {
      this.session.user;
      this.updateItems();
      this.cdr.markForCheck();
    });
  }

  updateItems() {
    this.menuItems = this.bshService.MENU_ITEMS;
  }

  toggleMenu(nav: MenuItem, event: Event) {
    if (nav.children) {
      event.preventDefault();
      nav.isExpanded = !nav.isExpanded;
    }
  }
}

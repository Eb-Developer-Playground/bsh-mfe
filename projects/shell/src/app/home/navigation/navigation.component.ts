import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from '../../shared/models';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SessionService } from '../../shared/services';
import { BSHServices } from '../../shared/services/bsh-services';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  menuItems!: MenuItem[];
  destroy$: Subject<any> = new Subject<any>();
  @Input() isSidenavOpened: boolean = true;

  constructor(
    private bshService: BSHServices,
    private session: SessionService
  ) {
    this.updateItems();
  }

  ngOnInit(): void {
    this.session.onChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateItems());
  }

  ngOnDestroy() {
    this.destroy$.next('');
    this.destroy$.complete();
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

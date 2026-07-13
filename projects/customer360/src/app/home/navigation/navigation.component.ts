import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListItem, MatListItemLine, MatNavList } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from '../../shared/models';
import { SessionService } from '../../shared/services/session/session.service';
import { BSHServices } from '../../shared/services/bsh-services';

@Component({
  selector: 'app-navigation',
  imports: [
    NgFor,
    NgIf,
    RouterLink,
    RouterLinkActive,
    MatNavList,
    MatListItem,
    MatListItemLine,
    TranslatePipe,
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  menuItems!: MenuItem[];
  protected readonly parentRoute = inject(ActivatedRoute).parent;

  private readonly bshService = inject(BSHServices);
  private readonly session = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.updateItems();
  }

  ngOnInit(): void {
    this.session.onChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateItems());
  }

  updateItems(): void {
    this.menuItems = this.bshService.MENU_ITEMS;
  }
}

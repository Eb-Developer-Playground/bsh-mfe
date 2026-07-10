import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NetworkSpeedComponent } from '../shared/components/network-speed/components/network-speed.component';
import { LoaderComponent } from '../shared/modules/loader/loader.component';
import { ILocale, LocalizationService } from '../shared/modules/localization';
import { isDev, isLocal } from '../shared/utils';
import { ICONS, LOCALES } from '../shared/static';
import { UIService } from '../shared/services';
import { SessionService } from '../shared/services';
import { TransformSubsidiaryPipe } from '../shared/pipes/transform-subsidiary.pipe';
import { UserProfile } from '../shared/components/user-profile/user-profile';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [
    AsyncPipe,
    BreadcrumbComponent,
    FormsModule,
    LoaderComponent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    NavigationComponent,
    NetworkSpeedComponent,
    NgFor,
    NgIf,
    RouterLink,
    RouterOutlet,
    TransformSubsidiaryPipe,
    TranslatePipe,
  ],
  host: {
    class: 'home-component',
  },
})
export class Home implements OnInit {
  private readonly breakpointObserver = inject(BreakpointObserver);
  readonly dialog = inject(MatDialog);
  readonly isDev = isDev();
  readonly isLocal = isLocal();
  readonly localeService = inject(LocalizationService);
  readonly session = inject(SessionService);
  readonly uiService = inject(UIService);

  selectedLocale!: ILocale;
  isChecked: boolean = false;
  toggleTitle: string = '';
  isLoading: boolean = false;
  isSidenavOpened: boolean = true;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches),
    shareReplay()
  );

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.uiService.registerIcons([]);
    const sub = this.localeService.onLangChange
      .subscribe(lang => (this.selectedLocale = <ILocale>LOCALES.find(l => l.id === lang)));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.localeService.initPreferences();
    const stored = localStorage.getItem('user-locale');
    if (stored) {
      const locale: { language: string } = JSON.parse(stored);
      this.selectedLocale = <ILocale>LOCALES.find(l => l.id === locale.language);
    }
  }

  changeLocale(localeId: string) {
    this.selectedLocale = <ILocale>LOCALES.find(l => l.id === localeId);
    this.localeService.setLocale(localeId);
  }

  showProfileDetails() {
    const dialogRef = this.dialog.open(UserProfile, {
      data: {},
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(_m => {});
  }

  logout() {
    const bankId = this.session.user.bankId;
    this.session.logout().subscribe(() => this.session.login(null, '1', bankId));
  }

  toggleSidenav() {
    this.isSidenavOpened = !this.isSidenavOpened;
  }

  navigateToVersion(_isChecked: boolean) {
  }

  protected readonly window = window;
}

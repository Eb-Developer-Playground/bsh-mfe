import { EventEmitter, inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '../../../shared/services';
import { LOCALES } from '../../static';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  readonly session = inject(SessionService);
  onLangChange: EventEmitter<string> = new EventEmitter();
  urlLang!: string;

  get preferredLang(): string {
    return this.translate.currentLang() as string;
  }

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      if (params?.['lang']) {
        this.urlLang = params?.['lang'];
      }
    });
    this.translate.onLangChange.subscribe(ch => {
      this.onLangChange.emit(ch['lang']);
    });
  }

  public initPreferences(): void {
    if (localStorage.getItem('user-locale')) {
      const locale = JSON.parse(<string>localStorage.getItem('user-locale'));
      this.translate.use(locale.language);
    } else {
      this.setLocale(this.session.subsidiary?.languages?.[0]?.id || 'en-GB');
    }
  }

  public setLocale(localeId: string) {
    if (this.isValidLang(localeId)) {
      if (localeId !== this.translate.currentLang()) {
        localStorage.setItem(
          'user-locale',
          JSON.stringify({ language: localeId })
        );
        this.session.notifyChanged(true);
        this.translate.use(localeId);
        this.urlLang = localeId;
        this.setUrlLocale().then(() => {});
      }
    }
  }

  private isValidLang(lang: string): boolean {
    return LOCALES.map(l => l.id).includes(lang);
  }

  private async setUrlLocale() {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        lang: this.urlLang,
      },
      queryParamsHandling: 'merge',
    });
  }
}

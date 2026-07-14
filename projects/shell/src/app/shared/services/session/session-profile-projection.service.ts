import { Injectable } from '@angular/core';

import { ILocale } from '../../modules/localization';
import { default as SUBSIDIARIES } from '../../../../assets/data/subsidiaries.json';
import { default as LOCALES } from '../../../../assets/data/language-locales.json';
import type { ISubsidiary } from './session.service';

@Injectable({ providedIn: 'root' })
export class SessionProfileProjectionService {
  getSubsidiary(isLoggedIn: boolean, bankId: string): ISubsidiary {
    if (!isLoggedIn) {
      return this.emptySubsidiary();
    }

    const config = SUBSIDIARIES.responseObject.find(sub => sub.bankId == bankId);
    if (!config) {
      return this.emptySubsidiary();
    }

    return {
      ...config,
      operatingCountry: false,
      countryCode3Chars: '',
      languages: this.mapLanguages(config.languages),
    };
  }

  getCurrentLanguage(): string | null {
    const localeRaw = localStorage.getItem('user-locale');
    if (!localeRaw) return null;

    try {
      const locale: unknown = JSON.parse(localeRaw);
      if (
        typeof locale === 'object' &&
        locale !== null &&
        'language' in locale &&
        typeof locale.language === 'string'
      ) {
        return locale.language;
      }
    } catch (error) {
      console.warn('[BSH.SessionService] could not parse user-locale', error);
    }

    return null;
  }

  private mapLanguages(languageIds: string[] | undefined): ILocale[] {
    return (languageIds || []).map(languageId => {
      const locale = LOCALES.find(candidate => candidate.id === languageId);
      return {
        id: locale?.id || languageId,
        name: locale?.name || languageId,
      };
    });
  }

  private emptySubsidiary(): ISubsidiary {
    return {
      bankId: '',
      countryCode: '',
      countryName: '',
      currency: '',
      currencySymbol: '',
      nationality: '',
      dialCode: '',
      icon: '',
      flagPath: '',
      operatingCountry: false,
      countryCode3Chars: '',
      languages: [],
    };
  }
}

import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';
import { SessionProfileProjectionService } from './session-profile-projection.service';
import { SessionStorageService } from './session-storage.service';

interface StoredLocale {
  language?: string;
}

@Injectable({ providedIn: 'root' })
export class SessionNavigationService {
  constructor(
    private sessionStorage: SessionStorageService,
    private sessionProfileProjection: SessionProfileProjectionService
  ) {}

  setReturnUrl(url: string): void {
    localStorage.setItem('returnUrl', JSON.stringify(url));
  }

  getReturnUrl(): string | null {
    try {
      return JSON.parse(localStorage.getItem('returnUrl') || 'false');
    } catch {
      return null;
    }
  }

  removeReturnUrl(): void {
    localStorage.removeItem('returnUrl');
  }

  login(returnPath?: string | null, reAuth?: string | null, bankId?: string): void {
    const returnUrl = returnPath || this.getReturnUrl() || '/dashboard';
    const locale = this.getStoredLocale();
    const host = window.location.port
      ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
      : `${window.location.protocol}//${window.location.hostname}`;
    const resolvedBankId = bankId || localStorage.getItem('bankId') || '';
    const params = new URLSearchParams();

    params.set('re-auth', `${reAuth || 0}`);
    params.set('returnUrl', host + returnUrl);
    params.set('lang', locale.language || 'en-GB');
    params.set('bankId', resolvedBankId);

    const redirectUrl = `${(env as { adminPortalUrl: string }).adminPortalUrl}/login/login/?${params.toString()}`;
    console.log('[BSH.SessionService] login — redirecting to admin portal:', redirectUrl.substring(0, 120) + '...');
    window.location.replace(redirectUrl);
  }

  routeToUrl(url: string | URL, reissueToken: string, bankId: string): void {
    const parts = url.toString().split('?');
    const params = parts[1] || '';
    const toUrl = new URL(parts[0]);
    const rtParams = new URLSearchParams({
      rt: reissueToken,
      bankId,
      lang: this.getStoredLocale().language || '',
    });

    toUrl.search = new URLSearchParams(`${rtParams.toString()}&${params}`).toString();

    console.log('[BSH.SessionService] routeToUrl — navigating to:', toUrl.toString().substring(0, 120) + '...', '| rt present:', !!reissueToken, '| bankId:', bankId);
    this.sessionStorage.removeItems(['expires_at', 'access_token']);
    console.log('[BSH.SessionService] routeToUrl — cleared local storage, redirecting');
    window.location.replace(toUrl);
  }

  private getStoredLocale(): StoredLocale {
    return {
      language: this.sessionProfileProjection.getCurrentLanguage() || 'en-GB',
    };
  }
}

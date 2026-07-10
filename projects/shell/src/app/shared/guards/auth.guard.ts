import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, timeout } from 'rxjs';
import { SessionService } from '../services/session/session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  console.log('[BSH.AuthGuard] evaluating url:', state.url, '| isLocal:', isLocal, '| stored token exists:', !!session.loginResponse, '| isLoggedIn:', session.isLoggedIn());

  // Skip auth check when running locally for development convenience
  if (isLocal) {
    console.log('[BSH.AuthGuard] localhost bypass → allow');
    return true;
  }

  const urlParams = new URLSearchParams(state.url.split('?')[1] || '');
  const rt = urlParams.get('rt');
  const bankId = urlParams.get('bankId');
  const lang = urlParams.get('lang');

  console.log('[BSH.AuthGuard] query params — rt:', rt ? rt.substring(0, 20) + '...' : 'none', '| bankId:', bankId, '| lang:', lang);
  console.log('[BSH.AuthGuard] stored syncToken:', session.syncToken ? session.syncToken.substring(0, 20) + '...' : 'none', '| stored reissueToken:', session.reissueToken ? session.reissueToken.substring(0, 20) + '...' : 'none');

  // When the admin portal redirects back with an rt token, exchange it for an access token
  if (rt) {
    if (rt === session.syncToken) {
      console.log('[BSH.AuthGuard] rt matches stored syncToken → already authenticated, stripping params');
      const cleanUrl = state.url.split('?')[0];
      return router.parseUrl(cleanUrl || '/');
    }

    console.log('[BSH.AuthGuard] rt detected, exchanging for access token via updateSession...');
    const startTime = performance.now();
    return session.updateSession(rt, bankId, false).pipe(
      timeout(10_000),
      map(() => {
        const elapsed = Math.round(performance.now() - startTime);
        console.log('[BSH.AuthGuard] updateSession completed in', elapsed, 'ms | isLoggedIn:', session.isLoggedIn());
        if (session.isLoggedIn()) {
          const cleanUrl = state.url.split('?')[0];
          console.log('[BSH.AuthGuard] session established, redirecting to:', cleanUrl || '/');
          return router.parseUrl(cleanUrl || '/');
        }
        console.log('[BSH.AuthGuard] updateSession succeeded but isLoggedIn is false — re-login required');
        session.setUrlParameter(state.url);
        session.login();
        return false;
      }),
      catchError(err => {
        const elapsed = Math.round(performance.now() - startTime);
        console.log('[BSH.AuthGuard] updateSession FAILED after', elapsed, 'ms | error:', err?.status, err?.statusText, err?.message);
        session.login();
        return of(false);
      })
    );
  }

  if (session.isLoggedIn()) {
    console.log('[BSH.AuthGuard] valid session exists → allow');
    return true;
  }

  console.log('[BSH.AuthGuard] no session → redirecting to admin portal login');
  session.setUrlParameter(state.url);
  session.login();
  return false;
};

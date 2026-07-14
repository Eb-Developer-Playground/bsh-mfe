import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session/session.service';
import { environment } from '@env/environment';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  console.log('[BSH.AuthGuard] evaluating url:', state.url, '| bypassAuth:', environment.bypassAuth, '| stored token exists:', !!session.loginResponse, '| isLoggedIn:', session.isLoggedIn());

  // Skip auth check when bypassAuth is enabled (development convenience)
  if (environment.bypassAuth) {
    console.log('[BSH.AuthGuard] bypassAuth enabled → allow');
    return true;
  }

  const urlParams = new URLSearchParams(state.url.split('?')[1] || '');
  const rt = urlParams.get('rt');
  const bankId = urlParams.get('bankId');
  const lang = urlParams.get('lang');

  console.log('[BSH.AuthGuard] query params — rt:', rt ? rt.substring(0, 20) + '...' : 'none', '| bankId:', bankId, '| lang:', lang);
  console.log('[BSH.AuthGuard] stored syncToken:', session.syncToken ? session.syncToken.substring(0, 20) + '...' : 'none', '| stored reissueToken:', session.reissueToken ? session.reissueToken.substring(0, 20) + '...' : 'none');

  // Legacy handles auth callbacks on a stable /auth route. Keep the shell aligned so
  // Admin Portal/Microsoft sees one callback path instead of arbitrary guarded routes.
  if (rt) {
    const authUrl = router.createUrlTree(['/auth'], {
      queryParams: { rt, bankId, lang },
    });
    return authUrl;
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

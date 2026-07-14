import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { RemoteAuthStateService } from './remote-auth-state.service';

export const remoteAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authState = inject(RemoteAuthStateService);
  const token = authState.accessToken;

  if (!token || request.headers.has('Authorization') || shouldSkipAuthHeader(request.url)) {
    return next(request);
  }

  return next(
    request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    })
  );
};

function shouldSkipAuthHeader(url: string): boolean {
  return [
    'assets/icons',
    './assets/',
    '/assets/',
    'remoteEntry.json',
    'federation.manifest.json',
    'importmap',
  ].some(segment => url.includes(segment));
}

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS,withInterceptors, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideRemoteAuthChannel, remoteAuthInterceptor } from 'equity-auth';

import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { HttpHeaderInterceptor } from './shared/interceptors/http-header.interceptor';
import { LoaderInterceptor } from './shared/interceptors/loader.interceptor';
import { NetworkSpeedInterceptor } from './shared/interceptors/network-speed.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    DatePipe,
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([remoteAuthInterceptor])),
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: NetworkSpeedInterceptor, multi: true },
    provideRemoteAuthChannel(),
    provideAnimationsAsync(),
    provideTranslateService({
      lang: 'en-GB',
      fallbackLang: 'en-GB',
    }),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
  ],
};

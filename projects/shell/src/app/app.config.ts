import {
  ApplicationConfig,
  ENVIRONMENT_INITIALIZER,
  inject,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import {
  ErrorInterceptor,
  HttpHeaderInterceptor,
  LoaderInterceptor,
  NetworkSpeedInterceptor,
} from './shared/interceptors';
import { AuthCommandListenerService } from './shared/equity-auth/auth-command-listener.service';
import {DatePipe} from '@angular/common';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { ToastService } from './shared/modules/toast/toast.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    DatePipe,
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideTranslateService({
      lang: 'en-GB',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader(),
    }),
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: NetworkSpeedInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        inject(AuthCommandListenerService);
      },
    },
    importProvidersFrom(MatSnackBarModule),
    ToastService,
  ],
};

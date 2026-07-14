import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideRemoteAuthChannel, remoteAuthInterceptor } from 'equity-auth';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([remoteAuthInterceptor])),
    provideRemoteAuthChannel(),
    provideAnimations(),
    provideTranslateService({
      lang: 'en-GB',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader(),
    }),
  ],
};

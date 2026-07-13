import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { DatePipe } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { ToastService } from './shared/modules/toast/toast.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    DatePipe,
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideTranslateService({
      lang: 'en-GB',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader(),
    }),
    importProvidersFrom(MatSnackBarModule),
    ToastService,
  ],
};

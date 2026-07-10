import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export function preferenceResolver() {
  const _translate = inject(TranslateService);
  if (localStorage.getItem('user-locale')) {
    const locale = JSON.parse(<string>localStorage.getItem('user-locale'));
    _translate.use(locale.language);
  }
}

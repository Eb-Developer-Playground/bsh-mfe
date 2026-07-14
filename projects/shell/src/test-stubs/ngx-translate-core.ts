import { EventEmitter, NgModule, Pipe, PipeTransform, Provider } from '@angular/core';
import { Observable, of } from 'rxjs';

@Pipe({ name: 'translate' })
export class TranslatePipe implements PipeTransform {
  transform(value: string): string;
  transform(value: string, params: unknown): string;
  transform(value: string): string {
    return value;
  }
}

export class TranslateLoader {}

export class TranslateService {
  private lang = 'en';
  readonly onLangChange = new EventEmitter<{ lang: string }>();

  currentLang(): string {
    return this.lang;
  }

  instant(key: string): string {
    return key;
  }

  get(key: string): Observable<string> {
    return of(key);
  }

  use(lang: string): Observable<string> {
    this.lang = lang;
    this.onLangChange.emit({ lang });
    return of(lang);
  }
}

@NgModule({
  imports: [TranslatePipe],
  exports: [TranslatePipe],
  providers: [TranslateService],
})
export class TranslateModule {
  static forRoot(): { ngModule: typeof TranslateModule; providers: Provider[] } {
    return {
      ngModule: TranslateModule,
      providers: [TranslateService],
    };
  }
}

export function provideTranslateService(): Provider[] {
  return [TranslateService];
}

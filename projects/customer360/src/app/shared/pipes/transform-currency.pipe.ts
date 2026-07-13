import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'transformCurrency',
  pure: false,
})
export class TransformCurrencyPipe implements PipeTransform {
  private translateService = inject(TranslateService);
  transform(
    value: number | string,
    countryCurrency = 'KES',
    decimalPlaces: number = 2
  ): string {
    if (value == null) return '';

    const thousandsDelimiter =
      String(this.translateService.currentLang) === 'fr-CD' ? '.' : ',';
    const decimalPlace =
      String(this.translateService.currentLang) === 'fr-CD' ? ',' : '.';

    const currency = countryCurrency?.toUpperCase();
    const formattedValue = Number(value).toFixed(decimalPlaces);
    const parts = formattedValue.split('.');
    switch (currency) {
      case 'CDF':
        parts[0] = parts[0].replace(
          /\B(?=(\d{3})+(?!\d))/g,
          thousandsDelimiter
        );
        return parts.join(decimalPlace) + ' CDF';
      case 'USD':
        parts[0] = parts[0].replace(
          /\B(?=(\d{3})+(?!\d))/g,
          thousandsDelimiter
        );
        return parts.join(decimalPlace) + ' USD';
      default:
        parts[0] = parts[0].replace(
          /\B(?=(\d{3})+(?!\d))/g,
          thousandsDelimiter
        );
        return parts.join(decimalPlace) + ' ' + currency;
    }
  }
}

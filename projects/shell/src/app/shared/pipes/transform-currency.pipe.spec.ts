import { TransformCurrencyPipe } from './transform-currency.pipe';
import { TranslateService } from '@ngx-translate/core';

describe('TransformCurrencyPipe', () => {
  let pipe: TransformCurrencyPipe;
  let translateService: TranslateService;

  beforeEach(() => {
    translateService = new TranslateService();
    pipe = new TransformCurrencyPipe(translateService);
  });

  it('should format currency for KES', () => {
    expect(pipe.transform(1234567.89, 'KES')).toBe('1,234,567.89 KES');
  });

  it('should format currency for USD', () => {
    expect(pipe.transform(1234567.89, 'USD')).toBe('1,234,567.89 USD');
  });

  it('should format currency for CDF with French localization', () => {
    translateService.use('fr-CD');
    pipe = new TransformCurrencyPipe(translateService);
    expect(pipe.transform(1234567.89, 'CDF')).toBe('1.234.567,89 CDF');
  });

  it('should format currency for other currencies', () => {
    expect(pipe.transform(1234567.89, 'EUR')).toBe('1,234,567.89 EUR');
  });

  it('should handle string input and format it correctly', () => {
    expect(pipe.transform('1234567.89', 'USD')).toBe('1,234,567.89 USD');
  });

  it('should format with different decimal places', () => {
    expect(pipe.transform(1234.5678, 'USD', 3)).toBe('1,234.568 USD');
  });
});

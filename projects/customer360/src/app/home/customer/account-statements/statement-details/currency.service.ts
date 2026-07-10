import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor() { }

  /**
   * TODO: This should be replaced with a real API call to fetch daily treasury rates.
   * The service should fetch all rates against a base currency (e.g., RWF) and return them as a map.
   *
   * @returns An Observable of a currency-to-rate map.
   */
  getRwfConversionRates(): Observable<{ [key: string]: number }> {
    const rates = {
      'USD': 0.00077, // Example rate: 1 RWF = 0.00077 USD (approx. 1300 RWF to 1 USD)
      'EUR': 0.00071, // Example rate: 1 RWF = 0.00071 EUR
      'GBP': 0.00061, // Example rate: 1 RWF = 0.00061 GBP
    };
    return of(rates);
  }

  getKesConversionRates(): Observable<{ [key: string]: number }> {
    const rates = {
      'USD': 0.0078, // Example rate: 1 KES = 0.0078 USD
      'EUR': 0.0072, // Example rate: 1 KES = 0.0072 EUR
      'GBP': 0.0061, // Example rate: 1 KES = 0.0061 GBP
    };
    return of(rates);
  }

  getUgxConversionRates(): Observable<{ [key: string]: number }> {
    const rates = {
      'USD': 0.00027, // Example rate: 1 UGX = 0.00027 USD
      'EUR': 0.00025,
      'GBP': 0.00021,
    };
    return of(rates);
  }

  getSspConversionRates(): Observable<{ [key: string]: number }> {
    const rates = {
      'USD': 0.00065, // Example rate: 1 SSP = 0.00065 USD
    };
    return of(rates);
  }

  /**
   * Converts an amount from a local currency to a target foreign currency.
   * @param amountInLocalCurrency The amount in the local currency (e.g., RWF, KES).
   * @param targetCurrency The target currency code (e.g., 'USD').
   * @param rates The conversion rate map for the local currency.
   * @returns The converted amount or null if no rate is available.
   */
  convert(amountInLocalCurrency: number, targetCurrency: string, rates: { [key: string]: number }): number | null {
    const rate = rates[targetCurrency];
    if (rate === undefined) {
      return null; // No conversion rate available
    }
    return +(amountInLocalCurrency * rate).toFixed(2);
  }

  convertFromRwf(amountInRwf: number, targetCurrency: string, rates: { [key: string]: number }): number | null {
    const rate = rates[targetCurrency];
    if (rate === undefined) {
      return null; // No conversion rate available
    }
    return +(amountInRwf * rate).toFixed(2);
  }
}
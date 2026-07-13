import { ISubsidiary } from '@app/shared/services/session/session.service';
import { CurrencyService } from './currency.service';


export interface ChargeCalculationContext {
  subsidiary?: ISubsidiary;
  currency: string;
  scheme: string;
  getUgUsage: (accountNumber: string, quarterKey: string) => number;
  delivery: 'PrintStatement' | 'CertifyPrintStatement' | 'EmailStatement';
  baseCharge: number; // Base charge per page for countries without special rules
  getRwUsage: (accountNumber: string, yearKey: string) => number;
  getUgQuarterKey: (date?: string) => string;
  getRwYearKey: (date?: string) => string;
  accountNumber: string;
  toDate?: string;
  currencyService: CurrencyService;
  rwfConversionRates: { [key: string]: number };
  kesConversionRates: { [key: string]: number };
  ugxConversionRates: { [key: string]: number };
  sspConversionRates: { [key: string]: number };
}

export interface ChargeDetails {
  perPage: number;
  flatFee: number; // For fixed fees like certification in Kenya
  vatRate: number; // Percentage, e.g., 18 for 18%
  message: string;
}

function getRwandaChargeDetails(ctx: ChargeCalculationContext): ChargeDetails {
  const { currency, getRwUsage, getRwYearKey, accountNumber, toDate, currencyService, rwfConversionRates: rates } = ctx;
  const yearKey = getRwYearKey(toDate);
  const usageCount = getRwUsage(accountNumber, yearKey);
  const perPageRwf = 1000; // The base tariff in RWF
  const isFree = usageCount === 0;

  let perPage: number;
  let chargeText: string;
  const convertedAmount = currencyService.convert(perPageRwf, currency, rates);

  if (convertedAmount !== null) { // It's a foreign currency with a known rate
    perPage = isFree ? 0 : convertedAmount;
    chargeText = `${currency} ${convertedAmount}`;
  } else {
    perPage = isFree ? 0 : perPageRwf; // Default to RWF if currency is not in the conversion map
    chargeText = `RWF ${perPageRwf}`;
  }

  const message = isFree
    ? `The first statement this calendar year is free. Subsequent statements will be charged at ${chargeText} per page (VAT 18% applies).`
    : `A charge of ${currency} ${perPage} per page will be debited from your account. VAT (18%) applies and will be incorporated into the consolidated statement printing charges.`;

  return { perPage, vatRate: 18, message, flatFee: 0 };
}

function getUgandaChargeDetails(ctx: ChargeCalculationContext): ChargeDetails {
  const { currency, scheme, getUgUsage, getUgQuarterKey, accountNumber, toDate, currencyService, ugxConversionRates: rates } = ctx;
  const isSpecialScheme = ['CA232', 'CA214'].includes(scheme);
  const quarterKey = getUgQuarterKey(toDate);
  const usageCount = getUgUsage(accountNumber, quarterKey);
  const isFree = isSpecialScheme && usageCount === 0;

  const perPageUgx = 5000;

  let perPage: number;
  let chargeText: string;
  const convertedAmount = currencyService.convert(perPageUgx, currency, rates);

  if (convertedAmount !== null) {
    perPage = isFree ? 0 : convertedAmount;
    chargeText = `${currency} ${convertedAmount}`;
  } else {
    perPage = isFree ? 0 : perPageUgx;
    chargeText = `UGX ${perPageUgx}`;
  }

  const message = isFree
    ? `The first statement this quarter is free. Subsequent statements will be charged at ${chargeText} per page.`
    : `A charge of ${chargeText} per page will be debited from your account.`;

  return { perPage, vatRate: 0, message, flatFee: 0 }; // No VAT for UG
}

function getSouthSudanChargeDetails(ctx: ChargeCalculationContext): ChargeDetails {
  const { currency, currencyService, sspConversionRates: rates } = ctx;
  const perPageSsp = 1180;
  const convertedAmount = currencyService.convert(perPageSsp, currency, rates);

  const perPage = convertedAmount ?? perPageSsp;
  const chargeText = convertedAmount !== null ? `${currency} ${perPage}` : `SSP ${perPage}`;

  const message = `A charge of ${chargeText} per page will be debited from your account.`;
  return { perPage, vatRate: 0, message, flatFee: 0 };
}

function getKenyaChargeDetails(ctx: ChargeCalculationContext): ChargeDetails {
  const { currency, delivery, currencyService, kesConversionRates: rates } = ctx;
  const printFeeKes = 180;
  const certifyFeeKes = 1000;

  const convertedPrintFee = currencyService.convert(printFeeKes, currency, rates);
  const convertedCertifyFee = currencyService.convert(certifyFeeKes, currency, rates);

  const perPage = convertedPrintFee ?? printFeeKes;
  const flatFee = convertedCertifyFee ?? certifyFeeKes;

  if (delivery === 'CertifyPrintStatement') {
    const printText = convertedPrintFee !== null ? `${currency} ${perPage}` : `KES ${printFeeKes}`;
    const certifyText = convertedCertifyFee !== null ? `${currency} ${flatFee}` : `KES ${certifyFeeKes}`;
    const message = `Your account will be charged ${printText} per page for printing and ${certifyText} for certifying the statement.`;
    // In this case, the logic in the component will calculate total as (perPage * N) + flatFee
    return { perPage, flatFee, vatRate: 0, message };
  }

  // Default to PrintStatement or Email (where charge is 0)
  const chargeText = convertedPrintFee !== null ? `${currency} ${perPage}` : `KES ${printFeeKes}`;
  const message = `A charge of ${chargeText} per page will be debited from your account.`;
  return { perPage, flatFee: 0, vatRate: 0, message };
}

function getDefaultChargeDetails(ctx: ChargeCalculationContext): ChargeDetails {
  const { currency } = ctx;
  const message = `A charge of ${currency} ${ctx.baseCharge} per page will be debited from your account.`;
  return { perPage: ctx.baseCharge, vatRate: 0, message, flatFee: 0 };
}

export function getStatementChargeDetails(ctx: ChargeCalculationContext): ChargeDetails {
  const countryCode = ctx.subsidiary?.countryCode;

  switch (countryCode) {
    case 'KE':
      return getKenyaChargeDetails(ctx);
    case 'RW':
      return getRwandaChargeDetails(ctx);
    case 'UG':
      return getUgandaChargeDetails(ctx);
    case 'SS':
      return getSouthSudanChargeDetails(ctx);
    default:
      // Fallback for other countries or when subsidiary info is not available
      if (ctx.currency === 'UGX') return getUgandaChargeDetails(ctx);
      if (ctx.currency === 'RWF' || ctx.currency === 'FRW') return getRwandaChargeDetails(ctx);
      if (ctx.currency === 'SSP') return getSouthSudanChargeDetails(ctx);
      return getDefaultChargeDetails(ctx);
  }
}
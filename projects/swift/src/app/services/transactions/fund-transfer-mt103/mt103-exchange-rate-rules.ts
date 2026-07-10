export type Mt103ExchangeRateDirection = 'BUY' | 'SELL' | 'UNKNOWN';

export type Mt103StandardExchangeRateInput = {
  rateCode: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  rate: number;
};

export type Mt103SpecialExchangeRateInput = {
  rateCode: string;
  remittanceCurrency: string;
  convertedCurrency: string;
  remittanceAmount: number;
  dealRate: number;
};

export function getMt103ExchangeRateDirection(rateCode: string): Mt103ExchangeRateDirection {
  if (rateCode.endsWith('S')) {
    return 'SELL';
  }

  if (rateCode.endsWith('B')) {
    return 'BUY';
  }

  return 'UNKNOWN';
}

function shouldUseMt103JpyHundredthRule(fromCurrency: string, toCurrency: string): boolean {
  return fromCurrency === 'KES' && toCurrency === 'JPY';
}

export function calculateMt103ConvertedAmount(input: Mt103StandardExchangeRateInput): string | undefined {
  const direction = getMt103ExchangeRateDirection(input.rateCode);
  const useJpyHundredth = shouldUseMt103JpyHundredthRule(input.fromCurrency, input.toCurrency);

  if (direction === 'SELL') {
    const amount = useJpyHundredth ? (input.fromAmount * input.rate) / 100 : input.fromAmount * input.rate;
    return amount.toFixed(2);
  }

  if (direction === 'BUY') {
    const amount = useJpyHundredth ? input.fromAmount / input.rate / 100 : input.fromAmount / input.rate;
    return amount.toFixed(2);
  }

  return undefined;
}

export function calculateMt103SpecialConvertedAmount(input: Mt103SpecialExchangeRateInput): string | undefined {
  const direction = getMt103ExchangeRateDirection(input.rateCode);
  const useJpyHundredth = shouldUseMt103JpyHundredthRule(input.convertedCurrency, input.remittanceCurrency);

  if (direction === 'SELL') {
    const amount = useJpyHundredth
      ? (input.remittanceAmount * input.dealRate) / 100
      : input.remittanceAmount * input.dealRate;
    return amount.toFixed(2);
  }

  if (direction === 'BUY') {
    const amount = useJpyHundredth
      ? input.remittanceAmount / input.dealRate / 100
      : input.remittanceAmount / input.dealRate;
    return amount.toFixed(2);
  }

  return undefined;
}

export function buildMt103SameCurrencyExchangeDetails(amount: number, accountCurrency: string) {
  const formattedAmount = amount.toFixed(2);

  return {
    TransactionDetails: {
      RemittanceAmount: formattedAmount,
    },
    ExchangeDetails: {
      RateCode: 'TTS',
      ExchangeRate: '1',
      BaseExchangeRate: '1',
      ConvertedCurrency: accountCurrency,
      ConvertedAmount: formattedAmount,
    },
  };
}

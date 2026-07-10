type RemittanceCurrency = {
  countryCode?: string;
  currencyCode?: string;
};

const DRC_COUNTRY_CODE = 'CD';
const CDF_CURRENCY_CODE = 'CDF';
const RTGS_TRANSACTION_TYPE = 'RTGS';
const SWIFT_TRANSACTION_TYPES = ['SWIFT', 'LOCALSWIFT', 'SWIFT LOCAL'];

export function getFilteredMt103Currencies(
  transactionType: string,
  userCountryCode: string,
  remittanceCurrencies: RemittanceCurrency[]
): Array<{ label: string; value: string }> {
  const includeOnlyDrcRtgsLocalCurrency =
    userCountryCode === DRC_COUNTRY_CODE && transactionType === RTGS_TRANSACTION_TYPE;
  const excludeDrcSwiftLocalCurrency =
    userCountryCode === DRC_COUNTRY_CODE && SWIFT_TRANSACTION_TYPES.includes(transactionType);

  const baseCurrencies =
    remittanceCurrencies?.filter(
      currency =>
        currency.countryCode === userCountryCode &&
        (!includeOnlyDrcRtgsLocalCurrency || currency.currencyCode === CDF_CURRENCY_CODE) &&
        !(excludeDrcSwiftLocalCurrency && currency.currencyCode === CDF_CURRENCY_CODE)
    ) || [];

  return baseCurrencies.map(currency => ({
    label: currency.currencyCode ?? '',
    value: currency.currencyCode ?? '',
  }));
}

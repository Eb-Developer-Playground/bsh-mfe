type CreditAccountNumberEntry = {
  countryCode: string;
  currency: string;
  productCode: string;
  receiverBic: string;
};

export function findEapsDomesticReceiverBic(args: {
  productCode: string;
  countryCode: string;
  remittanceCurrency: string;
  countryCodeFromBic: string;
  creditAccountNumbers: CreditAccountNumberEntry[];
}): string | null {
  const { productCode, countryCode, remittanceCurrency, countryCodeFromBic, creditAccountNumbers } = args;

  if (productCode !== 'EAPS' || countryCode !== remittanceCurrency?.slice(0, 2)) {
    return null;
  }

  const match = creditAccountNumbers.find(entry => {
    return (
      entry.countryCode === countryCode &&
      entry.currency === remittanceCurrency &&
      entry.productCode === productCode &&
      entry.receiverBic.slice(4, 6) === countryCodeFromBic
    );
  });

  return match?.receiverBic ?? null;
}

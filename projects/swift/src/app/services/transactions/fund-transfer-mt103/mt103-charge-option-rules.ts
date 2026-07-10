export function getDefaultChargeOptionByCountry(countryCode: string): string {
  return countryCode === 'KE' ? 'SHA' : 'OUR';
}

export function resolveChargeOption(currentChargeOption: string | null | undefined, countryCode: string): string {
  return currentChargeOption || getDefaultChargeOptionByCountry(countryCode);
}

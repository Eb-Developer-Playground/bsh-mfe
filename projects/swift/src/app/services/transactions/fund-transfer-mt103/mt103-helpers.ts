export function mergeStringWithUnderscores(input: string): string {
  return input.replace(/\s+/g, '_');
}

export function isPurposeCodeRequired(countryCode: string, subsidiariesWithPurposeCode: string[]): boolean {
  return subsidiariesWithPurposeCode.includes(countryCode);
}

export function isCountrySpecificRequired(userCountryCode: string, targetCountry: string | string[]): boolean {
  return Array.isArray(targetCountry) ? targetCountry.includes(userCountryCode) : userCountryCode === targetCountry;
}

export function getLicenseNumber1MaxLength(countryCode: string, transactionType: string): number {
  return 30;
}

export function getRemittanceInfo1MaxLength(transactionType: string, userCountryCode: string): number {
  switch (transactionType) {
    case 'RTGS':
      return userCountryCode === 'KE' ? 25 : 30;
    case 'SWIFT':
      return userCountryCode === 'KE' ? 25 : 25;
    default:
      return 25;
  }
}

export function isLicenseRelatedError(errorMessage: string): boolean {
  const licenseKeywords = [
    'license document is required for this transaction',
    'license',
    'licence document',
    'licence',
  ];
  const lowerCaseMessage = errorMessage.toLowerCase();
  return licenseKeywords.some(keyword => lowerCaseMessage.includes(keyword));
}

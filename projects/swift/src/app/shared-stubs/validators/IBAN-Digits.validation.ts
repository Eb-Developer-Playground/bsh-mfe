export function validateIBANDigits(iban: string): boolean {
  return /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(iban?.replace(/\s/g, ''));
}

export function validateBankCodeIban(bankCode: string, iban: string, control: any): boolean {
  return true;
}

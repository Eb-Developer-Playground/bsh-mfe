// Stub for @shared/validators — Phase 2 will replace with real implementation
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function instrumentNumberAsyncValidator(
  transService: any,
  toast: any,
  getInstrumentType: () => any,
  getInstrumentDate: () => any,
  getAccountNumber: () => any,
  getBankId: () => any
): (control: AbstractControl) => Promise<ValidationErrors | null> {
  return (control: AbstractControl) => Promise.resolve(null);
}

export function IBANDigitsValidator(length: number) {
  return (control: AbstractControl): ValidationErrors | null => null;
}

export function validateBankCodeIban(bankCode: string, iban: string, control: any): void {
  return;
}

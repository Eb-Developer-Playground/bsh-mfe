import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Perform several sanity checks on phone numbers. */
export const PhoneNumbersValidator: ValidatorFn = (
  formArray: AbstractControl
): ValidationErrors | null => {
  const data = formArray.getRawValue();
  const preferredCount = data.filter((p: any) => p.isPreferred === true).length;
  if (preferredCount === 0) return { missingPreferred: true };
  if (preferredCount > 1) return { moreThanOnePreferred: true };

  const numbers = data
    .filter((p: any) => p.countryCode && p.number)
    .map((ph: any) => `${ph.countryCode}${ph.cityCode || ''}${ph.number}`);
  if (numbers.length > 0 && numbers.length !== [...new Set(numbers)].length)
    return { hasRepeatedPhones: true };
  return null;
};

/** Perform several sanity checks on email addresses. */
export const EmailsValidator: ValidatorFn = (
  formArray: AbstractControl
): ValidationErrors | null => {
  const data = formArray.getRawValue();
  const emails = data
    .filter((e: any) => e.emailAddress)
    .map((em: any) => em.emailAddress);
  const preferredCount = data.filter((p: any) => p.isPreferred === true).length;
  if (preferredCount === 0 && emails.length > 0)
    return { missingPreferred: true };
  if (preferredCount > 1) return { moreThanOnePreferred: true };
  const hasRequiredEmailType = data.some(
    (em: any) => em.emailType === 'COMMEML'
  );
  if (
    !hasRequiredEmailType &&
    data.filter((em: any) => em.emailAddress).length > 0
  )
    return { missingRequiredEmailType: true };
  if (emails.length > 0 && emails.length !== [...new Set(emails)].length)
    return { hasRepeatedEmails: true };
  return null;
};

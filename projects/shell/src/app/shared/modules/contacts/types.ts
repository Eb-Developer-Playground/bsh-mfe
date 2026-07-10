/**
 * Email, Phone number OTP ui view mode;
 * ALWAYS - OTP UI always shows up.
 * ONCHANGE - UI shows only when there is change i.e. existing contact (field state) is changed or new contact is added.
 * NEVER - OTP UI won't show. (default)
 */
export enum OTPInputViewMode {
  ALWAYS = 'ALWAYS',
  ONCHANGE = 'ONCHANGE',
  NEVER = 'NEVER',
}

/**
 * Mode of how dedupe of contacts should work
 * ALWAYS - Run dedupe operation always and display matching profiles.
 * PREVENT_MATCHES - Run dedupe operation always and require uniqueness of the contact.
 * NEVER - Never perform dedupe (default)
 */
export enum DedupeOperationMode {
  ALWAYS = 'ALWAYS',
  PREVENT_MATCHES = 'PREVENT_MATCHES',
  NEVER = 'NEVER',
}

/**
 * Mode of OTP verification
 * ALWAYS - Require OTP verified all the time
 * ON_DEDUPE_MATCH - Require OTP verified when dedupe matches
 * ON_STATE_CHANGE - Require OTP verified when form state matches
 * NEVER - Don't verify
 */
export enum OTPVerificationMode {
  ALWAYS = 'ALWAYS',
  ON_DEDUPE_MATCH = 'ON_DEDUPE_MATCH',
  ON_STATE_CHANGE = 'ON_STATE_CHANGE',
  NEVER = 'NEVER',
}

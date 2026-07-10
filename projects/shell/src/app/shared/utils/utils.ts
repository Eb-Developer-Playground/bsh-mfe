import CONST from './constants';
import { MessageBoxType, ToastService } from '@shared/modules/toast';
import { CustomerProfileData } from '@app/home/customer/channels/channels.model';
import { TranslateService } from '@ngx-translate/core';

const {
  TICKET_STATUS,
  LANGUAGES,
  STANDING_ORDER_TYPES,
  STANDING_ORDER_EXECUTION_TIMES,
  STANDING_ORDER_HOLIDAY_PAYMENT_HANDLING,
  STANDING_ORDER_FLOW_NAMES,
} = CONST;

export function queryParams(url: string, params: Record<string, any>): string {
  const parameters = Object.entries(params)
    .filter(([_, value]) => Boolean(value))
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, any>
    );

  if (typeof url === 'string' && url.trim() && typeof parameters === 'object') {
    if (Object.keys(parameters).length === 0) {
      return url;
    }

    const query = Object.keys(parameters)
      .map(key => `${key}=${parameters[key]}`)
      .join('&');

    return `${url}?${query}`;
  }

  throw new Error(
    `Trying to call "queryParams" with invalid params: (${url}, ${parameters})`
  );
}

export function getTicketStatusLabel(status: string): string {
  let statusLabel;

  switch (status) {
    case TICKET_STATUS.SUBMITTED_TO_COMPLIANCE:
      statusLabel = 'Submitted to Compliance';
      break;
    case TICKET_STATUS.SUBMITTED_TO_CHECKER:
      statusLabel = 'Submitted to Checker';
      break;
    case TICKET_STATUS.SUBMITTED_TO_OPERATIONS_MANAGER:
      statusLabel = 'Submitted to Operations Manager';
      break;
    case TICKET_STATUS.SUBMITTED_TO_GPC:
      statusLabel = 'Submitted to Gpc';
      break;
    case TICKET_STATUS.SUBMITTED_TO_BRANCH:
      statusLabel = 'Submitted to Branch';
      break;
    case TICKET_STATUS.SUBMITTED_TO_LEGAL:
      statusLabel = 'Submitted to Legal';
      break;
    case TICKET_STATUS.RETURNED:
      statusLabel = 'Returned';
      break;
    case TICKET_STATUS.PENDING:
      statusLabel = 'Pending';
      break;
    case TICKET_STATUS.NEW:
      statusLabel = 'New';
      break;
    case TICKET_STATUS.SUBMITTED_TO_BIO_CHECKER:
      statusLabel = 'Submitted to Bio Checker';
      break;
    case TICKET_STATUS.SUBMITTED_TO_ID_CHECKER:
      statusLabel = 'Submitted to Id Checker';
      break;
    default:
      statusLabel = status;
      break;
  }

  return statusLabel;
}

export function getStandingOrderTypeLabel(type: string): string {
  let label;

  switch (type) {
    case STANDING_ORDER_TYPES.WITHIN_EQUITY:
      label = 'Standing order within Equity';
      break;
    case STANDING_ORDER_TYPES.OTHER_LOCAL_BANKS:
      label = 'Standing order to another local bank';
      break;
    case STANDING_ORDER_TYPES.OTHER_INTERNATIONAL_BANK:
      label = 'Standing order to another international bank';
      break;
    default:
      label = type;
      break;
  }

  return label;
}

export function getStandingOrderActionFlow(type: string): string {
  let actionFlow;

  switch (type) {
    case STANDING_ORDER_FLOW_NAMES.CREATE:
      actionFlow = 'StandingOrderCreateFlowV2';
      break;
    case STANDING_ORDER_FLOW_NAMES.UPDATE:
      actionFlow = 'StandingOrderUpdateFlowV2';
      break;
    case STANDING_ORDER_FLOW_NAMES.DELETE:
      actionFlow = 'StandingOrderDeleteFlowV2';
      break;
    default:
      actionFlow = type;
      break;
  }

  return actionFlow;
}

export function getHolidayPaymentHandlingLabel(type: string): string {
  let label;

  switch (type) {
    case STANDING_ORDER_HOLIDAY_PAYMENT_HANDLING.NEXT_BUSINESS_DAY:
      label = 'Next business day';
      break;
    case STANDING_ORDER_HOLIDAY_PAYMENT_HANDLING.PREVIOUS_BUSINESS_DAY:
      label = 'Previous business day';
      break;
    case STANDING_ORDER_HOLIDAY_PAYMENT_HANDLING.SKIP_PAYMENT:
      label = 'Skip payment';
      break;
    default:
      label = type;
      break;
  }

  return label;
}

export function getExecutionTimeTypeLabel(type: string): string {
  let label;

  switch (type) {
    case STANDING_ORDER_EXECUTION_TIMES.BEFORE_DAY_CHANGE:
      label = 'Before change of date';
      break;
    case STANDING_ORDER_EXECUTION_TIMES.AFTER_DAY_CHANGE:
      label = 'After change of date';
      break;
    default:
      label = type;
      break;
  }

  return label;
}

export function getLanguageLabel(language: string): string {
  let label;

  switch (language) {
    case LANGUAGES.EN:
      label = 'English';
      break;
    case LANGUAGES.FR:
      label = 'French';
      break;
    case LANGUAGES.FR_CD:
      label = 'French DRC';
      break;
    default:
      label = language;
      break;
  }

  return label;
}

export function capitalizedString(_string: string) {
  const splitArr = _string.split(' ');
  const capitalizedArr = splitArr.map(
    (word: string) => word[0].toUpperCase() + word.substring(1).toLowerCase()
  );
  return capitalizedArr.join(' ');
}

/**
 * Groups an array of customer entries by their CIF number.
 * @param entries Array of customer records.
 */
export function groupEntriesByCif(entries: any[]): Record<string, any[]> {
  return entries.reduce(
    (acc, entry) => {
      const { cifNumber } = entry;
      if (cifNumber) {
        if (!acc[cifNumber]) {
          acc[cifNumber] = [];
        }
        acc[cifNumber].push(entry);
      }
      return acc;
    },
    {} as Record<string, any[]>
  );
}

/**
 * Combines multiple entries for the same CIF number into a single consolidated entry,
 * aggregating all relevant flags and data sets.
 * @param entries Array of entries with the same CIF number.
 */
export function combineCustomerEntries(entries: any[]): any {
  // Start with a shallow copy of the first entry
  const baseEntry = { ...entries[0] };

  // Combine flags: if any entry has "1" for a given flag, that flag should be "1" in the final result
  baseEntry.documentNumberFlag = entries.some(e => e.documentNumberFlag === '1')
    ? '1'
    : null;
  baseEntry.emailAddressFlag = entries.some(e => e.emailAddressFlag === '1')
    ? '1'
    : null;
  baseEntry.dateOfBirthFlag = entries.some(e => e.dateOfBirthFlag === '1')
    ? '1'
    : null;
  baseEntry.phoneNumberFlag = entries.some(e => e.phoneNumberFlag === '1')
    ? '1'
    : null;

  // For associated properties, pick the first non-empty value or retain original if needed
  baseEntry.documentNumber = entries.find(e => e.documentNumber)
    ? entries.find(e => e.documentNumber)!.documentNumber
    : baseEntry.documentNumber;
  baseEntry.phoneNumber = entries.find(
    e => e.phoneNumber && e.phoneNumber.trim()
  )
    ? entries.find(e => e.phoneNumber && e.phoneNumber.trim())!.phoneNumber
    : baseEntry.phoneNumber;
  baseEntry.emailAddress = entries.find(
    e => e.emailAddress && e.emailAddress.trim()
  )
    ? entries.find(e => e.emailAddress && e.emailAddress.trim())!.emailAddress
    : baseEntry.emailAddress;
  baseEntry.dateOfBirth = entries.find(e => e.dateOfBirth)
    ? entries.find(e => e.dateOfBirth)!.dateOfBirth
    : baseEntry.dateOfBirth;

  return baseEntry;
}

/** Safe JSON parser – never throws, never returns null/undefined for arrays/objects */
export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

// Pascal case to camelcase converter
export function lowercaseKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => lowercaseKeys(item));
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const newKey = key.charAt(0).toLowerCase() + key.slice(1);
      acc[newKey] = lowercaseKeys(obj[key]);
      return acc;
    }, {});
  }

  return obj; // primitives unchanged
}

export function isValidChannelsDialogData(
    data: CustomerProfileData,
    toast: ToastService,
    translate: TranslateService
): boolean {
    const missingField = !data.customerId
        ? translate.instant('CUSTOMER.CHANNELS.CUSTOMER-ID')
        : !data.phoneNumber
            ? translate.instant('CUSTOMER.CHANNELS.PHONE-NUMBER')
            : !data.channel
                ? translate.instant('CUSTOMER.CHANNELS.CHANNEL-NAME')
                : !data.subChannel
                    ? translate.instant('CUSTOMER.CHANNELS.SUB-CHANNEL')
                    : !data.actionName
                        ? translate.instant('CUSTOMER.CHANNELS.CARD-ACTION')
                        : null;

    if (missingField) {
        toast.show(
            `${translate.instant('CUSTOMER.CHANNELS.ACTIONS-ERROR')} ${missingField}`,
            '',
            MessageBoxType.INFO,
            5000,
            undefined,
            undefined,
            false
        );
        return false;
    }
    return true;
}

interface PhoneNumber {
    preferred?: boolean;
    countryCode?: string;
    cityCode?: string;
    number?: string;
}

export const buildPhoneNumber = (phone: PhoneNumber): string =>
    [phone.countryCode, phone.cityCode, phone.number]
        .filter(Boolean)
        .join('');

export const getPreferredPhoneNumber = (
    phoneNumbers: PhoneNumber[],
    fallbacks: (string | undefined)[] = []
): string => {
    const preferred = phoneNumbers.find((p) => !!p.preferred);

    if (preferred) return buildPhoneNumber(preferred);

    return fallbacks.find(Boolean) ?? '';
};

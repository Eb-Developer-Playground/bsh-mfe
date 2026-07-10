export default {
  COUNTRY_CODE: {
    KE: 'KE', // KENYA
    UG: 'UG', // UGANDA
    TZ: 'TZ', // TANZANIA
    SS: 'SS', // SOUTH SUDAN
    CD: 'CD', // DRC
    RW: 'RW', // RWANDA
  },
  STANDING_ORDER_TYPES: {
    WITHIN_EQUITY: 'WithinEquity',
    OTHER_LOCAL_BANKS: 'OtherLocalBanks',
    OTHER_INTERNATIONAL_BANK: 'OtherInternationalBank',
  },
  STANDING_ORDER_EXECUTION_TIMES: {
    BEFORE_DAY_CHANGE: 'A',
    AFTER_DAY_CHANGE: 'B',
  },
  STANDING_ORDER_FREQUENCIES: {
    DAILY: 'D',
    WEEKLY: 'W',
    FORTNIGHTLY: 'F',
    MONTHLY: 'M',
    QUARTERLY: 'Q',
    BI_ANNUALLY: 'H',
    YEARLY: 'Y',
  },
  STANDING_ORDER_FREQUENCIES_LABELS: {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    FORTNIGHTLY: 'Every 2 weeks',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    BI_ANNUALLY: 'Bi-annually',
    YEARLY: 'Yearly',
  },
  STANDING_ORDER_INITIATED_BY: {
    CUSTOMER: 'C',
    BANK: 'B',
  },
  STANDING_ORDER_FLOW_NAMES: {
    CREATE: 'Create',
    UPDATE: 'Update',
    DELETE: 'Delete',
  },
  STANDING_ORDER_HOLIDAY_PAYMENT_HANDLING: {
    NEXT_BUSINESS_DAY: 'N',
    PREVIOUS_BUSINESS_DAY: 'P',
    SKIP_PAYMENT: 'S',
  },
  DEDUPE_BIRTH_DATE_FORMAT: 'dd-MMM-yyyy',
  TICKET_STATUS: {
    SUBMITTED_TO_COMPLIANCE: 'SubmittedToCompliance',
    SUBMITTED_TO_CHECKER: 'SubmittedToChecker',
    SUBMITTED_TO_OPERATIONS_MANAGER: 'SubmittedToOperationsManager',
    SUBMITTED_TO_GPC: 'SubmittedToGpc',
    SUBMITTED_TO_BRANCH: 'SubmittedToBranch',
    SUBMITTED_TO_LEGAL: 'SubmittedToLegal',
    RETURNED: 'Returned',
    PENDING: 'Pending',
    PENDING_UPLOAD: 'Pending Upload',
    NEW: 'New',
    SUBMITTED_TO_BIO_CHECKER: 'SubmittedToBioChecker',
    SUBMITTED_TO_ID_CHECKER: 'SubmittedToIdChecker',
    SUBMITTED_TO_CHECKER_LEVEL_1: 'SubmittedToCheckerLevel1',
  },
  LANGUAGES: {
    EN: 'en-GB',
    FR: 'fr',
    FR_CD: 'fr-CD',
    FR_RW: 'fr-RW',
    SW_KE: 'sw-KE',
    SW_TZ: 'sw-TZ',
  },
};

export const CHANNEL_LIST: { channel: { channel: string; subChannel: string; level: number; isChannelActive?: boolean } }[] = [
  {
    channel: {
      channel: 'Web',
      subChannel: 'Web',
      level: -1,
    },
  },
  {
    channel: {
      channel: 'Mobile',
      subChannel: 'iOS',
      level: -1,
      isChannelActive: false,
    },
  },
  {
    channel: {
      channel: 'Mobile',
      subChannel: 'Android',
      level: -1,
      isChannelActive: false,
    },
  },
  {
    channel: {
      channel: 'USSD',
      subChannel: 'USSD',
      level: -1,
    },
  },
  {
    channel: {
      channel: 'Chatbot',
      subChannel: 'Chatbot',
      level: -1,
    },
  },
];

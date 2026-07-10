interface AccChannels {
  channel: {
    channel: string;
    subChannel: string;
    level: number;
    isChannelActive?: boolean;
  };
}

export default {
    COUNTRY_CODE: {
        KE: "KE", // KENYA
        UG: "UG", // UGANDA
        TZ: "TZ", // TANZANIA
        SS: "SS", // SOUTH SUDAN
        CD: "CD", // DRC
        RW: "RW" // RWANDA
    },
    DEDUPE_BIRTH_DATE_FORMAT: "dd-MMM-yyyy",
    TICKET_STATUS: {
        SUBMITTED_TO_COMPLIANCE: "SubmittedToCompliance",
        SUBMITTED_TO_CHECKER: "SubmittedToChecker",
        SUBMITTED_TO_OPERATIONS_MANAGER: "SubmittedToOperationsManager",
        SUBMITTED_TO_GPC: "SubmittedToGpc",
        SUBMITTED_TO_BRANCH: "SubmittedToBranch",
        SUBMITTED_TO_LEGAL: "SubmittedToLegal",
        RETURNED: "Returned",
        PENDING: "Pending",
        PENDING_UPLOAD: "Pending Upload",
        NEW: "New",
        SUBMITTED_TO_BIO_CHECKER: "SubmittedToBioChecker",
        SUBMITTED_TO_ID_CHECKER: "SubmittedToIdChecker"
    },
    LANGUAGES: {
        EN: "en-GB",
        FR: "fr",
        FR_CD: "fr-CD",
        FR_RW: "fr-RW",
        SW_KE: "sw-KE",
        SW_TZ: "sw-TZ"
    }
};

export const CHANNEL_LIST: AccChannels[] = [
    {
        "channel": {
            channel: "Web",
            subChannel: "Web",
            level: -1,
        },
    },
    {
        "channel":  {
            channel: "Mobile",
            subChannel: "iOS",
            level: -1,
            isChannelActive: false,
        },
    },
    {
      "channel": {
          channel: "Mobile",
          subChannel: "Android",
          level: -1,
          isChannelActive: false,
      },
    },
    {
        "channel": {
            channel: "USSD",
            subChannel: "USSD",
            level: -1,
        },
    },
    {
        "channel":  {
            channel: "Chatbot",
            subChannel: "Chatbot",
            level: -1,
        },
    }
];

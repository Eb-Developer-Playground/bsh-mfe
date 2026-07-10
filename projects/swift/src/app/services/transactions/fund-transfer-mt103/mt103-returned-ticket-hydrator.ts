type ReturnedTicketTaskData = {
  LicenseDetails?: {
    Number1?: string;
    Number2?: string;
    Number3?: string;
    PurposeCode?: string;
    Purpose?: string;
  };
  BeneficiaryBankDetails?: {
    PurposeCode?: string;
    Purpose?: string;
  };
  AccountDetails?: unknown;
  BeneficiaryDetails?: unknown;
  SenderToReceiverInformation?: unknown;
  ChargeDetails?: unknown;
  ExchangeDetails?: unknown;
  Additional?: unknown;
  TransactionDetails?: {
    RemittanceAmount?: unknown;
    RemittanceCurrency?: unknown;
    RemitterAddress1?: unknown;
    RemitterAddress2?: unknown;
  };
  RemitterAccountDetails?: {
    RequestingDepartment?: unknown;
    RequestingDepartmentCode?: unknown;
  };
};

export function mapReturnedTicketLicenseDetails(taskData: ReturnedTicketTaskData) {
  return {
    Number1: taskData?.LicenseDetails?.Number1,
    Number2: taskData?.LicenseDetails?.Number2,
    Number3: taskData?.LicenseDetails?.Number3,
    LicensePurposeCode: taskData?.LicenseDetails?.PurposeCode,
    LicensePurpose: taskData?.LicenseDetails?.Purpose,
  };
}

export function mapSavedTicketPatchValue(taskData: ReturnedTicketTaskData) {
  return {
    BeneficiaryDetails: taskData?.BeneficiaryDetails,
    BeneficiaryBankDetails: taskData?.BeneficiaryBankDetails,
    SenderToReceiverInformation: taskData?.SenderToReceiverInformation,
    ChargeDetails: taskData?.ChargeDetails,
    ExchangeDetails: taskData?.ExchangeDetails,
    Additional: taskData?.Additional,
    TransactionDetails: {
      RemittanceAmount: taskData?.TransactionDetails?.RemittanceAmount,
      RemittanceCurrency: taskData?.TransactionDetails?.RemittanceCurrency,
      RemitterAddress1: taskData?.TransactionDetails?.RemitterAddress1,
      RemitterAddress2: taskData?.TransactionDetails?.RemitterAddress2,
    },
    RemitterAccountDetails: {
      RequestingDepartment: taskData?.RemitterAccountDetails?.RequestingDepartment,
      RequestingDepartmentCode: taskData?.RemitterAccountDetails?.RequestingDepartmentCode,
    },
  };
}

export function getReturnedTicketPurposeValues(taskData: ReturnedTicketTaskData) {
  return {
    purposeCode: taskData?.BeneficiaryBankDetails?.PurposeCode,
    purpose: taskData?.BeneficiaryBankDetails?.Purpose,
  };
}

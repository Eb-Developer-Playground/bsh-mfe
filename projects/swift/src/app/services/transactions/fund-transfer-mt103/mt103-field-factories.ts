import { FIELD_TYPES } from '../../../shared-stubs/dynamic-form';
import { ACCOUNT_DETAILS_FIELDS, CHARGE_DETAILS_FIELDS } from './mt103-field-definitions';

type CustomerDetails = {
  firstName?: string;
  lastName?: string;
  bankID?: string;
  cif?: string;
  phoneNumber1?: string;
  email?: string;
  preferredAddress?: {
    address1?: string;
    address2?: string;
  };
  accounts?: Array<{
    accountName?: string;
    accountNumber?: string;
    accountCurrency?: string;
    availableBalance?: string | number;
    mandate?: string;
  }>;
};

type ChargeOption = {
  code: string;
};

type RemittanceCurrencyOption = {
  countryCode: string;
  currencyCode: string;
};

type TransactionTypeOption = {
  label: string;
  value: string;
};

type RoutingCodeOption = {
  code: string;
};

type BeneficiaryBankFieldArgs = {
  countryCode: string;
  transactionType: string;
  routingCodes: RoutingCodeOption[];
  field26TOptions: RoutingCodeOption[];
  purposeCodeRequired: boolean;
  countrySpecificForBankCode: boolean;
};

type LicenseCategoryOption = {
  text: string;
  value: string;
};

type DepartmentOption = {
  code: string;
  name: string;
};

export function createAccountFormFields(customerDetails: CustomerDetails, headOffice: boolean): any[] {
  return ACCOUNT_DETAILS_FIELDS.map(field => {
    switch (field.key) {
      case 'FirstName':
        return { ...field, value: customerDetails?.firstName };
      case 'LastName':
        return { ...field, value: customerDetails?.lastName };
      case 'FullName':
        return { ...field, value: customerDetails?.accounts?.[0]?.accountName };
      case 'IdNumber':
        return { ...field, value: customerDetails?.bankID };
      case 'Cif':
        return { ...field, value: customerDetails?.cif };
      case 'AccountNumber':
        return { ...field, value: customerDetails?.accounts?.[0]?.accountNumber };
      case 'AccountCurrency':
        return { ...field, value: customerDetails?.accounts?.[0]?.accountCurrency };
      case 'AccountBalance':
        return { ...field, value: customerDetails?.accounts?.[0]?.availableBalance };
      case 'MobileNumber':
        return { ...field, value: customerDetails?.phoneNumber1 };
      case 'EmailAddress':
        return { ...field, value: customerDetails?.email };
      case 'PostalAddress':
        return {
          ...field,
          value: `${customerDetails?.preferredAddress?.address1 ?? ''}${customerDetails?.preferredAddress?.address2 ?? ''}`,
        };
      case 'Mandate':
        return { ...field, value: customerDetails?.accounts?.[0]?.mandate };
      case 'IsGlAccount':
        return { ...field, field_type: FIELD_TYPES.HIDDEN, value: headOffice };
      default:
        return { ...field };
    }
  });
}

export function createBeneficiaryDetailsFields(countryCode: string): any[] {
  return [
    {
      id: 1,
      order: 1,
      key: 'AccountNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_ACCOUNT_NUMBER_IBAN',
      value: '',
      maximum: 40,
      required: true,
      autocomplete: 'off',
    },
    {
      id: 2,
      order: 2,
      key: 'Name1',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_NAME_1',
      value: '',
      maximum: 33,
      required: true,
      autocomplete: 'off',
    },
    {
      id: 3,
      order: 3,
      key: 'Name2',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_NAME_2',
      value: '',
      maximum: 33,
      autocomplete: 'off',
    },
    {
      id: 4,
      order: 4,
      key: 'Name3',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_NAME_3',
      value: '',
      maximum: 33,
      autocomplete: 'off',
    },
    {
      id: 5,
      order: 5,
      key: 'Name4',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_NAME_4',
      value: '',
      maximum: 33,
      autocomplete: 'off',
    },
    {
      id: 6,
      order: 6,
      key: 'Address1',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_PHYSICAL_ADDRESS_1',
      toast: 'FIELDS.BENEFICIARY_PHYSICAL_ADDRESS_1_2_TOAST',
      value: '',
      minimum: countryCode === 'CD' ? 10 : 1,
      maximum: 33,
      required: true,
      autocomplete: 'off',
    },
    {
      id: 7,
      order: 7,
      key: 'Address2',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_PHYSICAL_ADDRESS_2',
      toast: 'FIELDS.BENEFICIARY_PHYSICAL_ADDRESS_1_2_TOAST',
      value: '',
      maximum: 33,
      autocomplete: 'off',
    },
  ];
}

export function createChargeDetailsFields(countryCode: string, chargeOptions: ChargeOption[]): any[] {
  return CHARGE_DETAILS_FIELDS.map(field => {
    switch (field.key) {
      case 'ChargeOption':
        return {
          ...field,
          options: chargeOptions.map(option => {
            const isDisabled = countryCode === 'CD' && option.code !== 'OUR';
            return { value: option.code, label: option.code, disabled: isDisabled };
          }),
          value: countryCode === 'CD' ? 'OUR' : countryCode === 'KE' ? 'SHA' : '',
        };
      case 'Amount':
      case 'NormalCharge':
      case 'VatAmount':
      case 'RscAmount':
      case 'SumOfCharges':
        return {
          ...field,
          field_type: FIELD_TYPES.LINE_AMOUNT_FIELD,
          disabled: true,
          readonly: undefined,
        };
      case 'AmountCurrency':
        return {
          ...field,
          disabled: true,
          readonly: undefined,
        };
      default:
        return { ...field };
    }
  });
}

export function createTransactionDetailsFields(args: {
  transferType: string;
  transactionType: string;
  countryCode: string;
  userCountryCode: string;
  remittanceCurrencies: RemittanceCurrencyOption[];
  remittanceCurrencyOptions: any[];
}): any[] {
  const {
    transferType,
    transactionType,
    countryCode,
    userCountryCode,
    remittanceCurrencies,
    remittanceCurrencyOptions,
  } = args;

  const instrumentOptions: TransactionTypeOption[] =
    countryCode === 'CD'
      ? [
          { label: 'Select Instrument Type', value: '' },
          { label: 'Payment Order (OV)', value: 'OV' },
          { label: 'CHQ', value: 'CHQ' },
          { label: 'OPI', value: 'OPI' },
        ]
      : [
          { label: 'Select Instrument Type', value: '' },
          { label: 'DD', value: 'DD' },
          { label: 'CHQ', value: 'CHQ' },
          { label: 'OPI', value: 'OPI' },
        ];

  return [
    {
      id: 1,
      order: 1,
      key: 'TransferType',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.TRANSFER_TYPE',
      value: transferType,
      required: true,
      readonly: true,
    },
    {
      id: 2,
      order: 2,
      key: 'ProductCode',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.PRODUCT_CODE',
      value: transactionType,
      readonly: true,
    },
    {
      id: 3,
      order: 3,
      key: 'RelatedRefNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.RELATED_REFERENCE_NUMBER',
      value: '',
      readonly: true,
    },
    {
      id: 4,
      order: 4,
      key: 'DebitAccountNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.DEBIT_ACCOUNT_NUMBER',
      value: '',
      readonly: true,
    },
    {
      id: 6,
      order: 6,
      key: 'AccountCurrency',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.ACCOUNT_CURRENCY',
      options: remittanceCurrencies
        .filter(currency => currency.countryCode === userCountryCode)
        .map(currency => ({ label: currency.currencyCode, value: currency.currencyCode })),
      readonly: true,
      disabled: true,
    },
    {
      id: 7,
      order: 7,
      key: 'DebitAccountName',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.DEBIT_ACCOUNT_NAME',
      value: '',
      readonly: true,
    },
    {
      id: 8,
      order: 8,
      key: 'ChargeAccount',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.CHARGE_ACCOUNT_NUMBER',
      value: '',
      updateOn: 'blur',
    },
    {
      id: 9,
      order: 9,
      key: 'RemittanceCurrency',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.REMITTANCE_CURRENCY',
      options: remittanceCurrencyOptions,
      required: true,
    },
    {
      id: 10,
      order: 10,
      key: 'RemittanceAmount',
      field_type: FIELD_TYPES.LINE_AMOUNT_FIELD,
      label: 'FIELDS.REMITTANCE_AMOUNT',
      value: '',
      required: true,
      autocomplete: 'off',
      updateOn: 'blur',
    },
    {
      id: 11,
      order: 11,
      key: 'DebitValueDate',
      field_type: FIELD_TYPES.DATETIME,
      label: 'FIELDS.DEBIT_VALUE_DATE',
      value: new Date(),
      readonly: true,
      autocomplete: 'off',
    },
    {
      id: 12,
      order: 12,
      key: 'RemitterAddress1',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.REMITTERS_PHYSICAL_ADDRESS_1.LABEL',
      toast: 'FIELDS.REMITTERS_PHYSICAL_ADDRESS_1.TOAST',
      value: '',
      minimum: countryCode === 'CD' ? 10 : 1,
      maximum: 33,
      required: true,
      autocomplete: 'off',
    },
    {
      id: 13,
      order: 13,
      key: 'RemitterAddress2',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.REMITTER_ADDRESS_2.LABEL',
      toast: 'FIELDS.REMITTER_ADDRESS_2.TOAST',
      value: '',
      minimum: countryCode === 'CD' ? 10 : 1,
      maximum: 33,
      required: true,
      autocomplete: 'off',
    },
    {
      id: 14,
      order: 14,
      key: 'InstrumentType',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.INSTRUMENT_TYPE',
      options: instrumentOptions,
      value: countryCode === 'CD' ? 'OV' : '',
    },
    {
      id: 15,
      order: 15,
      key: 'InstrumentDate',
      field_type: FIELD_TYPES.DATETIME,
      label: 'FIELDS.INSTRUMENT_DATE',
      value: null,
      autocomplete: 'off',
      updateOn: 'blur',
    },
    {
      id: 16,
      order: 16,
      key: 'InstrumentNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.INSTRUMENT_NUMBER',
      value: '',
      autocomplete: 'off',
      updateOn: 'change',
      maximum: countryCode === 'CD' ? 10 : null,
    },
    {
      id: 17,
      order: 17,
      key: 'CreditAccountNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.CREDIT_ACCOUNT_NUMBER',
      value: '',
      readonly: true,
      required: true,
    },
    {
      id: 18,
      order: 18,
      key: 'CreditAccountName',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.CREDIT_ACCOUNT_NAME',
      value: '',
      readonly: true,
      required: true,
    },
    {
      id: 19,
      order: 19,
      key: 'ReceiverBIC',
      field_type: FIELD_TYPES.HIDDEN,
      label: 'FIELDS.RECEIVER_BIC',
      value: '',
      readonly: true,
    },
  ];
}

export function createBeneficiaryBankDetailsFields(args: BeneficiaryBankFieldArgs): any[] {
  const {
    countryCode,
    transactionType,
    routingCodes,
    field26TOptions,
    purposeCodeRequired,
    countrySpecificForBankCode,
  } = args;

  const isDrcRtgs = countryCode === 'CD' && transactionType === 'RTGS';
  const supportsDrcBankSelection =
    countrySpecificForBankCode &&
    (transactionType === 'RTGS' || transactionType === 'LOCALSWIFT' || transactionType === 'SWIFT LOCAL');

  return [
    {
      id: 1,
      order: 1,
      key: 'AccountWithInstitutionBic',
      field_type: FIELD_TYPES.BIC_AUTOCOMPLETE_FIELD,
      label: 'FIELDS.ACCOUNT_WITH_INSTITUTION_BIC',
      value: '',
      required: true,
      autocomplete: 'off',
      readonly: true,
    },
    {
      id: 2,
      order: 2,
      key: 'RoutingCode',
      field_type: isDrcRtgs ? FIELD_TYPES.HIDDEN : FIELD_TYPES.SELECT,
      label: 'FIELDS.ROUTING_CODE',
      options: routingCodes.map(code => ({ value: code.code, label: code.code })),
    },
    {
      id: 3,
      order: 3,
      key: 'RoutingCodeValue',
      field_type: isDrcRtgs ? FIELD_TYPES.HIDDEN : FIELD_TYPES.LINE,
      label: 'FIELDS.ROUTING_CODE_VALUE',
      value: '',
      autocomplete: 'off',
    },
    {
      id: 4,
      order: 4,
      key: 'CbkRemittances',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.FIELD_26T',
      options: field26TOptions.map(code => ({ value: code.code, label: code.code })),
      readonly: true,
    },
    {
      id: 5,
      order: 5,
      key: 'IntermediaryBankBic',
      field_type:
        transactionType === 'SWIFT LOCAL' || transactionType === 'LOCALSWIFT'
          ? FIELD_TYPES.LINE
          : FIELD_TYPES.BIC_AUTOCOMPLETE_FIELD,
      label: 'FIELDS.INTERMEDIARY_BANK_BIC',
      value: '',
      autocomplete: 'off',
      readonly: true,
    },
    {
      id: 6,
      order: 6,
      key: 'BeneficiaryCountryCode',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_COUNTRY_CODE',
      value: '',
      readonly: true,
    },
    {
      id: 7,
      order: 7,
      key: 'PurposeCode',
      field_type: purposeCodeRequired
        ? isDrcRtgs
          ? FIELD_TYPES.LINE
          : FIELD_TYPES.EQUITY_SEARCH_SELECT
        : FIELD_TYPES.HIDDEN,
      label: 'FIELDS.PURPOSE_CODE',
      value: isDrcRtgs ? '1103' : '',
      required: purposeCodeRequired,
      readonly: isDrcRtgs,
      controlType: 'equityMatSelectSearchInput',
    },
    {
      id: 8,
      order: 8,
      key: 'Purpose',
      field_type: FIELD_TYPES.HIDDEN,
      label: 'FIELDS.PURPOSE_CODE',
      value: isDrcRtgs ? 'TTC Number' : '',
      required: purposeCodeRequired,
      controlType: 'equityMatSelectSearchInput',
    },
    {
      id: 9,
      order: 9,
      key: 'BeneficiaryBankCode',
      field_type: supportsDrcBankSelection ? FIELD_TYPES.EQUITY_SEARCH_SELECT : FIELD_TYPES.HIDDEN,
      label: 'FIELDS.BENEFICIARY_BANK_CODE',
      value: '',
      required: supportsDrcBankSelection,
      controlType: 'equityMatSelectSearchInput',
    },
    {
      id: 10,
      order: 10,
      key: 'BeneficiaryBranchCode',
      field_type: supportsDrcBankSelection ? FIELD_TYPES.EQUITY_SEARCH_SELECT : FIELD_TYPES.HIDDEN,
      label: 'FIELDS.BENEFICIARY_BRANCH_CODE',
      value: '',
      required: supportsDrcBankSelection,
      controlType: 'equityMatSelectSearchInput',
    },
  ];
}

export function createLicenseDetailsFields(args: {
  transactionType: string;
  countryCode: string;
  licenseCategories: LicenseCategoryOption[];
  licenseNumber1MaxLength: number;
  countrySpecificRequired: boolean;
}): any[] {
  const { transactionType, countryCode, licenseCategories, licenseNumber1MaxLength, countrySpecificRequired } = args;

  return [
    {
      id: 1,
      order: 1,
      key: 'Number1',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.LICENSE_NUMBER_1',
      value:
        (transactionType === 'SWIFT LOCAL' || transactionType === 'LOCALSWIFT') && countryCode === 'CD'
          ? 'DEC-0000000-0000-MC'
          : '',
      required: true,
      readonly: (transactionType === 'SWIFT LOCAL' || transactionType === 'LOCALSWIFT') && countryCode === 'CD',
      maximum: licenseNumber1MaxLength,
    },
    {
      id: 2,
      order: 2,
      key: 'Number2',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.LICENSE_NUMBER_2',
      value: '',
      required: false,
    },
    {
      id: 3,
      order: 3,
      key: 'Number3',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.LICENSE_NUMBER_3',
      value: '',
      required: false,
    },
    {
      id: 4,
      order: 4,
      key: 'LicensePurposeCodeCategory',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.LICENSE_PURPOSE_CATEGORY',
      options: licenseCategories?.map(category => ({
        label: `${category.text} -${category.value}`,
        value: category.value,
      })),
      value: '',
      required: countryCode === 'CD',
    },
    {
      id: 5,
      order: 5,
      key: 'LicensePurposeCode',
      field_type: FIELD_TYPES.EQUITY_SEARCH_SELECT,
      label: 'FIELDS.LICENSE_PURPOSE_CODE',
      required: countrySpecificRequired,
    },
    {
      id: 6,
      order: 6,
      key: 'LicensePurpose',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.LICENSE_PURPOSE',
      value: '',
      required: true,
      readonly: true,
    },
  ];
}

export function createHeadOfficeRemitterFields(departments: DepartmentOption[], required: boolean): any[] {
  return [
    {
      id: 8,
      order: 8,
      key: 'RequestingDepartmentCode',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.REQUESTING_DEPARTMENT_CODE',
      options: departments.map(department => ({
        value: department.code,
        label: `${department.code} - ${department.name}`,
      })),
      required,
    },
    {
      id: 9,
      order: 9,
      key: 'RequestingDepartment',
      field_type: FIELD_TYPES.HIDDEN,
      label: 'FIELDS.REQUESTING_DEPARTMENT',
      value: '',
      readonly: true,
    },
  ];
}

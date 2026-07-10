type Mt103BeneficiaryBankDetails = Record<string, unknown> & {
  PurposeCode?: string;
  Purpose?: string;
};

type Mt103BeneficiaryDetails = Record<string, unknown>;

type Mt103TransactionDetails = Record<string, unknown> & {
  ProductCode?: string;
};

type Mt103LicenseDetails = Record<string, unknown> & {
  Number1?: string;
  Number2?: string;
  Number3?: string;
  LicensePurposeCode?: string;
  LicensePurpose?: string;
};

export type Mt103RestructuredFormData = Record<string, unknown> & {
  BeneficiaryBankDetails?: Mt103BeneficiaryBankDetails;
  BeneficiaryDetails?: Mt103BeneficiaryDetails;
  TransactionDetails?: Mt103TransactionDetails;
  LicenseDetails?: Mt103LicenseDetails | null;
};

export function restructureMt103FormData(
  formData: Mt103RestructuredFormData,
  countryCode: string,
  transactionType: string
): Mt103RestructuredFormData {
  const restructured: Mt103RestructuredFormData = JSON.parse(JSON.stringify(formData));

  if (restructured.BeneficiaryBankDetails) {
    const { PurposeCode, Purpose, ...bankDetailsWithoutPurpose } = restructured.BeneficiaryBankDetails;

    restructured.BeneficiaryBankDetails = bankDetailsWithoutPurpose;

    if (restructured.BeneficiaryDetails && (PurposeCode || Purpose)) {
      restructured.BeneficiaryDetails = {
        ...restructured.BeneficiaryDetails,
        ...(PurposeCode ? { PurposeCode } : {}),
        ...(Purpose ? { Purpose } : {}),
      };
    }
  }

  if (restructured.TransactionDetails?.ProductCode === 'LOCALSWIFT') {
    restructured.TransactionDetails.ProductCode = 'SWIFT LOCAL';
  }

  if (countryCode === 'CD' && restructured.LicenseDetails) {
    const licenseData = restructured.LicenseDetails;
    const transformedLicenseDetails = {
      Number1: licenseData.Number1,
      Number2: licenseData.Number2,
      Number3: licenseData.Number3,
      PurposeCode: licenseData.LicensePurposeCode,
      Purpose: licenseData.LicensePurpose,
    };

    restructured.LicenseDetails = transactionType === 'RTGS' ? null : transformedLicenseDetails;
  }

  return restructured;
}

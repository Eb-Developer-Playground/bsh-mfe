export interface Signatory {
  fullName: string;
  effectiveDate: string;
  customerImage: string;
  signature: string;
  firstName: string;
  middleName: string;
  surname: string;
  otherNames: string;
  idType: string;
  idNumber: string;
}
export interface SignatoryImages {
  acctIdField: string;
  customerNameField: string;
  effectiveDateField: string;
  imageAccessCodeField: string;
  isActive: string;
  isExpired: string;
  isManadatory: string;
  isViewRestriction: string;
  photoIsMandatoryField: string;
  remarksField: string;
  returnedPhotographFiels: string;
  returnedSignatureField: string;
  signatureField: string;
  signatureGroupNameField: string;
  signRequestIdField: string;
}

export interface Mandate {
  code: string;
  title: string;
  description: string;
}

export enum ReasonOption {
  CUSTOMERNOTPRESENT = 'customerNotPresent',
  CONTACTCENTER = 'contactCenter',
  DIGITALSUPPORT = 'digitalSupport',
}

export enum ReasonOptionDrc {
  CUSTOMERNOTPRESENT = 'customerNotPresent',
  BIOSYSTEMDOWN = 'contactCenter',
  UNABLETOVALIDATE = 'digitalSupport',
}

export interface ReasonOptionItem {
  code: ReasonOption;
  title: string;
  description: string;
}

export interface ViewProfileTicketPayload {
  associatedId: string;
  customerId: string;
  customerName: string;
  profileRequestTaskData: {
    accountNumber: string;
    profileViewReason: string;
    reason: string;
    action: string;
  };
}

export interface DocumentUploadPayload {
  filename: string;
  format: string;
  data: string;
  DocCode?: string;
}

export interface CloneObject {
  documentName: string;
  documentDescription: string;
  documentFileName: string;
  mandatory: boolean;
  name: string;
  size: string | number;
  success: boolean;
  fileSize: string;
  additionalDocument: boolean;
  document: DocumentUploadPayload;
  uploadedFile: File | {};
}

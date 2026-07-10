export interface MandateInqResponse {
  statusMessage: string;
  statusCode: string;
  successful: boolean;
  responseObject: ResponseObject;
}

export interface ResponseObject {
  mandates: Mandate[];
}

export interface Mandate {
  accountId: string;
  accountNumber: string;
  operationMode: string;
  customerId: string;
  cif: string;
  email: string;
  phone: string;
  signatoryType: string;
  customerName: string;
  signatoryName: string;
  remarks: string;
  isDeleted: boolean;
  cifType: string;
}

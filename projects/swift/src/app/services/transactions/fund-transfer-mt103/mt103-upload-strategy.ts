type AccountDetailsLike = {
  Cif?: string;
  AccountNumber?: string;
  IdNumber?: string;
  [key: string]: unknown;
};

type RemitterDetailsLike = {
  CountryCode?: string;
  [key: string]: unknown;
};

type DocumentUploadLike = {
  document?: Record<string, unknown>;
  documentName?: string;
};

type StandardUploadDocument = Record<string, unknown> & {
  filename?: string;
  data?: string;
};

type CongoUploadLike = {
  name: string;
  format: string;
  file: string;
  docCode: string;
};

export type Mt103UploadStrategy = 'KE' | 'CD' | 'DEFAULT';

export function selectMt103UploadStrategy(countryCode: string): Mt103UploadStrategy {
  switch (countryCode) {
    case 'KE':
      return 'KE';
    case 'CD':
      return 'CD';
    default:
      return 'DEFAULT';
  }
}

export function buildKenyaUploadPayload(
  accountDetails: AccountDetailsLike,
  remitterDetails: RemitterDetailsLike,
  ticketId: string,
  documents: DocumentUploadLike[]
) {
  const mappedDocuments: StandardUploadDocument[] = documents.map(docs => ({
    ...(docs.document || {}),
    filename: docs.documentName,
  }));

  return {
    CIF: accountDetails?.Cif,
    AccountNumber: accountDetails?.AccountNumber,
    Country: remitterDetails?.CountryCode,
    ticketNumber: ticketId,
    idType: 'CustomerId',
    idNumber: accountDetails?.IdNumber,
    Service: 'NewGenSwift',
    documents: mappedDocuments.filter(doc => Boolean(doc.data)),
  };
}

export function buildDefaultUploadPayload(
  accountDetails: AccountDetailsLike,
  remitterDetails: RemitterDetailsLike,
  ticketId: string,
  documents: DocumentUploadLike[]
) {
  return buildKenyaUploadPayload(accountDetails, remitterDetails, ticketId, documents);
}

export function buildCongoUploadPayload(
  accountDetails: AccountDetailsLike,
  ticketId: string,
  uploadsToSendToServer: CongoUploadLike[]
) {
  const cif = accountDetails?.Cif;

  return {
    CIF: cif,
    AccountNumber: accountDetails?.AccountNumber,
    Country: 'CD',
    ticketNumber: ticketId,
    idType: 'CustomerId',
    Service: 'Blob',
    processName: 'Swift And Rtgs',
    processId: cif,
    idNumber: cif,
    documents: uploadsToSendToServer.map(doc => ({
      filename: doc.name,
      format: doc.format,
      data: doc.file.split(',')[1],
      docCode: doc.docCode,
      docName: doc.name,
    })),
  };
}

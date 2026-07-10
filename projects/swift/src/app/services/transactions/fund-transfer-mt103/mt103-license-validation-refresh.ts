import {
  buildReturnedTicketDocValidators,
  updateLicenseDocumentRequiredStatus,
} from './mt103-returned-ticket-document-initializer';

type RequiredDocument = {
  fileName: string;
  required?: boolean;
  filePresent?: boolean;
  file?: unknown;
  data?: unknown;
  blobUrl?: unknown;
};

export function buildMt103LicenseValidationRefresh(documents: RequiredDocument[]) {
  const { updatedDocuments } = updateLicenseDocumentRequiredStatus(documents);

  return {
    updatedDocuments,
    documents,
    docValidators: updatedDocuments.length > 0 ? buildReturnedTicketDocValidators(documents) : [],
  };
}

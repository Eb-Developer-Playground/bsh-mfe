import { mergeStringWithUnderscores } from './mt103-helpers';

type RequiredDocument = {
  fileName: string;
  required?: boolean;
  filePresent?: boolean;
  file?: unknown;
  data?: unknown;
  blobUrl?: unknown;
};

type CurrentDocument = {
  filename?: string;
  id?: string;
  [key: string]: unknown;
};

type MergedDocument = RequiredDocument & CurrentDocument & { filePresent: boolean };

export function buildMergedReturnedTicketDocuments(
  requiredDocuments: RequiredDocument[],
  currentDocuments: CurrentDocument[]
): MergedDocument[] {
  return requiredDocuments.map(requiredDoc => {
    const matchingCurrentDoc = currentDocuments.find(
      currentDoc => currentDoc.filename?.toLowerCase() === requiredDoc.fileName.toLowerCase()
    );

    return matchingCurrentDoc
      ? { ...requiredDoc, ...matchingCurrentDoc, filePresent: true }
      : { ...requiredDoc, filePresent: false };
  });
}

export function markLicenseDocumentsAsRequired(
  documents: RequiredDocument[],
  isSwiftTransaction: boolean
): RequiredDocument[] {
  if (!isSwiftTransaction) {
    return documents;
  }

  documents.forEach(doc => {
    if (doc.fileName?.toLowerCase().includes('license') || doc.fileName?.toLowerCase().includes('licence')) {
      doc.required = true;
    }
  });

  return documents;
}

export function buildReturnedTicketDocValidators(documents: RequiredDocument[]) {
  return documents.map(doc => ({
    fileName: doc.fileName,
    formName: mergeStringWithUnderscores(doc.fileName),
    required: Boolean(doc.required),
  }));
}

export function updateLicenseDocumentRequiredStatus(documents: RequiredDocument[]) {
  const licenseDocuments = documents.filter(
    doc => doc.fileName.toLowerCase().includes('license') || doc.fileName.toLowerCase().includes('licence')
  );

  const updatedDocuments = licenseDocuments.map(doc => {
    const wasRequired = doc.required;
    const wasPresent = doc.filePresent;
    const hadFile = doc.file;
    const hadData = doc.data;
    const hadBlobUrl = doc.blobUrl;

    doc.required = true;

    if (wasPresent !== undefined) {
      doc.filePresent = wasPresent;
    }
    if (hadFile) {
      doc.file = hadFile;
    }
    if (hadData) {
      doc.data = hadData;
    }
    if (hadBlobUrl) {
      doc.blobUrl = hadBlobUrl;
    }

    return {
      fileName: doc.fileName,
      wasRequired,
      nowRequired: true,
      wasPresent,
      filePreserved: wasPresent || !!hadFile,
      updated: !wasRequired,
    };
  });

  return {
    updatedDocuments,
    preservedFiles: updatedDocuments.filter(doc => doc.filePreserved),
  };
}

type UploadedDocumentLike = {
  success?: boolean;
  filename?: string;
  message?: string;
  [key: string]: unknown;
};

type SourceDocumentLike = {
  documentName?: string;
  fileName?: string;
  [key: string]: unknown;
};

export type Mt103FailedUploadDocument = UploadedDocumentLike & {
  fileName: string;
  fileExtension: string;
};

export function aggregateFailedDocuments(
  uploadedDocs: UploadedDocumentLike[],
  sourceDocuments: SourceDocumentLike[]
): Mt103FailedUploadDocument[] {
  return uploadedDocs
    .filter(doc => !doc.success)
    .map(doc => {
      const originalFile = sourceDocuments.find(file => file.documentName === doc.filename);
      const fileName = originalFile?.fileName || '';
      const extension = fileName ? fileName.split('.').pop() || '' : '';

      return {
        ...doc,
        fileName,
        fileExtension: extension,
      };
    });
}

export function formatFailedDocumentsErrorMessage(failedDocs: Mt103FailedUploadDocument[]): string {
  const errorMessages = failedDocs
    .map(doc => `${doc.fileName} (ext: ${doc.fileExtension}). Reason: ${doc.message}`)
    .join('\n');

  return `Failed to upload:\n${errorMessages}`;
}

export type Mt103UploadedDocumentWithId = {
  id: string;
};

export type Mt103CongoCleanupPayload = {
  customerId: string;
  service: 'blob';
  processId: string;
  processName: 'Swift And Rtgs';
  validDocumentsIds: string[];
};

export function extractMt103UploadedDocumentIds(uploadedDocs: Mt103UploadedDocumentWithId[]): string[] {
  return uploadedDocs.map(doc => doc.id);
}

export function buildMt103CongoCleanupPayload(cif: string, documentIds: string[]): Mt103CongoCleanupPayload {
  return {
    customerId: cif,
    service: 'blob',
    processId: cif,
    processName: 'Swift And Rtgs',
    validDocumentsIds: documentIds,
  };
}

import { MessageBoxType } from '../../../../shared/modules/toast';
import { extractMt103UploadedDocumentIds, Mt103UploadedDocumentWithId } from './mt103-congo-finalization';

export type Mt103FinalizationPlan = {
  requiresCongoCleanup: boolean;
  documentIds: string[];
};

export type Mt103FinalizationFeedback = {
  title: string;
  message: string;
  type: MessageBoxType;
};

export function buildMt103FinalizationPlan(
  countryCode: string,
  uploadedDocs: Mt103UploadedDocumentWithId[]
): Mt103FinalizationPlan {
  if (countryCode === 'CD') {
    return {
      requiresCongoCleanup: true,
      documentIds: extractMt103UploadedDocumentIds(uploadedDocs),
    };
  }

  return {
    requiresCongoCleanup: false,
    documentIds: [],
  };
}

export function resolveMt103CleanupFailureFeedback(): Mt103FinalizationFeedback {
  return {
    title: '',
    message: 'Failed to clean up documents',
    type: MessageBoxType.DANGER,
  };
}

export function shouldShowMt103UploadSuccessMessage(documentsLength: number): boolean {
  return documentsLength > 0;
}

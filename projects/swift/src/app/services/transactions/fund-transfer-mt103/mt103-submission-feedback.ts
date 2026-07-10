import { MessageBoxType } from '../../../../shared/modules/toast';
import { isLicenseRelatedError } from './mt103-helpers';

export type Mt103ToastFeedback = {
  title: string;
  message: string;
  type: MessageBoxType;
};

export type Mt103SubmissionFeedback = Mt103ToastFeedback & {
  requiresLicenseDocumentUpdate: boolean;
};

export function resolveMt103UploadErrorFeedback(error: unknown): Mt103ToastFeedback {
  const uploadError = error as { statusMessage?: string; message?: string } | undefined;

  return {
    title: '',
    message: uploadError?.statusMessage || uploadError?.message || 'Failed to upload documents',
    type: MessageBoxType.DANGER,
  };
}

export function resolveMt103SubmissionErrorFeedback(error: unknown, countryCode: string): Mt103SubmissionFeedback {
  const submissionError = error as
    | {
        message?: string;
        error?: { statusMessage?: string };
      }
    | undefined;

  const errorMessage = submissionError?.error?.statusMessage || submissionError?.message || '';
  const requiresLicenseDocumentUpdate = countryCode === 'CD' && isLicenseRelatedError(errorMessage);

  if (requiresLicenseDocumentUpdate) {
    return {
      title: 'Document Required',
      message: 'License Document is required for this transaction. Please upload the required license document.',
      type: MessageBoxType.WARNING,
      requiresLicenseDocumentUpdate: true,
    };
  }

  return {
    title: 'Submission Error',
    message: errorMessage || 'An error occurred while submitting the transaction.',
    type: MessageBoxType.DANGER,
    requiresLicenseDocumentUpdate: false,
  };
}

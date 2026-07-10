import { MessageBoxType } from '../../../../shared/modules/toast';

export type Mt103SubmissionSuccessFeedback = {
  title: string;
  message: string;
  type: MessageBoxType;
  redirectUrl: string;
};

export function resolveMt103SubmissionSuccessFeedback(ticketId: string | number): Mt103SubmissionSuccessFeedback {
  return {
    title: '',
    message: `Ticket ${ticketId} submitted to Checker successfully!`,
    type: MessageBoxType.SUCCESS,
    redirectUrl: '/dashboard/',
  };
}

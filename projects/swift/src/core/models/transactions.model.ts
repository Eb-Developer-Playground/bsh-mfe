export const TransactionsStatusType = {
  SUBMIT: 'submit',
  REFER_BACK: 'refer back',
  REJECT: 'reject',
  RETURN: 'return',
} as const;
export type TransactionsStatusType = (typeof TransactionsStatusType)[keyof typeof TransactionsStatusType];

export interface TransactionsUpdateTicketPayload {
  ticketId: string;
  stage: string;
  status: any;
  performedBy: string;
  comments: any;
  [key: string]: any;
}

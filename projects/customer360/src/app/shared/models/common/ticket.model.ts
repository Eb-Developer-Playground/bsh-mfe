export interface Ticket {
  TaskType?: any;
  ActionFlow: string;
  AssociatedId: string;
  CustomerId: string;
  CustomerName: string;
  CustomerPresent: boolean;
  ViewProfileTicketId?: any;
  taskNotes?: any;
  createdBy?: string;
  createdOnUtc?: string;
  id: number
  actionFlow?: any;
  status?: string;
}

export enum ApprovalStatus {
  APPROVE = 'submit',
  RETURN = 'refer back',
  REJECT = 'reject',
}

import { FormNames } from '../../../shared/models';

export interface TicketStatus {
  ticketId: string;
  stage: string;
  status: string;
  performedBy: string;
  comments?: string;
  customerName?: string;
  customerCif?: string;
}

export interface Ticket {
  actionFlow: {
    name: string;
    description: string;
    branchId: any;
    isSequential: boolean;
    id: number;
  };
  actionFlowId: 17;
  actions: Array<any>;
  associatedId: string;
  bankId: string;
  branchId: string;
  createdBy: string;
  createdOnUtc: string;
  customerId: string;
  customerName: string;
  id: number;
  isDeleted: boolean;
  modifiedOnUtc: string;
  status: string;
  taskData: string;
  taskDocuments: Array<any>;
  taskNotes: Array<string>;
  taskType: {
    name: string;
    description: string;
    id: number;
    createdOnUtc: string;
    modifiedOnUtc: string;
  };
  taskTypeId: 16;
  userId: string;
  workItem: any;
}

export interface TicketStatusForm {
  formName: FormNames;
  values: any;
  valid: boolean;
}

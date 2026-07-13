export namespace actionTicket {
  export interface createTicket {
    actionFlow?: string;
    ActionFlow?: string;
    associatedId?: string;
    TaskType?: string;
    CustomerName?: string;
    CustomerId?: string;
    Subject?: string;
    // taskType: string;
  }
  export interface Response {
    statusMessage: string;
    statusCode: string;
    successful: boolean;
    responseObject: Ticket;
  }
  export interface Ticket {
    ticketId: number;
    associatedId: string;
    userId: string;
    actionFlowName: string;
    taskTypeName: string;
    status: string;
    createdBy: string;
    customerId: string | null;
    customerName: string | null;
    taskData: any;
    notes: Array<any>;
    actions: Array<any>;
  }
  export interface MandatePayload {
    CustomerDetails?: any;
    MandateData?: any;
  }
}

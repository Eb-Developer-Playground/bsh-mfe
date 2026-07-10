export interface Ticket {
  _id?: string;
  id?: string;
  ticketId?: string;
  status?: string;
  ticketType?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface TicketStatusForm {
  status?: string;
  notes?: string;
  [key: string]: any;
}

export const TicketModel = {} as any;

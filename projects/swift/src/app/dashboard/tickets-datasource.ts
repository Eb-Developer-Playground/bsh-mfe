export interface TicketItem {
  id: number;
  createdBy: string;
  customerCif: string;
  customerName: string;
  error: any;
  label: string;
  note: string;
  status: string;
  subject: string;
  actionFlowName: string;
  actionFlowDescription: string;
  createdOnUtc: Date;
}

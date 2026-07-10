import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-bulk-payment-ticket-transactions-print-receipt',
  templateUrl:
    './bulk-payment-ticket-transactions-print-receipt.component.html',
  styleUrls: [
    './bulk-payment-ticket-transactions-print-receipt.component.scss',
  ],
})
export class BulkPaymentTicketTransactionsPrintReceiptComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<BulkPaymentTicketTransactionsPrintReceiptComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }

  print = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };
}

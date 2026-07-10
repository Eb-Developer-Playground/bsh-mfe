import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cash-management-print-receipt',
  templateUrl: './cash-management-print-receipt.component.html',
  styleUrls: ['./cash-management-print-receipt.component.scss'],
})
export class CashManagementPrintReceiptComponent implements OnInit {
  public details: any;
  localDateTime!: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe,
    private as: AuthService,
    public dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    this.details = JSON.parse(this.data.ticket.taskData);
    this.localDateTime = this.datePipe.transform(
      `${new Date(this.data.ticket?.createdOnUtc)} UTC`,
      'medium'
    );
  }

  maskAccount = (accountNumber: any) => {
    const first = accountNumber.substring(0, 1);
    const last4 = accountNumber.substring(accountNumber.length - 4);
    const mask = accountNumber
      .substring(1, accountNumber.length - 4)
      .replace(/\d/g, '*');

    return first + mask + last4;
  };

  get isCreatedBy(): boolean {
    return this.as.currentUser.username === this.data.ticket.createdBy
      ? true
      : false;
  }

  close() {
    this.dialogRef.close();
  }

  print = () => {
    window.print();
  };
}

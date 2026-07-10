import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-balance-statement',
  templateUrl: './dialog-balance-statement.component.html',
  styleUrls: ['./dialog-balance-statement.component.scss'],
})
export class DialogBalanceStatementComponent implements OnInit {
  dataObject!: any;

  constructor(
    public dialogRef: MatDialogRef<DialogBalanceStatementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.data;
  }

  closeDialog(confirm: boolean): void {
    this.dialogRef.close(confirm);
  }
}

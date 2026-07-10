import { Component, OnInit, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-dialog-balance-statement',
  templateUrl: './dialog-balance-statement.component.html',
  styleUrls: ['./dialog-balance-statement.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
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

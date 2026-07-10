import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'dialog-money-transfer',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
  ],
  templateUrl: './money-transfer.dialog.html',
  styleUrl: './money-transfer.dialog.scss',
})
export class MoneyTransferDialog implements OnInit {
  transferForm: FormGroup;
  processing = false;
  transferTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MoneyTransferDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.transferForm = this.fb.group({
      transferType: ['', Validators.required],
      transactionType: [''],
      centerNumber: [''],
      recallCancelationType: [''],
      requestType: [''],
      remitterAccNr: [''],
    });
  }

  ngOnInit(): void {}

  getTransferOptions(type: string): void {
    // Needs TransactionsService integration
    console.warn('Transfer options need TransactionsService — type:', type);
  }

  getTransactionOptions(type: string): void {
    // Needs TransactionsService integration
    console.warn('Transaction options need TransactionsService — type:', type);
  }

  onSubmit(): void {
    this.dialogRef.close({ data: null, form: this.transferForm.value });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close({ data: null, form: this.transferForm.value });
  }
}

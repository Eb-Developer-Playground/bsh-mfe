import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-existing-customer',
  templateUrl: './existing-customer.component.html',
  styleUrls: ['./existing-customer.component.scss'],
})
export class ExistingCustomerComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public customer: any,
    private dialogRef: MatDialogRef<ExistingCustomerComponent>
  ) {}

  ngOnInit(): void {}

  close = () => {
    this.dialogRef.close(false);
  };

  proceed = () => {
    this.dialogRef.close(true);
  };
}

import { Component, OnInit, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-existing-customer',
  templateUrl: './existing-customer.component.html',
  styleUrls: ['./existing-customer.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
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

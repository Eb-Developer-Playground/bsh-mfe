import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';

export interface LaunchCustomerData {
  canVerify: string;
}

@Component({
  selector: 'app-launch-customer-dialog',
  templateUrl: './launch-customer-dialog.component.html',
  styleUrls: ['./launch-customer-dialog.component.scss'],
})
export class LaunchCustomerDialogComponent implements OnInit {
  fingerprintAccepted = false;
  reasonForViewingProfile = '';

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LaunchCustomerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LaunchCustomerData
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  setCanVerify(event: any): void {
    this.data.canVerify = event.value;
  }

  next() {
    if (this.data.canVerify === '') return;
    this.dialogRef.close(this.data.canVerify);
  }
}

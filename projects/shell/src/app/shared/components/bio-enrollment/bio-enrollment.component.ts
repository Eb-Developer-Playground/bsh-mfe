import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-bio-enrollment',
  templateUrl: './bio-enrollment.component.html',
  styleUrls: ['./bio-enrollment.component.scss'],
})
export class BioEnrollmentComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<BioEnrollmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit(): void {}

  GoBack() {
    this.dialogRef.close();
  }
}

import { Component, Inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-bio-enrollment',
  templateUrl: './bio-enrollment.component.html',
  styleUrls: ['./bio-enrollment.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
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

import { Component, Inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';

@Component({
  selector: 'app-dialog-skip-enrol',
  templateUrl: './skip-enrol-bio-dialog.html',
  styleUrls: ['./skip-enrol-bio-dialog.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class SkipEnrolBioDialog implements OnInit {
  form!: UntypedFormGroup;
  label = 'Reason*';
  controlName = 'reason';
  options: string[] = ['Biometrics system down', 'Two', 'Three'];

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<SkipEnrolBioDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      reason: ['', [Validators.required]],
    });
  }

  closeDialog() {
    this.dialogRef.close(this.form.controls['reason'].value);
  }
}

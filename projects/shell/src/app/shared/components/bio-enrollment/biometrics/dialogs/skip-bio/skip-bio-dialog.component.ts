import { Component, Inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../../../compat-barrel';

@Component({
  selector: 'app-dialog-skip',
  templateUrl: './skip-bio-dialog.component.html',
  styleUrls: ['./skip-bio-dialog.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class SkipBioDialog implements OnInit {
  form!: UntypedFormGroup;
  label = 'Reason*';
  controlName = 'reason';
  options: string[] = ['Biometrics system down', 'Two', 'Three'];

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<SkipBioDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      reason: ['', [Validators.required]],
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-skip-enrol',
  templateUrl: './skip-enrol-bio-dialog.html',
  styleUrls: ['./skip-enrol-bio-dialog.scss'],
})
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
    this.dialogRef.close(this.form.controls.reason.value);
  }
}

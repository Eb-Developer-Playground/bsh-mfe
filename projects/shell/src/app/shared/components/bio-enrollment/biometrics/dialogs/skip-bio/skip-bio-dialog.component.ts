import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-skip',
  templateUrl: './skip-bio-dialog.component.html',
  styleUrls: ['./skip-bio-dialog.component.scss'],
})
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

import { Component, Inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-change-of-signature-skip-bio',
  templateUrl: './change-of-signature-skip-bio.component.html',
  styleUrls: ['./change-of-signature-skip-bio.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class ChangeOfSignatureSkipBioComponent implements OnInit {
  reasonForm!: UntypedFormGroup;
  constructor(
    public dialogRef: MatDialogRef<ChangeOfSignatureSkipBioComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      cif: string;
      ticketId: string;
      stakeholderName: string;
      nationalId: string;
      accountNo: string;
      accountType: string;
      approvalRequired: boolean;
    },
    private formBuilder: UntypedFormBuilder,
    private router: Router
  ) {
    this.reasonForm = this.formBuilder.group({
      reason: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.router.navigate(['/services/change-of-signature/success'], {
      state: this.data,
    });

    this.dialogRef.close();
  }
}

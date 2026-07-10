import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-of-signature-skip-bio',
  templateUrl: './change-of-signature-skip-bio.component.html',
  styleUrls: ['./change-of-signature-skip-bio.component.scss'],
})
export class ChangeOfSignatureSkipBioComponent implements OnInit {
  reasonForm = this.formBuilder.group({
    reason: ['', Validators.required],
  });
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
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.router.navigate(['/services/change-of-signature/success'], {
      state: this.data,
    });

    this.dialogRef.close();
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-change-of-signature-skip-bio',
  templateUrl: './change-of-signature-skip-bio.component.html',
  styleUrls: ['./change-of-signature-skip-bio.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslatePipe,
    RouterModule,
  ],
})
export class ChangeOfSignatureSkipBioComponent implements OnInit {
  reasonForm;
  constructor(
    public dialogRef: MatDialogRef<ChangeOfSignatureSkipBioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cif: string; ticketId: string; stakeholderName: string; nationalId: string; accountNo: string; accountType: string; approvalRequired: boolean; },
    private formBuilder: UntypedFormBuilder,
    private router: Router
  ) {
    this.reasonForm = this.formBuilder.group({
      reason: ['', Validators.required],
    });
  }
  ngOnInit(): void {}
  onSubmit(): void {
    this.router.navigate(['/services/change-of-signature/success'], { state: this.data });
    this.dialogRef.close();
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cheque-issuance-details-preview',
  template: '<div>Cheque issuance preview placeholder</div>',
  standalone: true,
})
export class ChequeIssuanceDetailsPreviewComponent {
  constructor(
    public dialogRef: MatDialogRef<ChequeIssuanceDetailsPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

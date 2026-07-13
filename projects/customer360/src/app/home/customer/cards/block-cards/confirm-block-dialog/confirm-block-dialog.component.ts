import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-block-dialog',
  template: '<div>Confirm block placeholder</div>',
  standalone: true,
})
export class ConfirmBlockDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmBlockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

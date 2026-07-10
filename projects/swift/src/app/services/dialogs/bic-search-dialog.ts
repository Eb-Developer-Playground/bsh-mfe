import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'dialog-bic-search',
  imports: [MatDialogModule, MatButtonModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>BIC Search</h2>
    <mat-dialog-content>
      <p>BIC search dialog — needs ApiService integration.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">{{ 'COMMON.CLOSE' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class BicSearchDialog {
  constructor(public dialogRef: MatDialogRef<BicSearchDialog>) {}

  close(): void {
    this.dialogRef.close();
  }
}

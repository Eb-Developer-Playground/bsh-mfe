import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'dialog-notification',
  imports: [MatDialogModule, MatButtonModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.subTitle }}</p>
      <p>{{ data.body }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="true">{{ 'COMMON.OK' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class NotificationDialog {
  constructor(
    public dialogRef: MatDialogRef<NotificationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface IDialogNotification {
  title?: string;
  subTitle?: string;
  message?: string;
  icon?: string;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'dialog-notification',
  templateUrl: 'question.dialog.html',
  styleUrls: ['question.dialog.scss'],
})
export class QuestionDialog {
  constructor(
    public dialogRef: MatDialogRef<QuestionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogNotification
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

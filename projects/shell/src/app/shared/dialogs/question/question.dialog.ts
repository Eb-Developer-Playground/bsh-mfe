import { Component, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../compat-barrel';

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
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class QuestionDialog {
  constructor(
    public dialogRef: MatDialogRef<QuestionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogNotification
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

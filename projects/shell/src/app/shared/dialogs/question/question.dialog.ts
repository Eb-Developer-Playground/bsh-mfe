import { Component, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

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
  imports: [FlexLayoutModule, MatButtonModule, MatDialogModule, MatIconModule, TranslatePipe],
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

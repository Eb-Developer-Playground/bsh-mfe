import { Component, Inject } from '@angular/core';
import { SessionService } from '@app/shared/services';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-send-terms-dialog',
  templateUrl: './send-terms-dialog.component.html',
  styleUrls: ['./send-terms-dialog.component.scss'],
})
export class SendTermsDialogComponent {
  downloaded: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { phoneNumber: string; email: string },
    public dialogRef: MatDialogRef<any>,
    public session: SessionService
  ) {}

  downloadTerms(): void {
    this.downloaded = true;
    let url = '';
    switch (this.session.userBank) {
      case '56':
        url =
          'https://equitygroupholdings.com/ug/uploads/ug-account-opening-terms.pdf';
        break;
      case '54':
        url =
          'https://equitygroupholdings.com/ke/uploads/account-opening-terms-and-conditions.pdf';
        break;
      case '55':
        url =
          'https://equitygroupholdings.com/tz/uploads/account-opening-terms-and-conditions.pdf';
        break;
      case '50':
        url =
          'https://equitygroupholdings.com/rw/images/Terms_and_Conditions_En-Fr-Kn.pdf';
        break;
      case '11':
        url =
          'https://equitygroupholdings.com/ss/uploads/account-opening-terms-and-conditions.pdf';
        break;
      case '43':
        url =
          'https://equitygroupholdings.com/cd/media/mobn0jn2/termes-et-conditions-frech.pdf';
        break;
    }

    // Open the URL in a new tab
    window.open(url, '_blank');
    // Close dialog and notify parent
    this.dialogRef.close({
      termsSent: true,
      termsAccepted: true,
      downloaded: this.downloaded,
    });
  }
}

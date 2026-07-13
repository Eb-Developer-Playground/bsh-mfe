import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

import { PdfDialogComponent, PDFData } from '@app/shared/components/pdf-dialog/pdf-dialog.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    RouterModule,
    TranslatePipe,
  ],
})
export class SuccessComponent implements OnInit, OnDestroy {
  base64String = '';
  successData!: any;

  emailObj!: Array<{}>;
  printObj!: Array<{}>;
  pdfInfo!: any;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.pdfInfo = JSON.parse(<string>localStorage.getItem('pdfInfo'));

    this.emailObj = [
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NAME',
        value: this.pdfInfo.data.accountName,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NUMBER',
        value: this.pdfInfo.data.accountNumber,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.STATEMENT-DURATION',

        value: this.pdfInfo.data.statementDuration,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.START-DATE',
        value: this.pdfInfo.data.startDate,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.END-DATE',
        value: this.pdfInfo.data.endDate,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.NO-OF-PAGES',
        value: this.pdfInfo.data.noPages,
      },
      {
        title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.EMAIL_ADDRESS',
        value: this.pdfInfo.data.emailAddress,
      },
    ];

    if (this.pdfInfo.data.waiveCharges) {
      this.printObj = [
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NAME',
          value: this.pdfInfo.data.accountName,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NUMBER',
          value: this.pdfInfo.data.accountNumber,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.STATEMENT-DURATION',
          value: this.pdfInfo.data.statementDuration,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.START-DATE',
          value: this.pdfInfo.data.startDate,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.END-DATE',
          value: this.pdfInfo.data.endDate,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.NO-OF-PAGES',
          value: this.pdfInfo.data.noPages,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.MODE-OF-PAYMENT',
          value: this.translateService.instant(
            'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.WAIVE-CHARGES'
          ),
        },
      ];
    } else {
      this.printObj = [
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NAME',
          value: this.pdfInfo.data.accountName,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.ACCOUNT-NUMBER',
          value: this.pdfInfo.data.accountNumber,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.STATEMENT-DURATION',

          value: this.pdfInfo.data.statementDuration,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.START-DATE',
          value: this.pdfInfo.data.startDate,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.END-DATE',
          value: this.pdfInfo.data.endDate,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.NO-OF-PAGES',
          value: this.pdfInfo.data.noPages,
        },
        {
          title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.CHARGES',
          value: this.pdfInfo.data.charges,
        },
        // Rwanda only: show VAT breakdown (values provided via pdfInfo.data)
        ...((this.pdfInfo?.data?.bankId === '50' || this.pdfInfo?.data?.countryCode === 'RW') && this.pdfInfo.data.vatAmount > 0
          ? [ // Show VAT breakdown only if there is a VAT amount
              {
                title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.BASE-CHARGES',
                value: `${this.pdfInfo.data.currency} ${this.pdfInfo.data.baseCharge}`,
              },
              {
                title: 'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.VAT-CHARGES',
                value: `${this.pdfInfo.data.currency} ${this.pdfInfo.data.vatAmount}`,
              },
            ]
          : []),
      ];
    }
    this.base64String = this.pdfInfo.base64;

    if (this.pdfInfo.delivery == 'Email') this.successData = this.emailObj;
    else this.successData = this.printObj;
  }

  openPreviewDocument(documentId: number): void {
    const data: PDFData = {
      fileName: 'AccountStatement',
      base64String: this.base64String,
      deliveryMode: this.pdfInfo.delivery,
    };

    let dialogRef = this.dialog.open(PdfDialogComponent, {
      width: '831px',
      height: 'auto',
      data,
    });

    dialogRef.afterClosed().subscribe(option => {});
  }

  downloadPdf(fileName: string) {
    const source = `data:application/pdf;base64,${this.base64String}`;

    let iframe =
      "<iframe width='100%' height='100%' src='" + source + "'></iframe>";
    let x = (window as any).open();
    x.document.open();
    x.document.write(iframe);
    x.document.close(iframe);

    document.location.href = source;
  }

  onClickDownloadPdf() {
    this.downloadPdf('Statement');
  }

  goToProfile() {
    this.router.navigateByUrl('services/customer-360');
  }

  ngOnDestroy() {
    localStorage.removeItem('pdfInfo');
  }
}

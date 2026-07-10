import { DatePipe } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SaveAndInvestService } from 'src/app/core/services/save-and-invest/save-and-invest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SessionService } from '@app/shared/services';

@Component({
  selector: 'app-dialog-print-receipt',
  templateUrl: './dialog-print-receipt.component.html',
  styleUrls: ['./dialog-print-receipt.component.scss'],
})
export class DialogPrintReceiptComponent implements OnInit, OnDestroy {
  localDateTime!: any;
  public details: any;
  private destroy$ = new Subject();
  isCreatedByCurrentUser = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe,
    private as: AuthService,
    private sessionService: SessionService,
    public dialogRef: MatDialogRef<any>,
    private saveAndInvestService: SaveAndInvestService
  ) {}

  ngOnInit(): void {
    if (this.data.type === 'move-money-receipt') {
      this.details = this.data.transferDetails;
      this.isCreatedByCurrentUser = true;
    } else {
      this.isCreatedByCurrentUser =
        this.as.currentUser.username === this.data.ticket.createdBy;
      this.details = JSON.parse(this.data.ticket.taskData);
    }

    const date =
      this.data.ticket?.modifiedOnUtc ||
      this.data.ticket?.createdOnUtc ||
      this.data?.PaymentDetails?.dateCreated;

    this.localDateTime = this.datePipe.transform(
      `${new Date(date)} UTC`,
      'medium'
    );

    if (this.data.type === 'fixed-call-break-deposit') {
      this.getInterestPercentEstimate();
    }
  }

  maskAccount = (accountNumber: any) => {
    const first = accountNumber.substring(0, 1);
    const last4 = accountNumber.substring(accountNumber.length - 4);
    const mask = accountNumber
      .substring(1, accountNumber.length - 4)
      .replace(/\d/g, '*');
    return first + mask + last4;
  };

  extractFirstName(nameStrng: string) {
    return nameStrng.split(' ')[0];
  }
  close() {
    this.dialogRef.close();
  }

  print = () => {
    window.print();
  };

  private getInterestPercentEstimate() {
    //get Interest
    this.saveAndInvestService
      .getInterestPercentEstimate(
        this.details.DepositAmount,
        this.details.InvestmentTermInMonths,
        this.details.CurrencyCode
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        const interestEstimate = response.responseObject;
        this.details = {
          ...this.details,
          interestPercent: interestEstimate.interestRateInPercent,
          investmentReturns: interestEstimate.investmentReturns,
        };
      });
  }

  get transferRateCode() {
    if (this.details) {
      const currencies = `${this.details.SenderDetails?.SourceAccountCurrency}-${this.details.BeneficiaryDetails?.DestinationAccountCurrency}`;
      switch (currencies) {
        case 'CDF-USD':
          return 'TTS';
        case 'USD-CDF':
          return 'TTB';
        default:
          return 'TTS';
      }
    } else {
      return 'TTS';
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  get isDRC() {
    const cc = this.sessionService.userCountryCode
      .replace(/\s/g, '')
      .toLowerCase();
    return cc === 'cd';
  }
}

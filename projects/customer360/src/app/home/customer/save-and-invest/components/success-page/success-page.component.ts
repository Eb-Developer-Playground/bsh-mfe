import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
import { IBreadcrumbConfig } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { BreadcrumbNavigationComponent } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { SaveAndInvest } from 'src/app/shared/models/save-and-invest/save-and-invest.model';
import { format } from 'date-fns';
import { SaveAndInvestDataStoreService } from 'src/app/core/services/save-and-invest/save-and-invest-data-store.service';
// import { DialogPrintReceiptComponent } from 'src/app/shared/components/dialog/dialog-print-receipt/dialog-print-receipt.component'; // TODO: Component not available
import { SessionService } from 'src/app/shared/services';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CdscAccountOpeningService } from 'src/app/core/services/cdsc-account-opening/cdsc-account-opening.service';
import { TranslateService } from '@ngx-translate/core';
import { SaveAndInvestService } from 'src/app/core/services/save-and-invest/save-and-invest.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

export interface IReviewDetail {
  label: string;
  value: string;
}

@Component({
  selector: 'app-success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    BreadcrumbNavigationComponent,
    // DialogPrintReceiptComponent, // TODO: Component not available
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    DecimalPipe,
  ],
})
export class SuccessPageComponent implements OnInit, OnDestroy {
  public depositTypeParam!: string;
  public routeParamsSubscription: any;

  public title!: string;
  public subtitle!: string;
  public details!: Array<IReviewDetail>;
  private successData!: SaveAndInvest.FixedDespositSubmitPayload;
  formData: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountManagementService: AccountManagementService,
    private saveAndInvestDataStoreService: SaveAndInvestDataStoreService,
    private saveAndInvestService: SaveAndInvestService,
    private decimalPipe: DecimalPipe,
    public dialog: MatDialog,
    private sessionService: SessionService,
    private as: AuthService,
    private cdscAccountOpeningService: CdscAccountOpeningService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.formData = this.accountManagementService.getsaveAndInvestDetails()?.formData;
    this.routeParamsSubscription = this.route.params.subscribe(
      params => (this.depositTypeParam = params['depositType'])
    );
    this.initTitles();
    this.initContent();
  }

  ngOnDestroy(): void {
    localStorage.removeItem('success_data');
    this.routeParamsSubscription.unsubscribe();
  }

  get isWithdrawalState(): boolean {
    return this.depositTypeParam === 'withdraw';
  }

  get isRolloverState(): boolean {
    return this.depositTypeParam === 'rollover';
  }

  get isBreakState(): boolean {
    return this.depositTypeParam === 'break';
  }

  get isCDSCAccountOpeningState(): boolean {
    return this.depositTypeParam === 'cdsc-account-opening';
  }
  get isCallDepositeSaving(): boolean {
    return this.depositTypeParam === 'call';
  }

  get isFixedState(): boolean {
    return this.depositTypeParam === 'fixed';
  }

  initTitles = () => {
    if (this.isWithdrawalState) {
      this.title = 'COMMON.YOU-ARE-DONE';
    }
    if (this.isRolloverState) {
      this.title = 'COMMON.YOU-ARE-DONE';
      this.subtitle = 'SAVE-INVEST.ROLLOVER-ACCOUNT.SUCCESS-MGS';
    }
    if (this.isCallDepositeSaving) {
      this.title = 'COMMON.YOU-ARE-DONE';
      this.subtitle = 'SAVE-INVEST.CALL-DEPOSIT.SUCCESS-MGS';
    }
    if (this.isBreakState) {
      this.title = 'COMMON.YOU-ARE-DONE';
    }
    if (this.isCDSCAccountOpeningState) {
      this.title = 'COMMON.YOU-ARE-DONE';
      this.subtitle = 'SAVE-INVEST.CDSC .SUCCESS-MGS';
    }
    if (this.isFixedState) {
      this.title = 'COMMON.YOU-ARE-DONE';
      this.subtitle = 'SAVE-INVEST.FIXED-DEPOSIT.SUCCESS-MGS';
    }
  };

  initContent = () => {
    if (this.isRolloverState) {
      this.details = [
        {
          label: 'Fixed savings account name',
          value: ' New fixed savings - 1',
        },
        {
          label: 'Fixed savings account number',
          value: '34346654565',
        },
        {
          label: 'Savings account balance',
          value: 'KES 25,000',
        },
        {
          label: 'Credit account',
          value: 'Account 1 - 34346654565',
        },
        {
          label: 'Witholding tax',
          value: 'KES 100000',
        },
        {
          label: 'Transaction charges',
          value: 'KES 1,000',
        },
        {
          label: 'Fixed account closing date',
          value: '11/11/2021',
        },
      ];
    }
    if (this.isCallDepositeSaving) {
      this.details = [
        {
          label: 'SAVE-INVEST.CALL-DEPOSIT.ACCOUNT-NAME',
          value: this.formData.accountName,
        },
        {
          label: 'SAVE-INVEST.CURRENCY',
          value: this.formData.currency,
        },
        {
          label: 'SAVE-INVEST.CALL-DEPOSIT.DEBIT-ACCOUNT',
          value: this.formData.debitAccount,
        },
        {
          label: 'SAVE-INVEST.NEW-ACCOUNT-NUMBER',
          value:
            this.saveAndInvestService.ticketResponse.Item3?.GeneratedAccountInfo
              ?.AccountNumber,
        },
        {
          label: 'SAVE-INVEST.INITIAL-AMOUNT',
          value: '' + this.formData.initialAmount,
        },
        {
          label: 'SAVE-INVEST.PAYMENT-TYPE',
          value: this.formData.paymentType,
        },
      ];
    }
    if (this.isCDSCAccountOpeningState) {
      this.details = [
        {
          label: 'SAVE-INVEST.ACCOUNT-NUMBER',
          value: this.cdscAccountOpeningService.getAccountNumber(),
        },
        {
          label: 'SAVE-INVEST.ACCOUNT-TYPE',
          value: this.translateService.instant('SAVE-INVEST.CDSC.CDSC-ACCOUNT'),
        },
        {
          label: 'COMMON.BRANCH',
          value: 'Nairobi',
        },
      ];
    }
    if (this.isBreakState) {
      const selectedAccount =
        this.saveAndInvestDataStoreService.getSelectedDepositAccount();
      const transferDetails =
        this.accountManagementService.getsaveAndInvestDetails();
      this.details = [
        {
          label: 'SAVE-INVEST.ACCOUNT-NUMBER',
          value: selectedAccount.accountNumber,
        },
        {
          label: 'SAVE-INVEST.AVAILABLE-BALANCE',
          value: selectedAccount.availableBalance,
        },
        {
          label: 'SAVE-INVEST.BREAK.CREDIT-ACCOUNT',
          value: transferDetails.creditAccount,
        },
        {
          label: 'SAVE-INVEST.BREAK.TRANSFER-AMOUNT',
          value: transferDetails.transferAmount,
        },
      ];
    }
    if (this.isFixedState) {
      this.successData = JSON.parse(
        <string>localStorage.getItem('success_data')
      );

      this.details = [
        {
          label: 'SAVE-INVEST.ACCOUNT-NAME',
          value: this.successData?.accountName,
        },
        {
          label: 'SAVE-INVEST.NEW-ACCOUNT-NUMBER',
          value:
            this.successData?.ticketTaskData?.Item3?.GeneratedAccountInfo
              ?.AccountNumber,
        },
        {
          label: 'SAVE-INVEST.ACCOUNT-TYPE',
          value: this.translateService.instant(
            'SAVE-INVEST.FIXED-DEPOSIT.SAVINGS-ACCOUNT'
          ),
        },
        {
          label: 'SAVE-INVEST.SOURCE-ACCOUNT-NUMBER',
          value: this.successData?.taskData?.sourceAccount,
        },
        {
          label: 'SAVE-INVEST.INITIAL-AMOUNT',
          value: `${
            this.successData?.taskData?.currencyCode
          } ${this.decimalPipe.transform(
            +this.successData?.taskData?.depositAmount,
            '1.2-2'
          )} `,
        },
        {
          label: 'SAVE-INVEST.INTEREST-DATE',
          value: `${this.successData?.taskData?.interestPercent}%`,
        },
        {
          label: 'SAVE-INVEST.DEPOSIT-TERM',
          value: `${
            this.successData?.taskData?.investmentTermInMonths > 12
              ? `${this.translateService.instant('COMMON.CUSTOM')}-`
              : ''
          }  ${this.successData?.taskData?.investmentTermInMonths} ${
            this.successData?.taskData?.investmentTermInMonths === 1
              ? this.translateService.instant('COMMON.MONTH')
              : this.translateService.instant('COMMON.MONTHS')
          } `,
        },
        {
          label: 'SAVE-INVEST.MATURITY-DATE',
          value: format(
            new Date(
              new Date().setMonth(
                new Date().getMonth() + (this.successData?.taskData.investmentTermInMonths || 0)
              )
            ),
            'PPpp'
          ),
        },
      ];
    }
  };

  goToProfile = () => this.router.navigateByUrl('services/customer-360');

  goToSaveAndInvest = () =>
    this.router.navigateByUrl('services/customer-360/save-and-invest');

  public getCertificate() {
    let ticket = {
      createdOnUtc: new Date(),
      createdBy: this.as.currentUser.username,
      taskData: JSON.stringify({
        SourceAccount: this.successData?.taskData?.sourceAccount,
        DepositAmount: +this.successData?.taskData?.depositAmount,
        CurrencyCode: this.successData?.taskData?.currencyCode,
        CreatedByFullName: this.sessionService.userFullName,
        InvestmentTermInMonths:
          this.successData?.taskData?.investmentTermInMonths,
        ContactDetails: {
          FirstName: this.successData?.customerName,
          LastName: '',
        },
      }),
    };
    if (this.isCallDepositeSaving) {
      const callData = this.saveAndInvestService
        .ticketResponse as SaveAndInvest.TicketResponse.CallDeposit;
      ticket = {
        createdOnUtc: new Date(),
        createdBy: this.as.currentUser.username,
        taskData: JSON.stringify({
          ...this.successData,
          SourceAccount: callData?.Item3?.SourceAccount,
          DepositAmount: +callData?.Item3?.InitialSavingAmount,
          CurrencyCode: callData?.Item3?.SavingsAmountCurrency,
          isRecurring: callData?.Item3?.UseRecurringPayment,
          recurringAmount: callData?.Item3?.RecurrentPaymentSettings.Amount,
          startDate: callData?.Item3?.RecurrentPaymentSettings.StartDate,
          endDate: callData?.Item3?.RecurrentPaymentSettings.EndDate,
          newAccountNumber: callData?.Item3?.GeneratedAccountInfo.AccountNumber,
          CreatedByFullName: this.sessionService.userFullName,
          paymentType: this.formData?.paymentType,
          ContactDetails: {
            FirstName: callData?.Item3.ContactDetails.FirstName,
            LastName: callData?.Item3.ContactDetails.LastName,
          },
        }),
      };
    }
    const data = {
      ticket,
      type: this.isCallDepositeSaving ? 'call' : 'fixed-call-break-deposit',
    };
    // TODO: DialogPrintReceiptComponent not available - commenting out print functionality
    // const dialogRef = this.dialog.open(DialogPrintReceiptComponent, {
    //   width: '600px',
    //   height: '90%',
    //   data,
    // });
    // dialogRef.afterClosed().subscribe(result => {});
  }
}

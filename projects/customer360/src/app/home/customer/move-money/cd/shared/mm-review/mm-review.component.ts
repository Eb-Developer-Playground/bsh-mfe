import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  Account,
  MoveMoneyPayload,
} from '@app/home/customer/funds-transfer/funds-transfer.model';

import { OnSave, StepperChildComponent } from '@app/shared/modules/stepper';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';

import { MoveMoneyService } from '@app/core/services/move-money/move-money.service';
import { v4 as uuid } from 'uuid';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { ExchangeDetailsT } from '@app/home/customer/move-money/models/move-money-services.model';
import { MmSharedLogicService } from '@app/home/customer/move-money/cd/shared/mm-shared-logic.service';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MmDocumentComponent } from '../mm-document/mm-document.component';
import { TransformCurrencyPipe } from '@app/shared/pipes/transform-currency.pipe';

@Component({
  selector: 'app-mm-review',
  templateUrl: './mm-review.component.html',
  styleUrl: './mm-review.component.scss',
  imports: [TranslatePipe, DatePipe, MatExpansionModule, MatDividerModule, MmDocumentComponent, TransformCurrencyPipe],
})
export class MmReviewComponent
  extends StepperChildComponent
  implements OnInit, OnDestroy, OnSave, OnChanges
{
  transferDetails: any = {};
  exchangeDetails: ExchangeDetailsT | null = null;
  account: Account = {};
  accountSelected: any = '';
  remainingBalance: number = 0;
  destroy$: Subject<any> = new Subject<any>();

  ticketId: any;
  @Input() dataControl: any;
  @Input() uploads: {
    file: string;
    format: string;
    name: string;
    docCode: string;
  }[] = [];

  uploadsToUse: {
    file: string;
    format: string;
    name: string;
    docCode: string;
  }[] = [];
  customerDetails = JSON.parse(<string>localStorage.getItem('customerDetails'));
  fingerprintAccepted = false;
  associatedID: any;

  multipleCurrency: boolean = false;

  customerAccounts: Account[] = JSON.parse(
    <string>localStorage.getItem('accounts')
  );
  private countryCode = '';
  private countryCodes: { bankId: string; countryCode: string }[] = [
    { bankId: '11', countryCode: 'SS' },
    { bankId: '43', countryCode: 'CD' },
    { bankId: '50', countryCode: 'RW' },
    { bankId: '54', countryCode: 'KE' },
    { bankId: '55', countryCode: 'TZ' },
    { bankId: '56', countryCode: 'UG' },
  ];

  constructor(
    public translateService: TranslateService,
    private moveMoneyService: MoveMoneyService,
    private dialog: MatDialog,
    private toastService: ToastService,
    protected route: ActivatedRoute,
    protected router: Router,
    private mmSharedLogicService: MmSharedLogicService
  ) {
    super();
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getTransferDetails();
    this.getAccount();
    this.setupUploads();
  }

  ngOnChanges(changes: any) {
    if (changes && changes.uploads && changes.uploads.currentValue) {
      this.setupUploads(changes.uploads.currentValue);
    } else {
      this.setupUploads();
    }
  }

  setupUploads(
    docsData?: { file: string; format: string; name: string; docCode: string }[]
  ) {
    if (!docsData) {
      this.uploadsToUse = this.mmSharedLogicService.getRequiredDocs();
      return;
    }
    const hasDocInfo = docsData.filter(doc => doc.file).length;
    if (hasDocInfo) {
      this.uploadsToUse = docsData;
    }
  }

  getTransferDetails(): void {
    this.multipleCurrency = false;
    this.transferDetails = JSON.parse(
      <string>localStorage.getItem('moveMoneyValues')
    );
    this.exchangeDetails = this.transferDetails.ExchangeDetailsForm;

    if (this.transferDetails === null) {
      return;
    }

    if (
      this.transferDetails.DebitAccountDetails.accountCurrency !==
      this.transferDetails.BeneficiaryDetails.accountCurrency
    ) {
      this.multipleCurrency = true;
    }
  }

  get transferRateCode() {
    return this.transferDetails?.ExchangeDetailsForm?.RateCode || 'TTS';
  }
  getAccount() {
    if (this.transferDetails === null) {
      return;
    }
    this.countryCode = <string>(
      this.countryCodes.find(
        code => +code.bankId === +this.customerDetails.bankID
      )?.countryCode
    );

    let acc = this.customerAccounts.find(
      (item: any) =>
        item.accountNumber ===
        this.transferDetails.DebitAccountDetails.accountNumber
    );
    this.associatedID = uuid();
    if (acc) {
      this.account = acc;
      this.calculateRemainingBalance(acc);
    }
  }

  calculateRemainingBalance(acc: Account): void {
    if (!acc.availableBalance) return;
    acc.availableBalance = acc?.availableBalance.replace(/,/g, '.');

    const sourceCurrency =
      this.transferDetails.DebitAccountDetails.accountCurrency;
    const paymentCurrency = this.transferDetails.PaymentDetails.currency;
    let paymentAmount = parseFloat(this.transferDetails.PaymentDetails.amount);
    if (sourceCurrency !== paymentCurrency) {
      paymentAmount = parseFloat(
        this.transferDetails.PaymentDetails.convertedAmount
      );
    }
    this.remainingBalance = parseFloat(acc.availableBalance) - paymentAmount;
  }

  launchBio(ticketDetails: any): void {
    this.accountSelected = this.customerDetails.accounts.find(
      (acc: any) =>
        acc.accountNumber ===
        this.transferDetails.DebitAccountDetails.accountNumber
    );
    if (this.account.mandate !== 'SELF') {
      this.openSignatoriesDialog();
    } else {
      this.openVerifyBioDialog();
    }
  }

  openSignatoriesDialog() {
    const user = this.customerDetails;
    const dialogRef = this.dialog.open(VerifySignatoryDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        searchFlow: false,
        accepted: this.fingerprintAccepted,
        user: user,
        accountsSelected: this.accountSelected,
        hideSkipBio: false,
        inProcess: true,
        fundsTransfer: true,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.status === 'canVerify') {
        return this.openVerifySignatoryBioDialog(result.data);
      } else {
        // TODO - NOT SURE WHAT WE DO HERE
        //return this.openSkipBioDialog();
      }
    });
  }

  openVerifyBioDialog() {
    const user = this.customerDetails;

    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '50%',
      data: {
        searchFlow: false,
        accepted: this.fingerprintAccepted,
        user: user,
        accountsSelected: this.accountSelected,
        hideSkipBio: false,
        fundsTransfer: true,
        ticketId: this.ticketId,
        inProcess: true,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.data === true) {
          if (this.uploads.length) {
            this.uploadAndSubmitDocs();
          } else {
            this.submitTicketData(this.ticketId, this.transferDetails);
          }
        }
      }
    });
  }
  uploadAndSubmitDocs() {
    const data = {
      CIF: this.customerDetails.cif,
      AccountNumber: this.account.accountNumber,
      Country: this.countryCode,
      ticketNumber: '' + this.ticketId,
      processName: 'MoveMoneyFlowV2',
      processId: this.customerDetails.cif,
      idType: 'CustomerId',
      idNumber: this.account.accountNumber,
      Service: 'Blob',
      documents: this.uploadsToSendToServer.map(doc => {
        return {
          filename: doc.name,
          format: doc.format,
          data: doc.file.split(',')[1],
          docCode: doc.docCode,
          docName: doc.name,
        };
      }),
    };

    this.moveMoneyService.uploadTransactionDocumentsV3(data).subscribe(
      docRes => {
        if (docRes.successful && docRes.responseObject) {
          const docs = docRes.responseObject;
          const isErrorFile = docs.some((doc: any) => !doc.success);

          if (isErrorFile) {
            docs.forEach((doc: any) => {
              if (!doc.success) {
                this.toastService.show(
                  'Error',
                  `Failed to upload ${doc.filename}. Reason: ${doc.message}`,
                  MessageBoxType.DANGER
                );
              }
            });
            return;
          } else {
            this.completeTicketDocuments();
          }
        }
      },
      docErr => console.log(docErr)
    );
  }

  addUnderscores(str: string) {
    return str.replace(/ /g, '_');
  }

  openVerifySignatoryBioDialog(signatories: any) {
    const user = this.customerDetails;
    const dialogRef = this.dialog.open(VerifySignatoryBioDialogComponent, {
      data: {
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        signatories: signatories,
        fundsTransfer: true,
        inProcess: true,
        ticketId: this.ticketId,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fingerprintAccepted = result.data;
        if (this.uploadsToSendToServer.length) {
          this.uploadAndSubmitDocs();
        } else {
          this.submitTicketData(this.ticketId, this.transferDetails);
        }
        this.toastService.show(
          'Success',
          'Action submitted successfully',
          MessageBoxType.SUCCESS
        );
      }
    });
  }

  proceedWithoutBio() {
    if (this.uploadsToSendToServer.length) {
      this.uploadAndSubmitDocs();
    } else {
      this.submitTicketData(this.ticketId, this.transferDetails);
    }
  }

  ngAfterViewInit() {}

  onActive() {
    this.getTransferDetails();
    this.getAccount();
  }

  get uploadsToSendToServer() {
    return this.uploadsToUse.filter(upload => upload.file);
  }
  onSave(): void {
    const data = {
      AssociatedId: this.associatedID,
      CustomerName: this.account.accountName,
      CustomerId: this.customerDetails.cif,
      BankId: this.customerDetails.bankID,
      TransactionType: 'MOVEMONEY',
      TransferType: this.transferDetails.PaymentDetails.transactionType,
    };

    this.moveMoneyService
      .createMoveMoneyTicket(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        if (resp.successful) {
          localStorage.setItem('movemoney-ticketid', resp.responseObject.id);
          this.ticketId = resp.responseObject.id;

          if (this.mmSharedLogicService.doesNotUseBio()) {
            this.proceedWithoutBio();
          } else {
            this.launchBio(resp.responseObject);
          }
        }
      });
  }
  private completeTicketDocuments() {
    this.moveMoneyService
      .submitTransactionDocuments(this.ticketId, {})
      .subscribe(
        res => {
          if (res.successful) {
            this.toastService.show(
              `Documents submitted to ticket successfully!`,
              `Documents submitted to ticket successfully!`,
              MessageBoxType.SUCCESS,
              5000,
              undefined,
              undefined,
              false
            );

            this.submitTicketData(this.ticketId, this.transferDetails);
          }
        },
        err => {}
      );
  }

  get convertedCurrencyForCrossTrns() {
    const sourceAcc = this.transferDetails.DebitAccountDetails.accountCurrency;
    const paymentCurrency = this.transferDetails.PaymentDetails.currency;
    const beneficiaryCurrency =
      this.transferDetails.BeneficiaryDetails.accountCurrency;
    if (sourceAcc === paymentCurrency) {
      return beneficiaryCurrency;
    } else {
      return sourceAcc;
    }
  }

  get exchangeRateCurrencyLeft() {
    const sourceAcc = this.transferDetails.DebitAccountDetails.accountCurrency;
    const paymentCurrency = this.transferDetails.PaymentDetails.currency;
    const beneficiaryCurrency =
      this.transferDetails.BeneficiaryDetails.accountCurrency;
    let leftCurrency = sourceAcc;
    if (sourceAcc === paymentCurrency) {
      leftCurrency = beneficiaryCurrency;
    }
    if (this.transferRateCode === 'TTB') {
      return paymentCurrency;
    } else if (this.transferRateCode === 'TTS') {
      return leftCurrency;
    }
    return false;
  }
  get exchangeRateCurrencyRight() {
    const sourceAcc = this.transferDetails.DebitAccountDetails.accountCurrency;
    const paymentCurrency = this.transferDetails.PaymentDetails.currency;
    const beneficiaryCurrency =
      this.transferDetails.BeneficiaryDetails.accountCurrency;
    let rightCurrency = sourceAcc;
    if (sourceAcc === paymentCurrency) {
      rightCurrency = beneficiaryCurrency;
    }
    if (this.transferRateCode === 'TTB') {
      return rightCurrency;
    } else if (this.transferRateCode === 'TTS') {
      return paymentCurrency;
    }
    return false;
  }
  private submitTicketData(ticketId: string, formData: any) {
    const transferType =
      formData.PaymentDetails.transactionType === 'IntraBank'
        ? 'TransferToOtherEquityBankAccount'
        : 'TransferToOwnAccount';
    if (!this.exchangeDetails) return;
    const moveMoneyPayload: MoveMoneyPayload =
      this.mmSharedLogicService.generateMoveMoneySubmitPayload(
        transferType,
        this.exchangeDetails,
        formData,
        this.customerDetails
      );
    this.moveMoneyService
      .submitMoveMoneyTicket(ticketId, moveMoneyPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        //todo follow up on api changes obj or json?
        if (res.successful) {
          let resObj = null;
          if (typeof res.responseObject === 'string') {
            resObj = JSON.parse(res.responseObject);
          }
          if (typeof res.responseObjec === 'object') {
            resObj = res.responseObject;
          }

          if (resObj) {
            this.transferDetails.referenceId = resObj.ReferenceId;
          }

          localStorage.setItem(
            'moveMoneyValues',
            JSON.stringify(this.transferDetails)
          );

          this.toastService.show(
            'MOVE-MONEY.TICKET-SUBMITTED-MESSAGE',
            '',
            MessageBoxType.SUCCESS
          );
          this.router
            .navigate(['./success'], { relativeTo: this.route })
            .then(() => {});
        }
      });
  }
}

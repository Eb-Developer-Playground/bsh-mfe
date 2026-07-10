import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { v4 as uuid } from 'uuid';
import { AccountMgt } from '@app/shared/models/common/account.model';

import { TranslateService } from '@ngx-translate/core';
import { MoveMoneyService } from '@app/core/services/move-money/move-money.service';
import { OnSave, StepperChildComponent } from '@app/shared/modules/stepper';
import { Subject, takeUntil } from 'rxjs';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { MoveMoneyDocRequestPayloadT } from '@app/home/customer/move-money/models/move-money-services.model';
import { MmSharedLogicService } from '@app/home/customer/move-money/cd/shared/mm-shared-logic.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MmDebitAccountComponent } from '../../../shared/mm-debit-account/mm-debit-account.component';
import { MmEquityBeneficiaryComponent } from '../mm-equity-beneficiary/mm-equity-beneficiary.component';
import { MmPaymentDetailsComponent } from '../../../shared/mm-payment-details/mm-payment-details.component';
import { MmNarrationComponent } from '../../../shared/mm-narration/mm-narration.component';
import { MmAdditionalDelailsComponent } from '../../../shared/mm-additional-delails/mm-additional-delails.component';
import { CollapsibleComponent } from '@app/shared/modules/collapsible-section';
@Component({
  selector: 'app-transfer-details-equity',
  templateUrl: './transfer-details.component.html',
  styleUrl: './transfer-details.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [TranslatePipe, ReactiveFormsModule, MmDebitAccountComponent, MmEquityBeneficiaryComponent, MmPaymentDetailsComponent, MmNarrationComponent, MmAdditionalDelailsComponent, CollapsibleComponent],
})
export class TransferDetailsComponent
  extends StepperChildComponent
  implements OnInit, OnDestroy, OnSave
{
  sendToEquityAccountForm!: UntypedFormGroup;
  destroy$: Subject<any> = new Subject<any>();
  @Output() setupRequiredDocsInfo = new EventEmitter();
  @Output() updateIsProcessing = new EventEmitter();
  existingCustomerDetails = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  ExchangeDetailsForm: FormGroup;

  selectedDebitAccount = JSON.parse(
    <string>localStorage.getItem('selectedAccount')
  );
  selectedBenefactorAccount!: AccountMgt.Account;

  allAccounts: AccountMgt.Account[] = this.existingCustomerDetails.accounts;

  private countryCode = '';
  private countryCodes: { bankId: string; countryCode: string }[] = [
    { bankId: '11', countryCode: 'SS' },
    { bankId: '43', countryCode: 'CD' },
    { bankId: '50', countryCode: 'RW' },
    { bankId: '54', countryCode: 'KE' },
    { bankId: '55', countryCode: 'TZ' },
    { bankId: '56', countryCode: 'UG' },
  ];

  get DebitAccountDetailsForm(): UntypedFormGroup {
    return <UntypedFormGroup>(
      this.sendToEquityAccountForm.get?.('DebitAccountDetails')
    );
  }

  get BeneficiaryDetailsForm(): UntypedFormGroup {
    return <UntypedFormGroup>(
      this.sendToEquityAccountForm.get?.('BeneficiaryDetails')
    );
  }

  get PaymentDetailsForm(): UntypedFormGroup {
    return <UntypedFormGroup>(
      this.sendToEquityAccountForm.get?.('PaymentDetails')
    );
  }

  get NarrationDetailsForm(): UntypedFormGroup {
    return <UntypedFormGroup>(
      this.sendToEquityAccountForm.get?.('NarrationDetails')
    );
  }

  get AdditionalDetailsForm(): UntypedFormGroup {
    return <UntypedFormGroup>(
      this.sendToEquityAccountForm.get?.('AdditionalDetails')
    );
  }

  constructor(
    public translateService: TranslateService,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private moveMoneyService: MoveMoneyService,
    private formBuilder: UntypedFormBuilder,
    private sharedLogicService: MmSharedLogicService
  ) {
    super();
    this.ExchangeDetailsForm = this.formBuilder.group({
      RateCode: [''],
      ExchangeRate: [''],
      BaseExchangeRate: [''],
      TreasuryRate: [''],
      SearchByCif: [''],
      ConvertedCurrency: [''],
      ConvertedAmount: [''],
      TicketNumber: [''],
      isSpecial: [false],
    });
  }

  ngOnInit(): void {
    this.initFormData();
    this.countryCode = <string>(
      this.countryCodes.find(
        code => +code.bankId === +this.existingCustomerDetails.bankID
      )?.countryCode
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  setDebitAccount(value: string) {
    if (!this.DebitAccountDetailsForm.get('accountNumber')?.valid) return;
    const selected = this.allAccounts.find(
      (acc: AccountMgt.Account) => acc.accountNumber === value
    );
    if (selected) {
      this.selectedDebitAccount = selected;
    } else {
      return;
    }

    this.updateAccountDetails();
    this.checkBeneficiaryAccountNumber();
  }

  updateAccountDetails() {
    this.DebitAccountDetailsForm.get('availableBalance')?.patchValue(
      this.selectedDebitAccount.availableBalance
    );

    this.DebitAccountDetailsForm.get('accountholderName')?.patchValue(
      this.selectedDebitAccount.accountName
    );

    this.DebitAccountDetailsForm.get('accountCurrency')?.patchValue(
      this.selectedDebitAccount.accountCurrency
    );

    this.PaymentDetailsForm.get('currency')?.patchValue(
      this.selectedDebitAccount.accountCurrency
    );
  }

  checkBeneficiaryAccountNumber() {
    this.BeneficiaryDetailsForm.get('accountNumber')?.updateValueAndValidity();
  }

  setupSubscriptions() {
    let debitAcc = this.sendToEquityAccountForm.get?.(
      'DebitAccountDetails'
    ) as FormGroup;

    let creditAcc = this.sendToEquityAccountForm.get?.(
      'BeneficiaryDetails'
    ) as FormGroup;

    debitAcc.controls['accountNumber'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((accNumber: string) => {
        this.setDebitAccount(accNumber);
      });

    this.sendToEquityAccountForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() =>
        this.stepControl.patchValue(
          this.sendToEquityAccountForm.valid ? true : null
        )
      );
  }

  selectBenefactor(account: AccountMgt.Account) {
    this.selectedBenefactorAccount = account;
  }

  private initFormData() {
    this.sendToEquityAccountForm = this.fb.group({
      DebitAccountDetails: this.fb.group({
        accountNumber: [
          this.selectedDebitAccount.accountNumber,
          [Validators.required, this.validateAccountNumber(this.allAccounts)],
        ],
        accountCurrency: [
          this.selectedDebitAccount.accountCurrency,
          [Validators.required],
        ],
        availableBalance: [
          this.selectedDebitAccount.availableBalance,
          [Validators.required],
        ],
        accountholderName: [this.selectedDebitAccount.accountName],
      }),
      BeneficiaryDetails: this.fb.group({
        accountNumber: [null, [Validators.required]],
        accountCurrency: [null],
        accountholderName: [null],
      }),
      PaymentDetails: this.fb.group({
        currency: [
          this.selectedDebitAccount.accountCurrency,
          [Validators.required],
        ],
        amount: [
          null,
          [
            Validators.required,
            Validators.min(1),
            this.amountValidator.bind(this),
          ],
        ],
        transactionType: 'IntraBank',
        reason: [null, [Validators.required]],
        ticketNumber: [null],
        dateCreated: [null],
        rateCode: ['TTS'],
        exchangeRate: ['1'],
        baseExchangeRate: ['1'],
        convertedAmount: [null, this.convertedAmountValidator.bind(this)],
        paymentFee: [0],
      }),
      NarrationDetails: this.fb.group({
        comment: [null],
      }),
      AdditionalDetails: this.fb.group({
        instrumentType: [null],
        instrumentDate: [null],
        instrumentNumber: [null],
      }),
      AdditionalDocuments: this.fb.group({
        documents: [null],
        required: [true],
      }),
    });
    this.setupSubscriptions();
  }

  amountValidator(control?: AbstractControl) {
    const debitAcc = this.sendToEquityAccountForm?.get(
      'DebitAccountDetails'
    )?.value;
    const paymentDetails =
      this.sendToEquityAccountForm?.get('PaymentDetails')?.value;
    const amountToMove = control?.value;

    const debitAccCurrency = debitAcc?.accountCurrency;
    const debitAccBalance = debitAcc?.availableBalance;
    const convertedAmount = paymentDetails?.convertedAmount;
    const amountCurrency = paymentDetails?.currency;

    return this.compareValues(
      debitAccCurrency,
      debitAccBalance,
      amountCurrency,
      amountToMove,
      convertedAmount,
      'amt'
    );
  }
  convertedAmountValidator(control?: AbstractControl) {
    const debitAcc = this.sendToEquityAccountForm?.get(
      'DebitAccountDetails'
    )?.value;
    const paymentDetails =
      this.sendToEquityAccountForm?.get('PaymentDetails')?.value;
    const convertedAmount = control?.value;

    const debitAccCurrency = debitAcc?.accountCurrency;
    const debitAccBalance = debitAcc?.availableBalance;
    const amountToMove = paymentDetails?.amount;
    const amountCurrency = paymentDetails?.currency;

    return this.compareValues(
      debitAccCurrency,
      debitAccBalance,
      amountCurrency,
      amountToMove,
      convertedAmount,
      'converted'
    );
  }

  compareValues(
    debitAccCurrency?: string,
    debitAccBalance?: string,
    amountCurrency?: string,
    amountToMove?: string,
    convertedAmount?: string,
    typ?: string
  ) {
    if (debitAccCurrency === amountCurrency) {
      if (Number(amountToMove) > Number(debitAccBalance)) {
        return { max: true };
      } else {
        this.resetValidators(typ);
        return null;
      }
    } else if (convertedAmount) {
      if (Number(convertedAmount) > Number(debitAccBalance)) {
        return { max: true };
      } else {
        this.resetValidators(typ);
        return null;
      }
    } else {
      this.resetValidators(typ);
      return null;
    }
  }
  getTransferFees() {
    const data = {
      customerId: this.existingCustomerDetails.cif,
      currency: this.PaymentDetailsForm.get('currency')?.value,
      amount: +this.PaymentDetailsForm.get('amount')?.value,
      transactionType: 'IntraBank',
      destinationBankCode: this.existingCustomerDetails.bankID,
      sourceAccount: this.DebitAccountDetailsForm.get('accountNumber')?.value,
      destinationAccount:
        this.BeneficiaryDetailsForm.get('accountNumber')?.value,
      countryCode: this.countryCode,
    };

    this.moveMoneyService.getTransferCharges(data).subscribe((resp: any) => {
      if (resp.successful) {
        this.PaymentDetailsForm.controls['paymentFee'].setValue(
          resp.responseObject
        );
        this.goToDocumentsSection();
      }
    });
  }

  goToDocumentsSection() {
    this.PaymentDetailsForm.get('dateCreated')?.patchValue(new Date());
    this.updateSelectedAccount();
    const payload: MoveMoneyDocRequestPayloadT =
      this.getRequiredMoveMoneyDocsPayload();
    this.moveMoneyService.getMoveMoneyDocInfo(payload).subscribe(resp => {
      if (resp.successful) {
        if (
          this.sharedLogicService.isNotCrossCurrency(
            this.sendToEquityAccountForm.value
          )
        ) {
          this.ExchangeDetailsForm.reset();
          this.ExchangeDetailsForm.get('isSpecial')?.setValue(false);
        }
        const moveMoneyData = {
          ...this.sendToEquityAccountForm.value,
          ExchangeDetailsForm: this.ExchangeDetailsForm.value,
          requiredDocsInfo: resp.responseObject.documents,
        };
        localStorage.setItem('moveMoneyValues', JSON.stringify(moveMoneyData));
        this.setupRequiredDocsInfo.emit();
        this.validateDestinationAccountAmount();
      } else {
        this.sharedLogicService.triggerErrorToast(
          'Unable to validate send money details'
        );
      }
    });
  }

  updateSelectedAccount() {
    const debitAccountNumber =
      this.DebitAccountDetailsForm.get('accountNumber')?.value;
    const accountInfo = this.allAccounts.find(
      acc => acc.accountNumber === debitAccountNumber
    );
    if (accountInfo) {
      localStorage.setItem(
        'selectedAccount',
        JSON.stringify({
          ...accountInfo,
          cif: this.existingCustomerDetails.cif,
        })
      );
    }
  }

  private validateDestinationAccountAmount() {
    this.sharedLogicService
      .validateMoveMoneyDestinationAccount(this.sendToEquityAccountForm.value)
      .subscribe((resp: any) => {
        if (resp.successful) {
          const errors = this.sharedLogicService.hasDestinationAccountErrors(
            resp.responseObject
          );
          if (errors) {
            this.sharedLogicService.triggerErrorToast(errors);
          } else {
            this.gotoNext();
          }
        } else {
          this.sharedLogicService.triggerErrorToast(
            'Unable to validate send money details'
          );
        }
      });
  }

  onSave() {
    this.getTransferFees();
  }

  private getRequiredMoveMoneyDocsPayload(): MoveMoneyDocRequestPayloadT {
    const customerDetails = JSON.parse(
      <string>localStorage.getItem('customerDetails')
    );
    const sendMoneyDetails = this.sendToEquityAccountForm.value;
    const exchangeDetails = this.ExchangeDetailsForm.value;
    const transferType =
      sendMoneyDetails.PaymentDetails.transactionType === 'IntraBank'
        ? 'TransferToOtherEquityBankAccount'
        : 'TransferToOwnAccount';
    return this.sharedLogicService.generateMoveMoneySubmitPayload(
      transferType,
      exchangeDetails,
      sendMoneyDetails,
      customerDetails
    );
  }
  private validateAccountNumber(data: any[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const selectedValue = control.value;
      let exists = data.some(dat => dat.accountNumber === selectedValue);
      if (exists) {
        return null;
      } else {
        return { invalidAccountNumber: true };
      }
    };
  }

  resetValidators(typ?: string) {
    const amountInput = this.sendToEquityAccountForm?.get(
      'PaymentDetails.amount'
    );
    const convertedAmount = this.sendToEquityAccountForm?.get(
      'PaymentDetails.convertedAmount'
    );

    if (typ === 'converted') {
      amountInput?.setErrors(null);
    }
  }
}

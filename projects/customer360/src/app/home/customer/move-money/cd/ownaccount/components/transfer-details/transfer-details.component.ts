import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AccountMgt } from '@app/shared/models/common/account.model';
import { TranslateService } from '@ngx-translate/core';
import { MoveMoneyService } from '@app/core/services/move-money/move-money.service';
import { OnSave, StepperChildComponent } from '@app/shared/modules/stepper';
import { Subject, takeUntil } from 'rxjs';
import { MoveMoneyDocRequestPayloadT } from '@app/home/customer/move-money/models/move-money-services.model';
import { MmSharedLogicService } from '@app/home/customer/move-money/cd/shared/mm-shared-logic.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MmDebitAccountComponent } from '../../../shared/mm-debit-account/mm-debit-account.component';
import { MmBeneficiaryAccountComponent } from '../mm-beneficiary-account/mm-beneficiary-account.component';
import { MmPaymentDetailsComponent } from '../../../shared/mm-payment-details/mm-payment-details.component';
import { MmNarrationComponent } from '../../../shared/mm-narration/mm-narration.component';
import { MmAdditionalDelailsComponent } from '../../../shared/mm-additional-delails/mm-additional-delails.component';
import { CollapsibleComponent } from '@app/shared/modules/collapsible-section';

@Component({
  selector: 'app-transfer-details',
  templateUrl: './transfer-details.component.html',
  styleUrl: './transfer-details.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [TranslatePipe, ReactiveFormsModule, MmDebitAccountComponent, MmBeneficiaryAccountComponent, MmPaymentDetailsComponent, MmNarrationComponent, MmAdditionalDelailsComponent, CollapsibleComponent],
})
export class TransferDetailsComponent
  extends StepperChildComponent
  implements OnInit, OnDestroy, OnSave
{
  @Output() setupRequiredDocsInfo = new EventEmitter();
  @Output() updateIsProcessing = new EventEmitter();
  sendToOwnAccountForm!: UntypedFormGroup;
  destroy$: Subject<any> = new Subject<any>();

  existingCustomerDetails = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );

  selectedDebitAccount = JSON.parse(
    <string>localStorage.getItem('selectedAccount')
  );
  selectedBenefactorAccount!: AccountMgt.Account;

  allAccounts: AccountMgt.Account[] = this.existingCustomerDetails.accounts;
  allAccountsForCustomer: AccountMgt.Account[] =
    this.existingCustomerDetails.accounts;
  validBeneficiaryAccounts: AccountMgt.Account[] = [];

  ExchangeDetailsForm: FormGroup;
  lockedForm: boolean = false;

  get DebitAccountDetailsForm(): UntypedFormGroup {
    return <UntypedFormGroup>(
      this.sendToOwnAccountForm?.get?.('DebitAccountDetails')
    );
  }

  get BeneficiaryDetailsForm(): UntypedFormGroup {
    return <UntypedFormGroup>(
      this.sendToOwnAccountForm?.get?.('BeneficiaryDetails')
    );
  }

  get PaymentDetailsForm(): UntypedFormGroup {
    return <UntypedFormGroup>this.sendToOwnAccountForm?.get?.('PaymentDetails');
  }

  get NarrationDetailsForm(): UntypedFormGroup {
    return <UntypedFormGroup>(
      this.sendToOwnAccountForm?.get?.('NarrationDetails')
    );
  }

  get AdditionalDetailsForm(): UntypedFormGroup {
    return <UntypedFormGroup>(
      this.sendToOwnAccountForm?.get?.('AdditionalDetails')
    );
  }

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

  onActive(): void {}

  getTransferFees() {
    // this.goToReview();
    // return;
    const data = {
      customerId: this.existingCustomerDetails.cif,
      currency: this.PaymentDetailsForm.get('currency')?.value,
      amount: +this.PaymentDetailsForm.get('amount')?.value,
      transactionType: 'TransferToOwnAccount',
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

        this.gotToDocsSection();
      }
    });
  }

  onSave() {
    this.getTransferFees();
  }

  gotToDocsSection() {
    this.PaymentDetailsForm.get('dateCreated')?.patchValue(new Date());
    this.updateSelectedAccount();
    const payload: MoveMoneyDocRequestPayloadT =
      this.getRequiredMoveMoneyDocsPayload();
    this.moveMoneyService.getMoveMoneyDocInfo(payload).subscribe(resp => {
      if (resp.successful) {
        if (
          this.sharedLogicService.isNotCrossCurrency(
            this.sendToOwnAccountForm.value
          )
        ) {
          this.ExchangeDetailsForm.reset();
          this.ExchangeDetailsForm.get('isSpecial')?.setValue(false);
        }
        const moveMoneyData = {
          ...this.sendToOwnAccountForm.value,
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

  setupSubscriptions() {
    let debitAcc = this.sendToOwnAccountForm.get?.(
      'DebitAccountDetails'
    ) as FormGroup;

    let creditAcc = this.sendToOwnAccountForm.get?.(
      'BeneficiaryDetails'
    ) as FormGroup;

    debitAcc.controls['accountNumber'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((accNumber: string) => {
        this.setDebitAccount(accNumber);
        this.updatePossibleBeneficiaryAccounts(accNumber);
      });

    creditAcc.controls['accountNumber'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((accNumber: string) => {
        if (accNumber === null) return;
        this.setBenefactorAccount(accNumber);
        this.updateBeneficiaryDetails();
        this.updatePossibleDebitAccounts(accNumber);
      });

    this.sendToOwnAccountForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() =>
        this.stepControl.patchValue(
          this.sendToOwnAccountForm.valid ? true : null
        )
      );
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
    this.PaymentDetailsForm.get('amount')?.updateValueAndValidity();
    this.updateAccountDetails();
    this.checkBeneficiaryAccountNumber();
  }
  checkBeneficiaryAccountNumber() {
    this.BeneficiaryDetailsForm.get('accountNumber')?.updateValueAndValidity();
  }

  lockFormFields(locked: boolean) {
    this.lockedForm = locked;
  }
  setBenefactorAccount(value: string) {
    const selected = this.allAccounts.find(
      (acc: AccountMgt.Account) => acc.accountNumber === value
    );
    if (selected) {
      this.selectedBenefactorAccount = selected;
    }
    this.updateBeneficiaryDetails();
  }

  updateBeneficiaryAccounts(accNumber: string) {}

  initFormData() {
    this.sendToOwnAccountForm = this.fb.group({
      DebitAccountDetails: this.fb.group({
        accountNumber: [
          this.selectedDebitAccount.accountNumber || null,
          [Validators.required, this.validateAccountNumber(this.allAccounts)],
        ],
        accountCurrency: [
          this.selectedDebitAccount.accountCurrency || null,
          [Validators.required],
        ],
        availableBalance: [
          this.selectedDebitAccount.availableBalance || null,
          [Validators.required],
        ],
        accountholderName: [this.selectedDebitAccount.accountName],
      }),
      BeneficiaryDetails: this.fb.group({
        accountNumber: [
          null,
          [Validators.required, this.validateCreditAccount(this.allAccounts)],
        ],
        accountCurrency: [null],
        accountholderName: [null],
      }),
      PaymentDetails: this.fb.group({
        currency: [
          this.selectedDebitAccount.accountCurrency || null,
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
        transactionType: 'OwnAccount',
        reason: [null, [Validators.required]],
        ticketNumber: [null],
        dateCreated: [null],
        rateCode: ['TTS'],
        exchangeRate: ['1'],
        baseExchangeRate: ['1'],
        convertedAmount: [null, this.convertedAmountValidator.bind(this)],
        paymentFee: [0],
        specialRateDetails: [null],
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
    this.updatePossibleBeneficiaryAccounts(
      this.selectedDebitAccount.accountNumber
    );
    this.setupSubscriptions();
  }
  amountValidator(control?: AbstractControl) {
    const debitAcc = this.sendToOwnAccountForm?.get(
      'DebitAccountDetails'
    )?.value;
    const paymentDetails =
      this.sendToOwnAccountForm?.get('PaymentDetails')?.value;
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
    const debitAcc = this.sendToOwnAccountForm?.get(
      'DebitAccountDetails'
    )?.value;
    const paymentDetails =
      this.sendToOwnAccountForm?.get('PaymentDetails')?.value;
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

  updateBeneficiaryDetails() {
    const currency =
      this.selectedBenefactorAccount &&
      this.selectedBenefactorAccount?.accountCurrency;
    if (!currency) return;
    this.BeneficiaryDetailsForm.get('accountCurrency')?.patchValue(
      this.selectedBenefactorAccount.accountCurrency
    );
    this.BeneficiaryDetailsForm.get('accountholderName')?.patchValue(
      this.selectedBenefactorAccount.accountName
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

  private validateDestinationAccountAmount() {
    this.sharedLogicService
      .validateMoveMoneyDestinationAccount(this.sendToOwnAccountForm.value)
      .subscribe((resp: any) => {
        if (resp.successful) {
          const errors = this.sharedLogicService.hasDestinationAccountErrors(
            resp.responseObject
          );
          if (errors) {
            this.sharedLogicService.triggerErrorToast(errors);
          } else {
            this.confirmChequeInfo();
          }
        } else {
          this.sharedLogicService.triggerErrorToast(
            'Unable to validate send money details'
          );
        }
      });
  }

  private confirmChequeInfo() {
    const sendToOwnAccForm = this.sendToOwnAccountForm.value;
    const chequeData = sendToOwnAccForm.AdditionalDetails;
    if (
      !chequeData['instrumentType'] ||
      chequeData['instrumentType'] === 'NA' ||
      !chequeData['instrumentDate'] ||
      !chequeData['instrumentNumber']
    ) {
      this.gotoNext();
      return;
    }
    if (chequeData['instrumentType'] === 'ICH') {
      this.gotoNext();
      return;
    }
    const payload = {
      BankID: this.existingCustomerDetails.bankID,
      InstrumentDate: this.sharedLogicService.generateDate(
        chequeData['instrumentDate']
      ),
      InstrumentType: chequeData['instrumentType'],
      InstrumentNum: chequeData['instrumentNumber'],
      AccountNumber: this.selectedDebitAccount.accountNumber,
    };
    this.moveMoneyService
      .validateInstrumentNumber(payload, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: dat => {
          if (
            dat.successful === true &&
            dat?.responseObject.status === 'UnUsed'
          ) {
            this.sharedLogicService.triggerSuccessToast(
              'MOVE-MONEY.SECTIONS.TOAST.VALID-INSTRUMENT-NUMBER',
              true
            );
            this.gotoNext();
            //do nothing as the cheque is valid
          } else {
            const errorMessage =
              dat?.responseObject.status === 'Passed'
                ? 'MOVE-MONEY.SECTIONS.ADDITIONAL-DETAILS.FIELDS.ERRORS.INSTRUMENT-NUMBER-USED'
                : 'MOVE-MONEY.SECTIONS.GENERAL.ERROR';

            this.sharedLogicService.triggerErrorToast(errorMessage, true);
          }
        },
        error: err => {
          this.sharedLogicService.triggerErrorToast(
            'MOVE-MONEY.SECTIONS.GENERAL.ERROR',
            true
          );
        },
      });
  }

  private validateCreditAccount(data: any[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const selectedValue = control.value;
      let exists = data.some(dat => dat.accountNumber === selectedValue);
      if (exists) {
        const debitAccount =
          this.DebitAccountDetailsForm.get('accountNumber')?.value;
        if (selectedValue === debitAccount) {
          return { matchesDebitAccount: true };
        } else {
          return null;
        }
      } else {
        return { invalidAccountNumber: true };
      }
    };
  }

  private getRequiredMoveMoneyDocsPayload(): MoveMoneyDocRequestPayloadT {
    const customerDetails = JSON.parse(
      <string>localStorage.getItem('customerDetails')
    );
    const sendMoneyDetails = this.sendToOwnAccountForm.value;
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

  private updatePossibleBeneficiaryAccounts(accNum: string) {
    this.validBeneficiaryAccounts = this.allAccounts.filter(
      account => String(account.accountNumber) !== String(accNum)
    );
  }

  private updatePossibleDebitAccounts(accNum: string) {
    this.allAccounts = this.allAccountsForCustomer.filter(
      account => String(account.accountNumber) !== String(accNum)
    );
  }

  resetValidators(typ?: string) {
    const amountInput = this.sendToOwnAccountForm?.get('PaymentDetails.amount');
    if (typ === 'converted') {
      amountInput?.setErrors(null);
    }
  }
}

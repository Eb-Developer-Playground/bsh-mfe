import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
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

import { AccountMgt } from '@app/shared/models/common/account.model';

import { TranslateService } from '@ngx-translate/core';
import { MoveMoneyService } from '@app/core/services/move-money/move-money.service';
import { OnSave, StepperChildComponent } from '@app/shared/modules/stepper';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { MmDebitAccountComponent } from '../../../shared/mm-debit-account/mm-debit-account.component';
import { MmLocalBeneficiaryAccountComponent } from '../mm-local-beneficiary-account/mm-local-beneficiary-account.component';
import { MmPaymentDetailsComponent } from '../../../shared/mm-payment-details/mm-payment-details.component';
import { MmNarrationComponent } from '../../../shared/mm-narration/mm-narration.component';
import { MmAdditionalDelailsComponent } from '../../../shared/mm-additional-delails/mm-additional-delails.component';
import { MmAdditionalDocumentsComponent } from '../../../shared/mm-additional-documents/mm-additional-documents.component';
import { CollapsibleComponent } from '@app/shared/modules/collapsible-section';

@Component({
  selector: 'app-transfer-details',
  templateUrl: './transfer-details.component.html',
  styleUrl: './transfer-details.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [TranslatePipe, ReactiveFormsModule, MmDebitAccountComponent, MmLocalBeneficiaryAccountComponent, MmPaymentDetailsComponent, MmNarrationComponent, MmAdditionalDelailsComponent, MmAdditionalDocumentsComponent, CollapsibleComponent],
})
export class TransferDetailsComponent
  extends StepperChildComponent
  implements OnInit, OnDestroy, OnSave
{
  sendToEquityAccountForm!: UntypedFormGroup;
  destroy$: Subject<any> = new Subject<any>();

  existingCustomerDetails = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );

  selectedDebitAccount = JSON.parse(
    <string>localStorage.getItem('selectedAccount')
  );
  selectedBenefactorAccount!: AccountMgt.Account;

  allAccounts: AccountMgt.Account[] = this.existingCustomerDetails.accounts;

  exchangeRates: any = null;
  availableCurrencies: string[] = [];
  lockedForm: boolean = false;

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

  get AdditionalDocumentsForm(): UntypedFormGroup {
    return <UntypedFormGroup>(
      this.sendToEquityAccountForm.get?.('AdditionalDocuments')
    );
  }

  constructor(
    public translateService: TranslateService,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private moveMoneyService: MoveMoneyService
  ) {
    super();
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

  lockFormFields(locked: boolean) {
    this.lockedForm = locked;
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
        accountholderName: [null, [Validators.required]],
        bankName: [null, [Validators.required]],
        branchName: [null, [Validators.required]],
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
            (control: AbstractControl) =>
              Validators.max(
                parseFloat(
                  this.selectedDebitAccount.availableBalance.replace(/,/g, '.')
                )
              )(control),
          ],
        ],
        transactionType: 'OwnAccount',
        transferType: 'OwnAccount,',
        reason: [null, [Validators.required]],
        ticketNumber: [null],
        dateCreated: [null],
        rateCode: ['TTS'],
        exchangeRate: ['1'],
        baseExchangeRate: ['1'],
        convertedAmount: [null],
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

  onSave() {
    // let payload = {
    //   amount: this.PaymentDetailsForm.get('amount')?.value,
    //   currency: this.PaymentDetailsForm.get('currency')?.value,
    //   sourceAccount: this.DebitAccountDetailsForm.get('accountNumber')?.value,
    // };
    // this.moveMoneyService
    //   .checkMoveMoneyAmount(payload)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(resp => {
    //     if (resp.successful && resp.responseObject.documentNeeded === false) {
    //       this.AdditionalDocumentsForm.get('required')?.patchValue(false);
    //       this.getTransferFees();
    //     } else {
    //       this.AdditionalDocumentsForm.get('required')?.patchValue(true);
    //       if (this.AdditionalDocumentsForm.get('documents')?.value.length > 0) {
    //         this.getTransferFees();
    //       } else {
    //         // TODO - ERROR MESSAGE AND SET VALIDATION ON DOCUMENTS
    //       }
    //     }
    //   });
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
}

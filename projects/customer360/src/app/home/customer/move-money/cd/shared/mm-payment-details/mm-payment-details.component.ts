import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil,
} from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { MoveMoneyService } from '@app/core/services/move-money/move-money.service';

import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import {
  exchangeRates,
  specialCodeState,
  SpecialRateObjT,
} from '../../../models/move-money-services.model';
import { AccountMgt } from '@app/shared/models/common/account.model';
import { TranslatePipe } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransformCurrencyPipe } from '@app/shared/pipes/transform-currency.pipe';
import { NoScrollInputDirective } from '@app/shared/directives/no-scroll-input.directive';
import { PreventMinusSignDirective } from '@app/shared/directives/prevent-minus-sign.directive';
@Component({
  selector: 'app-mm-payment-details',
  templateUrl: './mm-payment-details.component.html',
  styleUrl: './mm-payment-details.component.scss',
  imports: [TranslatePipe, AsyncPipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatIconModule, MatButtonModule, TransformCurrencyPipe, NoScrollInputDirective, PreventMinusSignDirective],
})
export class MmPaymentDetailsComponent implements OnChanges, OnDestroy {
  @Input() form!: FormGroup;
  @Input() exchangeDetailsForm!: FormGroup;
  @Input() bankID: number = 43;
  @Input() CIF: string = '';
  @Input() hasMaxError: boolean = false;
  @Input() debitAccount!: AccountMgt.Account;
  @Input() creditAccount!: AccountMgt.Account;
  @Output() lockFields: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() updateIsProcessing: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  availableCurrency!: Observable<string[]>;
  currencyOptions: any[] = [];
  exchangeRates!: exchangeRates[];
  rate!: exchangeRates | null;
  convertedAmount: Subject<any> = new BehaviorSubject<any>(0);
  selectedCurrency!: string;
  calculatingExchangeRate = false;
  lockedForm: boolean = false;

  flagCountryMappings: any = {
    CDF: {
      flag: 'ic-flag-drc',
      currencyName: 'Congolese Franc',
    },
    USD: {
      flag: 'ic-flag-usa',
      currencyName: 'US dollars',
    },
    EUR: {
      flag: 'ic-flag-euro',
      currencyName: 'European Union',
    },
  };
  specialCodeStatus = specialCodeState.undefined;

  specialRate: SpecialRateObjT | null = null;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private moveMoneyService: MoveMoneyService,
    private changeDetectorRef: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.selectedCurrency = this.form.controls['currency'].value;
    this.changeDetectorRef.detectChanges();
    this.getGeneralExchangeRates();
    this.setSubscriptions();
    this.configureCurrencies();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  setSubscriptions() {
    this.form.controls['currency'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(dat => {
        if (!dat || this.lockedForm) return;

        this.availableCurrency = of(this._filterCurrency(dat));

        this.selectedCurrency = dat;
        this.calculateExchangeRate();
        this.getLatestExchangeRate(this.form.controls['amount'].value);

        this.validateDataWithSpecialRates();
      });

    this.form.controls['amount'].valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe((amount: number) => {
        if (!amount || this.lockedForm) return;
        this.getLatestExchangeRate(amount);
        this.validateDataWithSpecialRates();
      });

    this.form.controls['ticketNumber'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(dat => {
        if (!dat || this.lockedForm) {
          return;
        }

        if (dat.length === 0) {
          this.specialCodeStatus = specialCodeState.undefined;
        }
      });
  }

  getGeneralExchangeRates() {
    this.calculatingExchangeRate = true;
    this.moveMoneyService
      .getRateList(this.generateTodaysDate(), this.bankID)
      .pipe(
        finalize(() => {
          this.calculatingExchangeRate = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(resp => {
        if (resp.successful === true) {
          this.exchangeRates = resp.responseObject;
          this.calculateExchangeRate();
        } else {
          this.toastService.show(
            resp.statusMessage ||
              'Error occurred while retrieving exchange rates',
            '',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
      });
  }

  getLatestExchangeRate(amount: number) {
    if (amount <= 0 || this.currencyOptions.length <= 1) {
      return;
    }
    const payload = {
      accountNumber: this.debitAccount.accountNumber,
      fromCurrency:
        this.selectedCurrency === this.currencyOptions[0]
          ? this.currencyOptions[0]
          : this.currencyOptions[1],
      toCurrency:
        this.selectedCurrency === this.currencyOptions[0]
          ? this.currencyOptions[1]
          : this.currencyOptions[0],
      fromAmount: amount,
      bankId: this.bankID,
    };
    this.calculatingExchangeRate = true;
    this.updateIsProcessing.emit(true);
    this.moveMoneyService
      .getExchangeRates(payload, true)
      .pipe(
        finalize(() => {
          this.calculatingExchangeRate = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(resp => {
        this.updateIsProcessing.emit(false);
        if (!resp.responseObject) {
          this.toastService.show(
            resp.statusMessage ||
              'Error occurred while retrieving exchange rate',
            '',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
          return;
        }
        const toUpdate = [
          { key: 'RateCode', value: resp.responseObject.rateCode },
          {
            key: 'ConvertedAmount',
            value: resp.responseObject.convertedAmount,
          },
          {
            key: 'ConvertedCurrency',
            value: this.creditAccount.accountCurrency,
          },
          { key: 'ExchangeRate', value: resp.responseObject.rate },
          { key: 'BaseExchangeRate', value: resp.responseObject.rate },
          { key: 'TreasuryRate', value: resp.responseObject.rate },
          { key: 'isSpecial', value: false },
        ];
        this.updateExchangeDetailsForm(toUpdate);

        if (this.rate) {
          this.rate.rate = resp.responseObject.rate;
          this.rate.rateCode = resp.responseObject.rateCode;
          this.setExchangeRates(this.rate);
          this.form.controls['convertedAmount'].patchValue(
            resp.responseObject.convertedAmount
          );
          this.convertedAmount.next(resp.responseObject.convertedAmount);
        }
      });
  }

  calculateExchangeRate() {
    if (!this.exchangeRates || this.currencyOptions?.length <= 1) {
      return;
    }
    const unselectedCurrency =
      this.selectedCurrency === this.currencyOptions[0]
        ? this.currencyOptions[1]
        : this.currencyOptions[0];
    this.updateActiveRate(this.selectedCurrency, unselectedCurrency);
    this.triggerExchangeRateCalculation();
  }

  triggerExchangeRateCalculation() {
    if (!this.exchangeRates) {
      this.getGeneralExchangeRates();
    }
    if (
      this.form.controls['amount'].status === 'INVALID' &&
      this.form.controls['amount'].dirty
    ) {
      this.toastService.show(
        'Ensure you have added the correct amount to send',
        '',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
    } else {
      if (!this.form.controls['amount'].value) return;
      this.getLatestExchangeRate(this.form.controls['amount'].value);
    }
  }

  clearExchangeTicket() {
    this.lockFields.emit(false);
    this.lockedForm = false;
    this.clearSpecialRate();
  }

  submitExchangeTicket() {
    const payload = {
      RefNo: this.form.controls['ticketNumber'].value,
      Cif: this.CIF,
      BankID: this.bankID,
    };
    this.specialCodeStatus = specialCodeState.undefined;
    this.moveMoneyService.getSpecialExchangeRates(payload).subscribe(resp => {
      if (!resp.successful || resp.responseObject === null) {
        this.specialCodeStatus = specialCodeState.declined;
        this.changeDetectorRef.detectChanges();
        this.toastService.show(
          resp.statusMessage,
          '',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          false
        );
      } else {
        // if (
        //   !this.validateSpecialRateCodeType(resp.responseObject.dealRateCode)
        // ) {
        //   return;
        // }
        this.toastService.show(
          'Success',
          'Special rate code is valid',
          MessageBoxType.SUCCESS,
          5000,
          undefined,
          undefined,
          false
        );
        if (resp.responseObject.dealRateCode === 'TTS') {
          this.setupTTSValidation(resp.responseObject);
        } else {
          this.setupTTBValidation(resp.responseObject);
        }

        this.validateDataWithSpecialRates();
      }
    });
  }
  validateDataWithSpecialRates() {
    if (!this.specialRate) {
      this.specialRate = null;
      return;
    }
    let errorType = null;

    this.form.controls['amount'].setValue(this.specialRate.dealAmount);

    if (this.currencyOptions.length === 1) {
      this.showRateError('SPECIAL-RATE-SINGLE-CURRENCY', '');
      this.clearSpecialRate();
      return;
    } else {
      if (
        this.form.controls['currency']?.value !== this.specialRate.dealCurrency
      ) {
        this.showRateError(
          'SPECIAL-RATE-FROM-CURRENCY',
          this.specialRate.dealCurrency
        );
        this.clearSpecialRate();
        return;
      }

      const toCurrency =
        this.selectedCurrency === this.currencyOptions[0]
          ? this.currencyOptions[1]
          : this.currencyOptions[0];
      if (toCurrency !== this.specialRate.dealCurrencyTo) {
        this.showRateError(
          'SPECIAL-RATE-TO-CURRENCY',
          this.specialRate.dealAmountTo
        );
        this.clearSpecialRate();
        return;
      }
    }
    this.lockRateCodeFields();
  }

  showRateError(msg: string, value: any): void {
    this.toastService.show(
      'MOVE-MONEY.SECTIONS.PAYMENT-DETAILS.FIELDS.ERRORS.SPECIAL-RATE-TITLE',
      `MOVE-MONEY.SECTIONS.PAYMENT-DETAILS.FIELDS.ERRORS.${msg}`,
      MessageBoxType.DANGER,
      5000,
      '',
      () => {},
      true,
      true,
      {
        value,
      }
    );
  }

  lockRateCodeFields() {
    if (!this.specialRate) return;
    this.form.controls['convertedAmount'].patchValue(
      this.specialRate.dealAmountTo
    );

    this.form.controls['exchangeRate'].patchValue(this.specialRate.dealRate);
    this.form.controls['rateCode'].patchValue(this.specialRate.dealRateCode);
    this.updateExchangeDetailsForm([
      { key: 'RateCode', value: this.specialRate.dealRateCode },
      { key: 'ExchangeRate', value: this.specialRate.treasuryRate },
      { key: 'BaseExchangeRate', value: this.specialRate.treasuryRate },
      { key: 'TreasuryRate', value: this.specialRate.dealRate },
      { key: 'ConvertedCurrency', value: this.specialRate.toCurrency },
      { key: 'ConvertedAmount', value: this.specialRate.dealAmountTo },
      { key: 'isSpecial', value: true },
    ]);
    this.convertedAmount.next(this.specialRate.dealAmountTo);

    this.lockedForm = true;
    this.lockFields.emit(true);
  }

  unlockRateCodeFields() {
    this.lockedForm = false;
    this.lockFields.emit(false);
  }

  resetExchangeRates() {
    this.rate = null;
    this.form.controls['currency'].patchValue(
      this.debitAccount.accountCurrency
    );
    this.form.controls['baseExchangeRate'].patchValue(1);
    this.form.controls['exchangeRate'].patchValue(1);
    this.form.controls['convertedAmount'].patchValue(
      this.form.controls['amount'].value
    );
  }

  setExchangeRates(exRate: any) {
    this.form.controls['baseExchangeRate'].patchValue(exRate.rate);
    this.form.controls['exchangeRate'].patchValue(exRate.rate);
  }

  configureCurrencies() {
    let options = new Set();
    if (this.debitAccount) {
      options.add(this.debitAccount.accountCurrency);
    }
    if (this.creditAccount) {
      options.add(this.creditAccount.accountCurrency);
    }
    this.currencyOptions = Array.from(options);

    if (this.currencyOptions.length <= 1) {
      this.resetExchangeRates();
    } else {
      this.calculateExchangeRate();
    }
  }

  clearSpecialRate() {
    this.specialRate = null;
    this.specialCodeStatus = specialCodeState.undefined;
    this.form.controls['ticketNumber'].setValue('');
    this.getLatestExchangeRate(this.form.controls['amount'].value);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.clearSpecialRate();
    if (changes['creditAccount']) {
      this.creditAccount = changes['creditAccount'].currentValue;
      this.configureCurrencies();
    }

    if (changes['debitAccount']) {
      if (changes['debitAccount'].previousValue !== undefined) {
        this.forceInputRefresh('amount');
      }
      this.debitAccount = changes['debitAccount'].currentValue;
      this.configureCurrencies();
    }

    if (changes['currencyOptions']) {
      this.availableCurrency = of(changes['currencyOptions'].currentValue);
      this.selectedCurrency = changes['currencyOptions'].currentValue[0];

      if (changes['currencyOptions'].currentValue.length < 2) {
        this.resetExchangeRates();
      } else {
        this.calculateExchangeRate();
      }
    }
  }

  private forceInputRefresh(field: string) {
    this.form.controls[field].setValue(this.form.controls[field].value);
  }

  private generateTodaysDate(): string {
    const rightNow = new Date();
    return rightNow.toISOString().slice(0, 10).split('-').reverse().join('');
  }

  private _filterCurrency(value: string): string[] {
    if (this.currencyOptions.length === 0) return [];
    return this.currencyOptions;
  }

  //corrects the backend api for TTS and TTB
  private setupTTSValidation(responseObj: SpecialRateObjT) {
    this.specialRate = {
      ...responseObj,
      dealAmountTo: responseObj.dealAmount,
      dealCurrencyTo: responseObj.dealCurrency,
      dealAmount: responseObj.dealAmountTo,
      dealCurrency: responseObj.dealCurrencyTo,
    };
  }
  private setupTTBValidation(responseObj: SpecialRateObjT) {
    this.specialRate = responseObj;
  }

  private updateExchangeDetailsForm(
    data: { key: string; value: string | boolean }[]
  ) {
    data.forEach(dataItem => {
      this.exchangeDetailsForm.controls[dataItem.key].patchValue(
        dataItem.value
      );
    });
  }

  get isSameCurrency() {
    const debitCurrency = this.creditAccount?.accountCurrency;
    const creditCurrency = this.debitAccount?.accountCurrency;
    if (!debitCurrency || !creditCurrency) return true;
    return debitCurrency === creditCurrency;
  }

  updateActiveRate(from: string, to: string) {
    let rateType = 'TTB';
    let fromCurrency = from;
    let toCurrency = to;
    if (from === 'CDF' || to === 'EUR') {
      rateType = 'TTS';
      fromCurrency = to;
      toCurrency = from;
    }
    let rate = this.exchangeRates.find(item => {
      return (
        item.fromCurrency === fromCurrency &&
        item.toCurrency === toCurrency &&
        item.rateCode === rateType
      );
    });
    if (rate) {
      this.rate = rate;
      this.setExchangeRates(rate);
    }
  }

  get amountErrors() {
    const amount = this.form.controls['amount']?.errors?.['max'];
    const convertedAmount = this.form.controls['convertedAmount']?.errors?.['max'];
    const currency = this.form.controls['currency']?.errors?.['max'];
    return amount || convertedAmount || currency || '';
  }
  getDocInfo() {
    // this.moveMoneyService.getMoveMoneyDocInfo().subscribe(resp => {
    //   console.log('resp', resp);
    // });
  }
}

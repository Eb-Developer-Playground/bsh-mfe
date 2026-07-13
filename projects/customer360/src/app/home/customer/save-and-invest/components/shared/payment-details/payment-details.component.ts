import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
import { SaveAndInvestService } from 'src/app/core/services/save-and-invest/save-and-invest.service';
import { SaveAndInvest } from 'src/app/shared/models/save-and-invest/save-and-invest.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { GenericErrorStateMatcher } from 'src/app/shared/utils/genericErrorStateMatcher';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe,
    CurrencyMaskModule,
  ],
})
export class PaymentDetailsComponent implements OnInit, AfterViewInit {
  @Input() form!: UntypedFormGroup;
  @Input() customerActiveAccounts!: any;
  @Input() savingsDetails!: any;
  creationType!: string;

  minDate = new Date();
  public matcher = new GenericErrorStateMatcher();
  dayOrMonthOptions: any;
  frequency!: any;
  constructor(private saveAndInvestService: SaveAndInvestService) {}

  ngOnInit(): void {
    this.creationType = this.savingsDetails?.type;
    this.updateAccountNumber();

    // eslint-disable-next-line no-prototype-builtins
    if (this.savingsDetails?.hasOwnProperty('formData')) {
      if (this.creationType === 'call') {
        this.createdayOrMonthOptions(this.savingsDetails.formData.frequency);
        this.validateRequiredFields(this.savingsDetails.formData.paymentType);

        this.form.controls['frequency'].valueChanges
          .pipe(distinctUntilChanged())
          .subscribe(() => {
            this.form.controls['dayOrMonth'].setValue('');
            this.form.controls['dayOrMonth'].setValidators(Validators.required);
            this.form.updateValueAndValidity();
          });
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.creationType === 'call') {
      this.saveAndInvestService.populateCallProductDetails().subscribe(s => {
        this.frequency = s.responseObject
          .filter(
            x =>
              x.name.toLocaleLowerCase() == 'Weekly'.toLocaleLowerCase() ||
              x.name.toLocaleLowerCase() == 'Monthly'.toLocaleLowerCase() ||
              x.name.toLocaleLowerCase() == 'Quarterly'.toLocaleLowerCase()
          )
          .sort((a, b) => a.name.localeCompare(b.name));
        this.saveAndInvestService.SetFrequency(s);
      });

      this.form.controls['frequency'].valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(frequency => this.createdayOrMonthOptions(frequency));

      this.form.controls['paymentType'].valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(paymentType => {
          this.validateRequiredFields(paymentType);
        });
    }

    if (this.creationType === 'fixed') {
      this.form.controls['effectiveDate'].removeValidators(Validators.required);
      this.form.controls['effectiveDate'].setValue(null);
      this.form.updateValueAndValidity();
    }

    //     const withdrawOrRollover = this.form.controls['withdrawOrRollover']
    //     if (withdrawOrRollover) {
    //         withdrawOrRollover.valueChanges
    //         .pipe()
    //         .subscribe(value => {
    //           if (value === 'rollover') {
    //             this.form.controls['effectiveDate'].removeValidators(Validators.required);
    //             this.form.controls['effectiveDate'].setValue(null);
    //         } else {
    //             this.form.controls['effectiveDate'].setValidators(Validators.required);
    //         }

    //           this.form.updateValueAndValidity();
    //           //this.getFormValidationErrors();
    //         }
    //       );
    // }
  }

  createdayOrMonthOptions = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return (this.dayOrMonthOptions = [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ]);
      case 'monthly':
        return (this.dayOrMonthOptions = [
          ...Array.from({ length: 29 }, (v, i) =>
            i === 1
              ? `${i.toString()}st`
              : i === 2
                ? `${i.toString()}nd`
                : i === 3
                  ? `${i.toString()}rd`
                  : `${i.toString()}th`
          ).slice(1, 29),
        ]);
      case 'quarterly':
        return (this.dayOrMonthOptions = [
          '1st month of quarter',
          '2nd month of quarter',
          '3rd month of quarter',
        ]);
      default:
        return this.dayOrMonthOptions;
    }
  };

  validateRequiredFields = (paymentType: string) => {
    let required: string[];
    let notRequired: string[];

    if (paymentType === 'one-time') {
      required = [];
      notRequired = [
        'frequency',
        'dayOrMonth',
        'savingAmount',
        'startDate',
        'endDate',
        'effectiveDate',
      ];
    } else {
      required = ['frequency', 'startDate', 'endDate', 'savingAmount'];
      notRequired = ['effectiveDate', 'dayOrMonth'];
    }

    Object.keys(this.form.controls).forEach(key => {
      if (notRequired.includes(key)) {
        this.form.controls[key].removeValidators(Validators.required);
        if (
          key === 'effectiveDate' ||
          key === 'dayOrMonth' ||
          key === 'startDate' ||
          key === 'endDate'
        ) {
          this.form.controls[key].setValue(null);
        } else {
          this.form.controls[key].setValue('');
        }
      }

      if (required.includes(key)) {
        this.form.controls[key].setValidators(Validators.required);
        if (key === 'endDate') {
          this.form.controls[key].addValidators(this.checkDates(this.form));
        }
      }

      this.form.controls[key].updateValueAndValidity();
    });
  };
  checkDates(group: UntypedFormGroup): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value < group.controls['startDate'].value) {
        return { notValid: true };
      }
      return null;
    };
  }

  updateAccountNumber = () => {
    this.form.patchValue({
      debitAccount: this.savingsDetails?.accountNumber,
    });
  };

  getFormValidationErrors() {
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {});
      }
    });
  }
}

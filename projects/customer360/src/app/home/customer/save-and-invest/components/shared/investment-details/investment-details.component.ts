import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { GenericErrorStateMatcher } from 'src/app/shared/utils/genericErrorStateMatcher';

@Component({
  selector: 'app-investment-details',
  templateUrl: './investment-details.component.html',
  styleUrls: ['./investment-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe,
    CurrencyMaskModule,
  ],
})
export class InvestmentDetailsComponent implements OnInit, AfterViewInit {
  @Input() form!: UntypedFormGroup;
  @Input() savingsDetails!: any;
  creationType!: string;
  minInitialAmount = 25000;
  maxInitialAmount!: number;
  minDate = new Date();
  public matcher = new GenericErrorStateMatcher();

  constructor() {}

  ngOnInit(): void {
    this.creationType = this.savingsDetails?.type;
    this.maxInitialAmount = this.savingsDetails.availableBalance;
  }

  ngAfterViewInit(): void {
    if (this.creationType === 'fixed') {
      this.form.controls['depositTerm'].valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(depositTerm => {
          if (depositTerm === 'custom') {
            this.form.controls['customTerm'].setValidators(Validators.required);
            this.form.controls['maturityDate'].setValue(null);
            // listen to custom value and set maturity date
            this.form.controls['customTerm'].valueChanges
              .pipe(distinctUntilChanged())
              .subscribe(customTerm => {
                // setting maturity date
                if (customTerm) {
                  const maturityDate = new Date();
                  maturityDate.setMonth(
                    maturityDate.getMonth() + Number(customTerm)
                  );
                  this.form.controls['maturityDate'].setValue(maturityDate);
                }
              });
          } else {
            this.form.controls['customTerm'].setValue('');
            this.form.controls['customTerm'].removeValidators(
              Validators.required
            );
            // setting maturity date
            const maturityDate = new Date();
            maturityDate.setMonth(
              maturityDate.getMonth() +
                Number(this.form.controls['depositTerm'].value)
            );
            this.form.controls['maturityDate'].setValue(maturityDate);
          }

          this.form.controls['customTerm'].updateValueAndValidity();
        });
    }
  }
}

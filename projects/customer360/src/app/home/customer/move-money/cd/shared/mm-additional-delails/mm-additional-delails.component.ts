import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';

import { MoveMoneyService } from '@app/core/services/move-money/move-money.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { MmSharedLogicService } from '@app/home/customer/move-money/cd/shared/mm-shared-logic.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-mm-additional-delails',
  templateUrl: './mm-additional-delails.component.html',
  styleUrl: './mm-additional-delails.component.scss',
  imports: [TranslatePipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
})
export class MmAdditionalDelailsComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() accountNumber: string = '';
  @Input() bankID: string = '';

  destroy$: Subject<any> = new Subject<any>();

  instrumentTypes = [
    { id: '', value: 'MOVE-MONEY.PLEASE-SELECT' },
    { id: 'CHQ', value: 'MOVE-MONEY.CHQ' },
    { id: 'ICH', value: 'MOVE-MONEY.ICH' },
  ];
  maxDate: Date;
  minDate: Date;

  constructor(
    private moveMoneyService: MoveMoneyService,
    private changeDetectorRef: ChangeDetectorRef,
    private sharedService: MmSharedLogicService
  ) {
    this.minDate = new Date(2000, 0, 1);
    this.maxDate = new Date();
  }

  ngOnInit() {
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  setupSubscriptions() {
    this.form.controls['instrumentNumber'].valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(2000),
        distinctUntilChanged()
      )
      .subscribe(dat => {
        this.validateAndSubmitInstrument();
      });
  }

  checkValidation() {
    this.configureValidation();
  }

  configureValidation() {
    let typeSelection =
      this.form.controls['instrumentType']?.value &&
      this.form.controls['instrumentType']?.value !== 'NA';

    if (
      typeSelection ||
      this.form.controls['instrumentDate']?.value ||
      this.form.controls['instrumentNumber']?.value
    ) {
      Object.keys(this.form.controls).forEach((key: string) => {
        const control = this.form.controls[key];
        control.addValidators(Validators.required);

        if (key === 'instrumentType') {
          control.addValidators([Validators.required, Validators.minLength(1)]);
        }

        control.updateValueAndValidity();
        control.markAsDirty();
        control.markAsTouched();
      });
    } else {
      Object.keys(this.form.controls).forEach((key: string) => {
        const control = this.form.controls[key];
        control.removeValidators(Validators.required);

        if (key === 'instrumentType') {
          control.removeValidators(Validators.minLength(1));
        }
        control.updateValueAndValidity();
      });
    }
  }

  validateAndSubmitInstrument() {
    if (
      !this.form.controls['instrumentType']?.value ||
      this.form.controls['instrumentType']?.value === 'NA' ||
      !this.form.controls['instrumentDate']?.value ||
      !this.form.controls['instrumentNumber']?.value
    ) {
      return;
    }
    if (this.isNotCheque()) return;

    const payload = {
      BankID: this.bankID,
      InstrumentDate: this.generateDate(
        this.form.controls['instrumentDate'].value
      ),
      InstrumentType: this.form.controls['instrumentType'].value,
      InstrumentNum: this.form.controls['instrumentNumber'].value,
      AccountNumber: this.accountNumber,
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
            this.sharedService.triggerSuccessToast(
              'MOVE-MONEY.SECTIONS.TOAST.VALID-INSTRUMENT-NUMBER',
              true
            );
            //do nothing as the cheque is valid
          } else {
            this.form.controls['instrumentNumber'].setErrors({
              invalidNumber: true,
            });
            const errorMessage =
              dat?.responseObject.status === 'Passed'
                ? 'MOVE-MONEY.SECTIONS.ADDITIONAL-DETAILS.FIELDS.ERRORS.INSTRUMENT-NUMBER-USED'
                : 'MOVE-MONEY.SECTIONS.GENERAL.ERROR';

            this.sharedService.triggerErrorToast(errorMessage, true);
          }
        },
        error: err => {
          this.form.controls['instrumentNumber'].setErrors({
            invalidNumber: true,
          });
          this.changeDetectorRef.detectChanges();
        },
      });
  }

  private generateDate(incomingDate: Date): string {
    return this.sharedService.generateDate(incomingDate);
  }

  private isNotCheque() {
    const instrumentType = this.form.controls['instrumentType'].value;
    return instrumentType === 'ICH';
  }
}

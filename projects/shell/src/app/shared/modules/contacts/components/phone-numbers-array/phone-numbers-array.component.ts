import {
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { IPhoneNumberFieldStates } from '@app/shared/models/customer/shared';
import { OTPInputViewMode } from '@app/shared/modules/contacts';
import { PhoneNumberComponent } from '@app/shared/modules/contacts/components/phone-number/phone-number.component';
import {
  DedupeOperationMode,
  OTPVerificationMode,
} from '@app/shared/modules/contacts/types';
import { PhoneNumbersValidator } from '@app/shared/modules/contacts/validators';
import { NotificationsModule } from '@app/shared/modules/notifications';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { validateCountryCode } from '@app/shared/validators/phone-code-validator';
import { validateKenyanPhoneNumber } from '@app/shared/validators/kenyan-phone-number-validator';
import { validatePhoneCityCode } from '@app/shared/validators/phone-city-code-validator';

@Component({
  selector: 'app-phone-numbers-array',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDividerModule,
    PhoneNumberComponent,
    NotificationsModule,
    TranslateModule,
  ],
  templateUrl: './phone-numbers-array.component.html',
  styleUrls: ['./phone-numbers-array.component.scss'],
})
export class PhoneNumbersArrayComponent implements OnInit, OnChanges {
  readonly _destroyRef = inject(DestroyRef);
  @Input() subsidiary!: ISubsidiary;
  @Input() parentForm!: UntypedFormGroup;
  @Input() parentFormControlName!: string;
  @Input() ticketId!: string;
  @Input() customerId!: string;
  @Input() fieldStates?: IPhoneNumberFieldStates[];
  @Input() enableMultiple!: boolean;
  @Input() otpInputViewMode!: OTPInputViewMode;
  @Input() otpVerificationMode!: OTPVerificationMode;
  @Input() dedupeOperationMode!: DedupeOperationMode;
  @Input() formArray: UntypedFormArray = this.fb.array([
    this.fb.group({
      id: [null],
      phoneType: ['', Validators.required],
      countryCode: ['', [Validators.required, validateCountryCode]],
      cityCode: [''],
      number: ['', [Validators.required]],
      comment: [''],
      isPreferred: [true],
      toBeDeleted: [false],
      isMandatory: [false],
      verified: [null],
      unique: [null],
    }),
  ]);
  @Input() required!: boolean;
  selectedPhoneTypes: string[] = [];

  constructor(private fb: UntypedFormBuilder) {}

  ngOnInit() {
    if (this.parentForm && this.parentFormControlName) {
      this.parentForm.addControl(this.parentFormControlName, this.formArray);
    }
    this.formArray.setValidators(PhoneNumbersValidator);
    this.formArray.updateValueAndValidity();
    this.formArray.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(_c => this.performChecks());
    this.performChecks();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fieldStates?.currentValue) {
      this.patchValues();
    }
  }

  getPhoneNumberForm(ind: number): UntypedFormGroup {
    return <UntypedFormGroup>this.formArray.at(ind);
  }

  getPhoneNumberState(ind: number): any {
    return this.fieldStates?.[ind];
  }

  isPhoneReadOnly(ind: number): boolean {
    const phone = this.getPhoneNumberState(ind);
    return (
      phone?.countryCode?.readonly &&
      phone?.cityCode?.readonly &&
      phone?.number?.readonly &&
      phone?.type?.readonly
    );
  }

  performChecks(): void {
    this.selectedPhoneTypes = this.formArray.controls.map(
      (_i, ind) => this.formArray.at(ind).get('phoneType')?.value
    );
  }

  preferredNumberToggled(isTrue: boolean, ind: number) {
    if (isTrue) {
      this.formArray.controls.forEach((_v, i) => {
        if (ind !== i) this.formArray.at(i).get('isPreferred')?.setValue(false);
      });
    }
  }

  addPhoneNumber(): void {
    this.formArray.push(
      this.fb.group({
        id: [null],
        phoneType: ['', Validators.required],
        countryCode: ['', [Validators.required, validateCountryCode]],
        cityCode: ['', validatePhoneCityCode],
        number: ['', [Validators.required, validateKenyanPhoneNumber]],
        comment: [''],
        isPreferred: [false],
        toBeDeleted: [false],
        isMandatory: [false],
        verified: [null],
        unique: [null],
      })
    );
  }

  removePhoneNumber(ind: number): void {
    this.formArray.removeAt(ind);
    const hasPreferredPhone = this.formArray.controls
      .map((_i, ind) => this.formArray.at(ind).get('isPreferred')?.value)
      .some(i => i === true);
    if (!hasPreferredPhone)
      this.formArray.at(0)?.get('isPreferred')?.setValue(true);
  }

  patchValues(): void {
    if (this.fieldStates) {
      this.fieldStates.forEach((_ph, ind) => {
        if (!this.formArray.at(ind)) {
          this.addPhoneNumber();
        }
      });
      this.performChecks();
    }
  }
}

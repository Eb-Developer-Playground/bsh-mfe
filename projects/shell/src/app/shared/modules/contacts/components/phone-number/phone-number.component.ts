import { NgClass } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IPhoneNumberFieldStates } from '@app/shared/models/customer/shared';
import { OTPInputViewMode } from '@app/shared/modules/contacts';
import { IContactDedupeItem } from '@app/shared/modules/contacts/fields/phone-number/types';
import {
  DedupeOperationMode,
  OTPVerificationMode,
} from '@app/shared/modules/contacts/types';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { SessionService } from '@app/shared/services/session/session.service';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { combineLatest } from 'rxjs';
import { ContactsService } from '../../contacts.service';
import { PhoneType } from '../../models';
import { PhoneNumberGroupComponent } from './phone-number-group/phone-number-group.component';
import { PhoneOtpSection } from './phone-otp-section/phone-otp-section.component';
import { validateCountryCode } from '@app/shared/validators/phone-code-validator';

interface IPhone {
  countryCode?: any;
  cityCode?: any;
  number?: any;
  [key: string]: any;
}

@Component({
  selector: 'app-phone-number',
  imports: [
    NgClass,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
    PhoneOtpSection,
    PhoneNumberGroupComponent,
    TranslatePipe,
  ],
  templateUrl: './phone-number.component.html',
  styleUrls: ['./phone-number.component.scss'],
})
export class PhoneNumberComponent implements OnInit, OnChanges {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _translate = inject(TranslateService);
  private readonly toast = inject(ToastService);
  protected readonly OTPInputViewMode = OTPInputViewMode;
  @Input() subsidiary!: ISubsidiary;
  @ViewChild('otpInputComponent') otpComponent!: PhoneOtpSection;
  @Output() preferredToggled: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Input() parentForm!: UntypedFormGroup;
  @Input() parentFormControlName!: string;
  @Input() fieldStates!: IPhoneNumberFieldStates;
  @Input() otpInputViewMode: OTPInputViewMode = OTPInputViewMode.NEVER;
  @Input() otpVerificationMode: OTPVerificationMode = OTPVerificationMode.NEVER;
  @Input() dedupeOperationMode: DedupeOperationMode = DedupeOperationMode.NEVER;
  @Input() enableMultiple!: boolean;
  @Input() customerId!: string;
  @Input() ticketId!: string;
  @Input() index!: number;
  @Input() readonly?: boolean;
  @Input() selectedTypes: string[] = [];
  @Input() label: string = '';
  @Input() form!: UntypedFormGroup;
  @Input() required!: boolean;
  dedupeMatches: IContactDedupeItem[] = [];
  showOtpInput!: boolean;
  enableVerification!: boolean;
  phoneTypes: PhoneType[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private session: SessionService,
    private service: ContactsService
  ) {
    this.form = this.fb.group({
      id: [null],
      phoneType: [null, Validators.required],
      countryCode: [null, [Validators.required, validateCountryCode]],
      cityCode: [null],
      number: [null, [Validators.required]],
      comment: [null],
      isPreferred: [true],
      toBeDeleted: [false],
      verified: [null],
      unique: [null],
    });
  }

  get title(): string {
    if (this.index === 0) {
      return 'COMMON.PHONE_SECTION.PRIMARY_PHONE';
    } else if (this.index === 1) {
      return 'COMMON.PHONE_SECTION.SECONDARY_PHONE';
    } else if (this.index > 1) {
      return 'COMMON.PHONE_SECTION.ALTERNATIVE_PHONE';
    }
    return 'COMMON.PHONE_SECTION.PHONE_NUMBER';
  }

  ngOnInit(): void {
    this.showOtpInput = this.otpInputViewMode === OTPInputViewMode.ALWAYS;
    this.enableVerification =
      this.otpVerificationMode === OTPVerificationMode.ALWAYS;
    if (this.parentForm && this.parentFormControlName) {
      this.parentForm.addControl(this.parentFormControlName, this.form);
    }
    combineLatest([
      this.form.controls['countryCode'].valueChanges,
      this.form.controls['cityCode'].valueChanges,
      this.form.controls['number'].valueChanges,
    ])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(([countryCode, cityCode, number]) => {
        // const {countryCode, cityCode, number} = this.form.getRawValue();
        const localFormat = `${cityCode}${number}`; // Temp work around as form.valid seems not to work
        if (localFormat.length >= 9) {
          const phoneNumber = `${countryCode}${cityCode || ''}${number}`;
          if (
            [
              DedupeOperationMode.ALWAYS,
              DedupeOperationMode.PREVENT_MATCHES,
            ].includes(this.dedupeOperationMode)
          ) {
            this.toast.show(
              null,
              this._translate.instant(
                `FORMS.CONTACT_DETAILS.ERRORS.DEDUPE_MESSAGE`,
                {
                  contact: phoneNumber,
                }
              ),
              MessageBoxType.INFO
            );
            this.service
              .performPhoneNumberDedupe(phoneNumber)
              .subscribe(hits => {
                this.dedupeMatches = hits;
                this.enableVerification =
                  hits.length > 0 &&
                  this.otpVerificationMode ===
                    OTPVerificationMode.ON_DEDUPE_MATCH;
                this.showOtpInput =
                  hits.length > 0 &&
                  this.otpVerificationMode ===
                    OTPVerificationMode.ON_DEDUPE_MATCH;
                if (
                  this.dedupeOperationMode ===
                  DedupeOperationMode.PREVENT_MATCHES
                ) {
                  const control = this.form.get('unique');
                  if (hits.length > 0) {
                    control?.addValidators(Validators.requiredTrue);
                  } else {
                    control?.clearValidators();
                  }
                  control?.updateValueAndValidity();
                  this.form.updateValueAndValidity();
                }
              });
          }
          if (
            this.otpVerificationMode === OTPVerificationMode.ON_STATE_CHANGE
          ) {
            this.toggleVerification();
          }
        }
      });
    this.service.getPhoneTypes(this.subsidiary).subscribe(phoneTypes => {
      this.phoneTypes = phoneTypes;
      this.form
        .get('isPreferred')
        ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(ch => this.preferredToggled.emit(ch));
      if (!this.form.get('countryCode')!.value)
        this.form.patchValue({
          countryCode: this.session.subsidiary.dialCode,
        });
      this.toggleVerification();
      this.form.valueChanges
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => this.toggleVerification());
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['fieldStates']?.currentValue) {
      this.toggleVerification();
      this.patchValues();
    }
  }

  toggleVerification(): void {
    if (this.otpInputViewMode === OTPInputViewMode.ONCHANGE) {
      let initial = null;
      if (this.fieldStates) {
        initial = {
          countryCode: this.fieldStates.countryCode?.value,
          cityCode: this.fieldStates.cityCode?.value,
          number: this.fieldStates.number?.value,
          isPreferred: this.fieldStates.isPreferred?.value,
          phoneType: this.fieldStates.phoneType?.value,
        };
      }
      this.showOtpInput = this.numberChanged(initial, this.form.getRawValue());
      this.enableVerification =
        this.numberChanged(initial, this.form.getRawValue()) &&
        this.otpVerificationMode === OTPVerificationMode.ON_STATE_CHANGE;
    }
  }

  numberChanged(initial: IPhone | null, current: IPhone) {
    if (!initial && this.otpInputViewMode === OTPInputViewMode.ONCHANGE)
      return true;
    if (!!initial?.countryCode && !!current.countryCode)
      if (initial.countryCode !== current.countryCode) return true;
    if (!!initial?.cityCode && !!current.cityCode)
      if (initial.cityCode !== current.cityCode) return true;
    if (!!initial?.number && !!current.number)
      if (initial.number !== current.number) return true;
    return false;
  }

  patchValues(): void {
    if (this.fieldStates) {
      this.form.controls['phoneType'].setValue(null);
      this.form.patchValue({
        id: this.fieldStates.id?.value,
        countryCode: this.fieldStates.countryCode?.value,
        phoneType: this.fieldStates.phoneType?.value,
        cityCode: this.fieldStates.cityCode?.value,
        number: this.fieldStates.number?.value,
        comment: this.fieldStates.comment?.value,
        isPreferred: this.fieldStates.isPreferred?.value,
      });
    }
  }
}

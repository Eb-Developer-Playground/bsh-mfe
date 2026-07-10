import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {
  EmailsArrayComponent,
  PhoneNumbersArrayComponent,
} from '@app/shared/modules/contacts/components';
import {
  DedupeOperationMode,
  OTPInputViewMode,
  OTPVerificationMode,
} from '@app/shared/modules/contacts/types';
import { IContactDetailsFieldStates } from '../../models/customer/individual-fieldstates';
import { ISubsidiary } from '../../services/session/session.service';
import { ContactsService } from './contacts.service';
import { validateCountryCode } from '@app/shared/validators/phone-code-validator';
import { validateEmail } from '@app/shared/validators/email-validator';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    MatCardModule,
    NgTemplateOutlet,
    EmailsArrayComponent,
    PhoneNumbersArrayComponent,
  ],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {
  @Input() subsidiary!: ISubsidiary;
  @Input() contentOnly: boolean = true;
  @Input() enableMultiple: boolean = true;
  @Input() enableMultipleEmails: boolean = true;
  @Input() enableMultiplePhones: boolean = true;
  @Input() otpInputViewMode!: OTPInputViewMode;
  @Input() phoneOtpInputViewMode!: OTPInputViewMode;
  @Input() emailOtpInputViewMode!: OTPInputViewMode;
  @Input() otpVerificationMode!: OTPVerificationMode;
  @Input() phoneOTPVerificationMode!: OTPVerificationMode;
  @Input() emailOTPVerificationMode!: OTPVerificationMode;
  @Input() dedupeOperationMode!: DedupeOperationMode;
  @Input() phoneDedupeOperationMode!: DedupeOperationMode;
  @Input() emailDedupeOperationMode!: DedupeOperationMode;
  @Input() ticketId!: string;
  @Input() customerId!: string;
  @Input() parentForm!: UntypedFormGroup;
  @Input() parentPhoneNumbersFormControlName!: string;
  @Input() parentEmailAddressesFormControlName!: string;
  @Input() phoneNumbersForm: UntypedFormArray = this.fb.array([
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
  @Input() emailAddressesForm: UntypedFormArray = this.fb.array([
    this.fb.group({
      id: [null],
      emailType: ['', Validators.required],
      emailAddress: ['', [Validators.required, validateEmail]],
      comment: ['', Validators.minLength(3)],
      isPreferred: [true],
      toBeDeleted: [false],
      isMandatory: [false],
      verified: [null],
      unique: [null],
    }),
  ]);
  @Input() fieldStates!: IContactDetailsFieldStates;
  @Input() required: boolean = true;

  constructor(
    private fb: UntypedFormBuilder,
    public service: ContactsService
  ) {}

  ngOnInit(): void {
    if (this.parentForm && this.parentPhoneNumbersFormControlName) {
      this.parentForm.addControl(
        this.parentPhoneNumbersFormControlName,
        this.phoneNumbersForm
      );
    }
    if (this.parentForm && this.parentEmailAddressesFormControlName) {
      this.parentForm.addControl(
        this.parentEmailAddressesFormControlName,
        this.emailAddressesForm
      );
    }
  }
}

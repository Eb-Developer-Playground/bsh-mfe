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
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { IEmailAddressFieldStates } from '@app/shared/models/customer/shared';
import { OTPInputViewMode } from '@app/shared/modules/contacts';
import { EmailComponent } from '@app/shared/modules/contacts/components';
import {
  DedupeOperationMode,
  OTPVerificationMode,
} from '@app/shared/modules/contacts/types';
import { EmailsValidator } from '@app/shared/modules/contacts/validators';
import { NotificationsModule } from '@app/shared/modules/notifications';
import { ISubsidiary } from '@app/shared/services/session/session.service';

@Component({
  selector: 'app-emails-array',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule,
    EmailComponent,
    NotificationsModule,
    TranslateModule,
  ],
  templateUrl: './emails-array.component.html',
  styleUrls: ['./emails-array.component.scss'],
})
export class EmailsArrayComponent implements OnInit, OnChanges {
  readonly _destroyRef = inject(DestroyRef);
  @Input() subsidiary!: ISubsidiary;
  @Input() parentForm!: UntypedFormGroup;
  @Input() parentFormControlName!: string;
  @Input() ticketId!: string;
  @Input() customerId!: string;
  @Input() fieldStates?: IEmailAddressFieldStates[];
  @Input() enableMultiple!: boolean;
  @Input() otpInputViewMode!: OTPInputViewMode;
  @Input() otpVerificationMode!: OTPVerificationMode;
  @Input() dedupeOperationMode!: DedupeOperationMode;
  @Input() formArray: UntypedFormArray = this.fb.array([
    this.fb.group({
      id: [null],
      emailType: [null],
      emailAddress: [null],
      comment: [null],
      isPreferred: [true],
      toBeDeleted: [false],
      verified: [null],
    }),
  ]);
  @Input() required!: boolean;
  selectedEmailTypes: string[] = [];

  constructor(private fb: UntypedFormBuilder) {}

  ngOnInit() {
    if (this.parentForm && this.parentFormControlName) {
      this.parentForm.addControl(this.parentFormControlName, this.formArray);
    }
    this.formArray.setValidators(EmailsValidator);
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

  getEmailAddressForm(ind: number): UntypedFormGroup {
    return <UntypedFormGroup>this.formArray.at(ind);
  }

  getEmailAddressState(ind: number): any {
    return this.fieldStates?.[ind];
  }

  preferredEmailToggled(isTrue: boolean, ind: number) {
    if (isTrue) {
      this.formArray.controls.forEach((_v, i) => {
        if (ind !== i) this.formArray.at(i).get('isPreferred')?.setValue(false);
      });
    }
  }

  performChecks(): void {
    this.selectedEmailTypes = this.formArray.controls.map(
      (_i, ind) => this.formArray.at(ind).get('emailType')?.value
    );
  }

  addEmailAddress(): void {
    this.formArray.push(
      this.fb.group({
        id: [null],
        emailType: [null],
        emailAddress: [null],
        comment: [null],
        isPreferred: [false],
        toBeDeleted: [false],
        verified: [null],
      })
    );
  }

  removeEmailAddress(ind: number): void {
    this.formArray.removeAt(ind);
    const hasPreferredEmail = this.formArray.controls
      .map((_i, ind) => this.formArray.at(ind).get('isPreferred')?.value)
      .some(i => i === true);
    if (!hasPreferredEmail)
      this.formArray
        .at(0)
        ?.get('isPreferred')
        ?.setValue(true, { emitEvent: false });
  }

  patchValues(): void {
    if (this.fieldStates) {
      this.fieldStates.forEach((_ph, ind) => {
        if (!this.formArray.at(ind)) {
          this.addEmailAddress();
        }
      });
      this.performChecks();
    }
  }
}

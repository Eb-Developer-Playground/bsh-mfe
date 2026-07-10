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
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OTPInputViewMode } from '@app/shared/modules/contacts';
import { EmailOtpSection } from '@app/shared/modules/contacts/components';
import { MatchedProfilesDialog } from '@app/shared/modules/contacts/dialogs/matched-profiles.dialog';
import { IContactDedupeItem } from '@app/shared/modules/contacts/fields/phone-number/types';
import {
  DedupeOperationMode,
  OTPVerificationMode,
} from '@app/shared/modules/contacts/types';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { debounceTime } from 'rxjs/operators';
import { IEmailAddressFieldStates } from '../../../../models/customer/shared';
import { ContactsService } from '../../contacts.service';
import { EmailType } from '../../models';
import { validateEmail } from '@app/shared/validators/email-validator';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    TranslateModule,
    EmailOtpSection,
  ],
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
})
export class EmailComponent implements OnInit, OnChanges {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _dialog = inject(MatDialog);
  private readonly _translate = inject(TranslateService);
  private readonly _fb = inject(UntypedFormBuilder);
  private readonly toast = inject(ToastService);
  private readonly service = inject(ContactsService);
  protected readonly OTPInputViewMode = OTPInputViewMode;
  protected readonly DedupeOperationMode = DedupeOperationMode;
  @Input() subsidiary!: ISubsidiary;
  @ViewChild('otpInputComponent') otpComponent!: EmailOtpSection;
  @Input() parentForm!: UntypedFormGroup;
  @Input() parentFormControlName!: string;
  @Output() preferredToggled: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Input() selectedTypes: string[] = [];
  @Input() otpInputViewMode: OTPInputViewMode = OTPInputViewMode.NEVER;
  @Input() otpVerificationMode: OTPVerificationMode = OTPVerificationMode.NEVER;
  @Input() dedupeOperationMode: DedupeOperationMode = DedupeOperationMode.NEVER;
  @Input() mandatoryVerification!: boolean;
  @Input() enableMultiple!: boolean;
  @Input() fieldStates!: IEmailAddressFieldStates;
  @Input() addressOnly: boolean = false;
  @Input() addressType!: string;
  @Input() index!: number;
  @Input() form: UntypedFormGroup = this._fb.group({
    id: [null],
    emailType: [null],
    emailAddress: [null],
    comment: [null],
    isPreferred: [true],
    toBeDeleted: [false],
    verified: [null],
    unique: [null],
  });
  @Input() required!: boolean;
  @Input() customerId!: string;
  @Input() ticketId!: string;
  @Input() readonly?: boolean;
  showOtpInput!: boolean;
  enableVerification!: boolean;
  dedupeMatches: IContactDedupeItem[] = [];
  emailTypes: EmailType[] = [];

  get title(): string {
    if (this.index === 0) {
      return 'COMMON.EMAIL_SECTION.PRIMARY_EMAIL';
    } else if (this.index === 1) {
      return 'COMMON.EMAIL_SECTION.SECONDARY_EMAIL';
    } else if (this.index > 1) {
      return 'COMMON.EMAIL_SECTION.ALTERNATIVE_EMAIL';
    }
    return 'COMMON.EMAIL_SECTION.EMAIL_ADDRESS';
  }

  ngOnInit(): void {
    this.showOtpInput = this.otpInputViewMode === OTPInputViewMode.ALWAYS;
    this.enableVerification =
      this.otpVerificationMode === OTPVerificationMode.ALWAYS;
    if (this.parentForm && this.parentFormControlName) {
      this.parentForm.addControl(this.parentFormControlName, this.form);
    }
    this.form
      .get('emailAddress')
      ?.valueChanges.pipe(
        debounceTime(500),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(emailAddress => {
        if (this.form.get('emailAddress')?.valid) {
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
                  contact: emailAddress.toLowerCase(),
                }
              ),
              MessageBoxType.INFO
            );
            this.service.performEmailDedupe(emailAddress).subscribe(hits => {
              this.dedupeMatches = hits;
              this.showOtpInput =
                hits.length > 0 &&
                this.otpVerificationMode ===
                  OTPVerificationMode.ON_DEDUPE_MATCH;
              this.enableVerification =
                hits.length > 0 &&
                this.otpVerificationMode ===
                  OTPVerificationMode.ON_DEDUPE_MATCH;
              if (
                this.dedupeOperationMode === DedupeOperationMode.PREVENT_MATCHES
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
            this.otpInputViewMode === OTPInputViewMode.ONCHANGE ||
            this.otpVerificationMode === OTPVerificationMode.ON_STATE_CHANGE
          ) {
            const emailChanged = this.emailChanged(
              (this.fieldStates?.emailAddress?.value ?? '').trim(),
              emailAddress.trim().toLowerCase()
            );
            this.showOtpInput =
              emailChanged &&
              this.otpInputViewMode === OTPInputViewMode.ONCHANGE;
            if (
              emailChanged &&
              this.otpVerificationMode === OTPVerificationMode.ON_STATE_CHANGE
            ) {
              this.showOtpInput = true;
              this.enableVerification = true;
            }
          }
        }
      });
    this.service
      .getEmailTypes(this.subsidiary)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(emailTypes => {
        this.emailTypes = emailTypes;
        if (this.addressType)
          this.form.patchValue({ type: this.addressType, isPreferred: true });
        this.validateGroup(this.form.getRawValue());
        this.form
          .get('isPreferred')
          ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe(ch => this.preferredToggled.emit(ch));
        this.form.valueChanges
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe(ch => this.validateGroup(ch));
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fieldStates?.currentValue) this.patchValues();
  }

  validateGroup(ch: any): void {
    if (this.addressOnly) return;
    if (ch.emailType || ch.emailAddress || ch.comment) {
      this.form.get('emailType')?.addValidators([Validators.required]);
      this.form
        .get('emailAddress')
        ?.addValidators([Validators.required, validateEmail]);
    } else {
      this.form.get('emailType')?.removeValidators([Validators.required]);
      this.form
        .get('emailAddress')
        ?.removeValidators([Validators.required, validateEmail]);
    }
    this.form.get('emailType')?.updateValueAndValidity({ emitEvent: false });
    this.form.get('emailAddress')?.updateValueAndValidity({ emitEvent: false });
  }

  showMatches() {
    const { emailAddress } = this.form.value;
    const dialogRef = this._dialog.open(MatchedProfilesDialog, {
      data: {
        contact: emailAddress.toLowerCase(),
        profiles: this.dedupeMatches,
      },
      maxWidth: '650px',
      minWidth: '550px',
    });
    dialogRef.afterClosed().subscribe(() => {});
  }

  emailChanged(initial: string, email: string) {
    if (
      !initial &&
      email &&
      this.otpInputViewMode === OTPInputViewMode.ONCHANGE
    )
      return true;
    return (
      this.fieldStates.emailAddress?.value?.trim() !==
      email.trim().toLowerCase()
    );
  }

  patchValues(): void {
    if (this.fieldStates) {
      this.form.patchValue({
        id: this.fieldStates.id?.value,
        emailType: this.fieldStates.emailType?.value,
        emailAddress: this.fieldStates.emailAddress?.value,
        comment: this.fieldStates.comment?.value,
        isPreferred: this.fieldStates.isPreferred?.value,
      });
      if (this.fieldStates.emailType?.readonly)
        this.form.get('emailType')?.disable();
      else this.form.get('emailType')?.enable();
      if (this.fieldStates.emailAddress?.readonly)
        this.form.get('emailAddress')?.disable();
      else this.form.get('emailAddress')?.enable();
      if (this.fieldStates.isPreferred?.readonly)
        this.form.get('isPreferred')?.disable();
      else this.form.get('isPreferred')?.enable();
    }
  }
}

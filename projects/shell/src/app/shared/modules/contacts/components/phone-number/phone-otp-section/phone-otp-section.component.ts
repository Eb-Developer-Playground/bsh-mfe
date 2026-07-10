import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { isDevOrUat, uuid4 } from '@app/shared/utils';
import { Observable, timer } from 'rxjs';
import { finalize, scan, takeWhile, tap } from 'rxjs/operators';
import { MessageBoxType, ToastService } from '../../../../toast';
import { ContactsService } from '../../../contacts.service';
import { OtpCodesComponent } from '../../otp-codes/otp-codes.component';

@Component({
  selector: 'app-phone-otp-section',
  imports: [
    NgClass,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    OtpCodesComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './phone-otp-section.component.html',
  styleUrls: ['./phone-otp-section.component.scss'],
})
export class PhoneOtpSection
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  readonly _destroyRef = inject(DestroyRef);
  @ViewChild('inputComp') otpComponent!: OtpCodesComponent;
  @Output() onVerified: EventEmitter<any> = new EventEmitter();
  @Input() phoneInputForm!: UntypedFormGroup;
  @Input() ticketId!: string;
  @Input() customerId!: string;
  @Input() operation: string = 'onboarding';
  @Input() enableVerification!: boolean;
  otpReferenceId!: any;
  hasVerifiedOtp!: boolean;
  hasSentOtp!: boolean;
  canResend!: boolean;
  otpCode!: any;
  countDown!: number;
  otpFormControl = new UntypedFormControl(
    { value: '', disabled: false }, // this.otpDisabled || this.hasVerifiedOtp
    [Validators.required, Validators.minLength(6), Validators.maxLength(6)]
  );

  constructor(
    private toast: ToastService,
    private service: ContactsService
  ) {}

  ngOnInit(): void {
    this.toggleVerification();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['enableVerification']?.currentValue) this.toggleVerification();
  }

  ngAfterViewInit() {
    this.otpFormControl.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(fv => {
        if (this.otpFormControl.valid) {
          this.otpCode = fv.split('');
        }
      });
  }

  ngOnDestroy(): void {
    this.removeVerification();
  }

  toggleVerification(): void {
    if (this.enableVerification) {
      this.phoneInputForm
        .get('verified')
        ?.addValidators([Validators.requiredTrue]);
      this.phoneInputForm.get('verified')?.updateValueAndValidity();
      this.phoneInputForm.updateValueAndValidity();
    } else {
      this.removeVerification();
    }
  }

  removeVerification(): void {
    this.phoneInputForm.get('verified')?.clearValidators();
    this.phoneInputForm.get('verified')?.updateValueAndValidity();
    this.phoneInputForm.updateValueAndValidity();
  }

  get phoneNumber(): string {
    const { countryCode, cityCode, number } = this.phoneInputForm.getRawValue();
    return `+${countryCode || ''}${cityCode || ''}${number || ''}`;
  }

  get invalidInputs(): boolean {
    return <boolean>(
      (this.phoneInputForm.get('countryCode')?.invalid ||
        this.phoneInputForm.get('phoneType')?.invalid ||
        this.phoneInputForm.get('number')?.invalid ||
        this.phoneInputForm.get('cityCode')?.invalid)
    );
  }

  get otpDisabled(): boolean {
    return (
      this.invalidInputs || this.phoneInputForm.get('verified')?.value === true
    );
  }

  clear(): void {
    this.otpFormControl.setValue('');
  }

  sendOtp(resend: boolean = false): void {
    this.otpCode = undefined;
    if (!this.otpReferenceId) this.otpReferenceId = uuid4();
    this.deliverOtp(resend).subscribe(resp => {
      this.hasSentOtp = resp.successful;
      if (this.hasSentOtp) {
        this.otpFormControl.enable();
        this.otpFormControl.setValue('');
        this.otpComponent.selectInput(0);
      }
      this.canResend = !resp.successful;
      if (resp.successful) {
        this.toast.show(
          null,
          'COMMON.OTP_SEND_SUCCESS',
          MessageBoxType.SUCCESS
        );
        this.initCountdown();
      } else {
        this.toast.show(null, 'COMMON.OTP_SEND_ERROR', MessageBoxType.SUCCESS);
      }
    });
    this.clear();
  }

  validateOtp(): void {
    const otpData: any = {
      reference: `${this.otpReferenceId}`,
      to: this.phoneNumber,
      platform: 1,
      operation: this.operation,
      source: 'Chatbot',
      otp: `${this.otpCode.join('')}`,
      MockOTP: isDevOrUat() ? true : false,
    };

    this.service.validateOTP(otpData, this.ticketId).subscribe(resp => {
      this.hasVerifiedOtp = resp.successful;
      if (this.hasVerifiedOtp) this.otpFormControl.disable();
      this.onVerified.emit(resp.successful);
      if (resp.successful) {
        this.toast.show(null, 'COMMON.OTP_SUCCESS', MessageBoxType.SUCCESS);
        this.phoneInputForm.patchValue({ verified: resp.successful });
      } else {
        this.toast.show(null, 'COMMON.OTP_FAILED', MessageBoxType.DANGER);
        this.otpCode = undefined;
        this.clear();
      }
    });
  }

  initCountdown(): void {
    timer(0, 1000)
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        scan(acc => --acc, 59),
        takeWhile(x => x >= 0),
        tap(t => (this.countDown = t)),
        finalize(() => {
          if (!this.phoneInputForm.get('verified')?.valid) {
            this.canResend = true;
            this.otpCode = undefined;
            this.clear();
          }
        })
      )
      .subscribe(() => {});
  }

  deliverOtp(resend: boolean = false): Observable<any> {
    const payload = {
      reference: `${this.otpReferenceId}`,
      to: this.phoneNumber,
      platform: 1,
      operation: 'onboarding',
      source: 'Chatbot',
      noOfDigit: 6,
      customerId: this.customerId || '0170194290581',
      template: 'verificationCode_contactShare',
      signature: 'jhldhsfkdfdsklf',
    };
    if (resend) return this.service.regenerateOTP(payload, this.ticketId);
    return this.service.generateOTP(payload, this.ticketId);
  }
}

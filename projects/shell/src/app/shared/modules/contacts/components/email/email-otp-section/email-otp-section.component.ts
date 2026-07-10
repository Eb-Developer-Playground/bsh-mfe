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
import { TranslateModule } from '@ngx-translate/core';
import { isDevOrUat, uuid4 } from '@app/shared/utils';
import { Observable, timer } from 'rxjs';
import { finalize, scan, takeWhile, tap } from 'rxjs/operators';
import { MessageBoxType, ToastService } from '../../../../toast';
import { ContactsService } from '../../../contacts.service';
import { OtpCodesComponent } from '../../otp-codes/otp-codes.component';

@Component({
  selector: 'app-email-otp-section',
  standalone: true,
  imports: [
    NgClass,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    OtpCodesComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './email-otp-section.component.html',
  styleUrls: ['./email-otp-section.component.scss'],
})
export class EmailOtpSection
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  readonly _destroyRef = inject(DestroyRef);
  readonly toast = inject(ToastService);
  @ViewChild('inputComp') otpComponent!: OtpCodesComponent;
  @Output() onVerified: EventEmitter<any> = new EventEmitter();
  @Input() emailInputForm!: UntypedFormGroup;
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

  constructor(private service: ContactsService) {}

  ngOnInit(): void {
    this.toggleVerification();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.enableVerification?.currentValue) this.toggleVerification();
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
      this.emailInputForm
        .get('verified')
        ?.addValidators([Validators.requiredTrue]);
      this.emailInputForm.get('verified')?.updateValueAndValidity();
      this.emailInputForm.updateValueAndValidity();
    } else {
      this.removeVerification();
    }
  }

  removeVerification(): void {
    this.emailInputForm.get('verified')?.clearValidators();
    this.emailInputForm.get('verified')?.updateValueAndValidity();
    this.emailInputForm.updateValueAndValidity();
  }

  get emailAddress(): string {
    return this.emailInputForm?.get('emailAddress')?.value;
  }

  get invalidInputs(): boolean {
    return <boolean>(
      (this.emailInputForm.get('emailAddress')?.invalid ||
        this.emailInputForm.get('emailType')?.invalid ||
        this.emailInputForm.get('comment')?.invalid)
    );
  }

  get otpDisabled(): boolean {
    return (
      this.invalidInputs || this.emailInputForm.get('verified')?.value === true
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
      to: this.emailAddress,
      platform: 2,
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
        this.emailInputForm.patchValue({ verified: resp.successful });
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
          if (!this.emailInputForm.get('verified')?.valid) {
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
      to: this.emailAddress,
      platform: 2,
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

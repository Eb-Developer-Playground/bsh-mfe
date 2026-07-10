import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-phone-otp-validation',
  templateUrl: './phone-otp-validation.component.html',
  styleUrls: ['./phone-otp-validation.component.scss'],
})
export class PhoneOtpValidationComponent implements OnInit {
  @Input() form!: UntypedFormGroup;

  public phoneCode!: string;

  constructor() {}

  ngOnInit(): void {
    this.phoneCode = <string>(this.form.get('countryCode')?.value || '254');
    if (!this.form.get('countryCode')?.value)
      this.form.patchValue({
        countryCode: '254',
      });
  }

  get getPhoneCodeClass(): string {
    switch (this.phoneCode) {
      case '254':
        return 'kenya';
    }
    return '';
  }
}

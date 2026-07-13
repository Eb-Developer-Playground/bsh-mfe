import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-phone-otp-validation',
  templateUrl: './phone-otp-validation.component.html',
  styleUrls: ['./phone-otp-validation.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
  ],
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

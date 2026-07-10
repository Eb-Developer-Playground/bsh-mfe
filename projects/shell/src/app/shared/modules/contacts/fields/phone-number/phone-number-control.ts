import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PhoneNumberInput } from './phone-number.input';
import { PhoneNumber } from './types';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-phone-number-control',
  templateUrl: 'phone-number-control.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    PhoneNumberInput,
  ],
})
export class PhoneNumberControl {
  form: FormGroup = new FormGroup({
    tel: new FormControl(new PhoneNumber('', '', '')),
  });
  country!: { flagPath: string; countryName: string };
}

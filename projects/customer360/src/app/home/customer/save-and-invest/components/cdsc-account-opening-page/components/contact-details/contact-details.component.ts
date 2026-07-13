import { Component, OnInit, Input } from '@angular/core';
import {
  UntypedFormGroup,
  Validators,
  UntypedFormBuilder,
  UntypedFormControl,
} from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PhoneOtpValidationComponent } from 'src/app/shared/components/phone-otp-validation/phone-otp-validation.component';
import { EmailLinkValidationComponent } from 'src/app/shared/components/email-link-validation/email-link-validation.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    PhoneOtpValidationComponent,
    EmailLinkValidationComponent,
    TranslatePipe,
  ],
  animations: [
    trigger('expandCollapse', [
      state(
        'expanded',
        style({
          //
        })
      ),
      state(
        'collapsed',
        style({
          height: '30px',
          overflow: 'hidden',
        })
      ),
      transition('expanded => collapsed', [animate('0.2s')]),
      transition('collapsed => expanded', [animate('0.2s')]),
    ]),
    trigger('rotate', [
      state(
        'normal',
        style({
          transform: 'rotate(0)',
        })
      ),
      state(
        'rotated',
        style({
          transform: 'rotate(-180deg)',
        })
      ),
      transition('rotated => normal', [animate('400ms ease-out')]),
      transition('normal => rotated', [animate('400ms ease-in')]),
    ]),
  ],
})
export class ContactDetailsComponent implements OnInit {
  @Input() form!: UntypedFormGroup;
  @Input() existingFormData?: any;
  @Input() customer!: any;

  public expanded = true;

  public emailAddressForm!: UntypedFormGroup;
  public phoneNumberForm!: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm = () => {
    const contactDetails = this.customer?.contactDetails;

    const emailAddressDetails = contactDetails?.emailAddresses.find(
      (address: any) => !!address.preferred
    );
    const existingFormDataEmail = this.existingFormData?.emailAddress;
    this.form.addControl(
      'emailAddress',
      this.formBuilder.group({
        id: [emailAddressDetails?.id],
        emailAddress: new UntypedFormControl(
          {
            value:
              emailAddressDetails?.emailAddress ||
              existingFormDataEmail?.emailAddress,
            disabled: !!emailAddressDetails?.emailAddress,
          },
          Validators.required
        ),
        emailType: [
          emailAddressDetails?.emailType || existingFormDataEmail?.emailType,
        ],
        comment: [
          emailAddressDetails?.comment || existingFormDataEmail?.comment,
        ],
        preferred: [
          emailAddressDetails?.preferred || existingFormDataEmail?.preferred,
        ],
        toBeDeleted: [
          emailAddressDetails?.toBeDeleted ||
            existingFormDataEmail?.toBeDeleted,
        ],
      })
    );
    this.emailAddressForm = this.form.get('emailAddress') as UntypedFormGroup;

    const phoneNumberDetails = contactDetails?.phoneNumbers.find(
      (number: any) => !!number.preferred
    );
    const existingFormDataPhone = this.existingFormData?.phoneNumber;
    this.form.addControl(
      'phoneNumber',
      this.formBuilder.group({
        id: [phoneNumberDetails?.id || existingFormDataPhone?.id],
        cityCode: [
          phoneNumberDetails?.cityCode || existingFormDataPhone?.cityCode,
        ],
        countryCode: new UntypedFormControl(
          {
            value:
              phoneNumberDetails?.countryCode ||
              existingFormDataPhone?.countryCode,
            disabled: !!phoneNumberDetails?.countryCode,
          },
          Validators.required
        ),
        number: new UntypedFormControl(
          {
            value: phoneNumberDetails?.number || existingFormDataPhone?.number,
            disabled: !!phoneNumberDetails?.number,
          },
          Validators.required
        ),
        comment: [
          phoneNumberDetails?.comment || existingFormDataPhone?.comment,
        ],
        phoneType: [
          phoneNumberDetails?.phoneType || existingFormDataPhone?.phoneType,
        ],
        preferred: [
          phoneNumberDetails?.preferred || existingFormDataPhone?.preferred,
        ],
        toBeDeleted: [
          phoneNumberDetails?.toBeDeleted || existingFormDataPhone?.toBeDeleted,
        ],
      })
    );
    this.phoneNumberForm = this.form.get('phoneNumber') as UntypedFormGroup;
  };

  toggleExpandCollapse = () => (this.expanded = !this.expanded);
}

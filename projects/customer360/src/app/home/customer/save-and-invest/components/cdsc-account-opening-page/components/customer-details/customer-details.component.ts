import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { validateKraPin } from 'src/app/shared/directives/kra-pin-validator.directive';
import { PrepopulatedFormErrorStateMatcher } from 'src/app/shared/utils/prepopulatedFormErrorStateMatcher';
import { validateNumbersOnly } from '../../../../../../../shared/directives/validate-numbers.only';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
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
export class CustomerDetailsComponent implements OnInit {
  @Input() form!: UntypedFormGroup;
  @Input() existingFormData?: any;
  @Input() customer!: any;

  public expanded = true;

  public matcher = new PrepopulatedFormErrorStateMatcher();

  constructor(private formBuilder: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm = () => {
    const personalDetails = this.customer.personalDetails;
    const existingFormDataDetails = this.existingFormData?.customerDetails;
    this.form.addControl(
      'customerDetails',
      this.formBuilder.group({
        firstName: new UntypedFormControl(
          {
            value:
              personalDetails.firstName || existingFormDataDetails?.firstName,
            disabled: !!personalDetails.firstName,
          },
          Validators.required
        ),
        middleName: new UntypedFormControl({
          value:
            personalDetails.middleName || existingFormDataDetails?.middleName,
          disabled: !!personalDetails.middleName,
        }),
        lastName: new UntypedFormControl(
          {
            value:
              personalDetails.lastName || existingFormDataDetails?.lastName,
            disabled: !!personalDetails.lastName,
          },
          Validators.required
        ),
        customerId: new UntypedFormControl(
          {
            value:
              personalDetails.customerId || existingFormDataDetails?.customerId,
            disabled: !!personalDetails.customerId,
          },
          Validators.required
        ),
        kraPin: new UntypedFormControl(
          {
            value:
              personalDetails.krapInNumber || existingFormDataDetails?.kraPin,
            disabled: !!personalDetails.krapInNumber,
          },
          [Validators.required, validateKraPin]
        ),
        nationality: new UntypedFormControl(
          {
            value:
              personalDetails.nationality ||
              existingFormDataDetails?.nationality,
            disabled: !!personalDetails.nationality,
          },
          Validators.required
        ),
        countryOfResidence: new UntypedFormControl(
          {
            value:
              personalDetails.countryOfResidence ||
              existingFormDataDetails?.countryOfResidence,
            disabled: !!personalDetails.countryOfResidence,
          },
          Validators.required
        ),
        sourceOfFunds: [''],
      })
    );
  };

  toggleExpandCollapse = () => (this.expanded = !this.expanded);
}

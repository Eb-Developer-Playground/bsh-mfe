import { Component, OnInit, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
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
import { ValidateNationalId } from 'src/app/shared/directives/nationalid-validator.directive';
import { validateKenyanPassport } from 'src/app/shared/directives/kenyan-passport-validator.directive';
import { PrepopulatedFormErrorStateMatcher } from 'src/app/shared/utils/prepopulatedFormErrorStateMatcher';
import { CdscAccountOpeningService } from 'src/app/core/services/cdsc-account-opening/cdsc-account-opening.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-next-of-kin',
  templateUrl: './next-of-kin.component.html',
  styleUrls: ['./next-of-kin.component.scss'],
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
    MatRadioModule,
    MatButtonModule,
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
export class NextOfKinComponent implements OnInit {
  @Input() form!: UntypedFormGroup;
  @Input() customer!: any;
  @Input() existingFormData?: any;

  public expanded = true;

  public matcher = new PrepopulatedFormErrorStateMatcher();
  public relations!: Array<any>;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private cdscAccountOpeningService: CdscAccountOpeningService
  ) {}

  ngOnInit(): void {
    this.relations = this.cdscAccountOpeningService.getRelations();
    const nextOfKin = this.customer.nextOfKin;
    const existingFormDataNextOfKin = this.existingFormData?.nextOfKin;
    this.form.addControl(
      'nextOfKin',
      this.formBuilder.group({
        firstName: new UntypedFormControl(
          {
            value: nextOfKin?.firstName || existingFormDataNextOfKin?.firstName,
            disabled: !!nextOfKin?.firstName,
          },
          Validators.required
        ),
        middleName: new UntypedFormControl({
          value: nextOfKin?.middleName || existingFormDataNextOfKin?.middleName,
          disabled: !!nextOfKin?.middleName,
        }),
        lastName: new UntypedFormControl(
          {
            value: nextOfKin?.lastName || existingFormDataNextOfKin?.lastName,
            disabled: !!nextOfKin?.lastName,
          },
          Validators.required
        ),
        idType: new UntypedFormControl(
          {
            value: nextOfKin?.idType || existingFormDataNextOfKin?.idType,
            disabled: !!nextOfKin?.idType,
          },
          Validators.required
        ),
        idNumber: new UntypedFormControl(
          {
            value: nextOfKin?.idNumber || existingFormDataNextOfKin?.idNumber,
            disabled: !!nextOfKin?.idNumber,
          },
          Validators.required
        ),
        phoneNumber: new UntypedFormControl(''),
        relation: new UntypedFormControl(
          {
            value: nextOfKin?.relation || existingFormDataNextOfKin?.relation,
            disabled: !!nextOfKin?.relation,
          },
          Validators.required
        ),
      })
    );
  }

  toggleExpandCollapse = () => (this.expanded = !this.expanded);

  onIdTypeChange = () => {
    const value = this.form.get('nextOfKin.idType')?.value;
    const nextOfKinForm: UntypedFormGroup = <UntypedFormGroup>(
      this.form.get('nextOfKin')
    );
    let validators: Array<any> = [];
    switch (value) {
      case 'passport':
        validators = [Validators.required, validateKenyanPassport];
        break;
      case 'nationalId':
        validators = [Validators.required, ValidateNationalId];
        break;
      default:
        break;
    }
    nextOfKinForm.patchValue({
      idNumber: '',
    });
    nextOfKinForm.get('idNumber')?.setValidators(validators);
    nextOfKinForm.get('idNumber')?.updateValueAndValidity();
  };
}

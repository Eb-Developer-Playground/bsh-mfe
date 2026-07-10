import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslatePipe } from '@ngx-translate/core';
import { IPhoneNumberFieldStates } from '@app/shared/models/customer/shared';
import { MatchedProfilesDialog } from '@app/shared/modules/contacts/dialogs/matched-profiles.dialog';
import { PhoneNumberInput } from '@app/shared/modules/contacts/fields/phone-number';
import { IContactDedupeItem } from '@app/shared/modules/contacts/fields/phone-number/types';
import { DedupeOperationMode } from '@app/shared/modules/contacts/types';

@Component({
  selector: 'app-phone-number-group',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    PhoneNumberInput,
    TranslatePipe,
  ],
  templateUrl: './phone-number-group.component.html',
  styleUrls: ['./phone-number-group.component.scss'],
})
export class PhoneNumberGroupComponent implements OnInit, OnChanges {
  private readonly _fb = inject(UntypedFormBuilder);
  private readonly _dialog = inject(MatDialog);
  readonly DedupeOperationMode = DedupeOperationMode;
  @Input() parentForm!: UntypedFormGroup;
  @Input() parentFormControlName!: string;
  @Input() label: string = 'COMMON.PHONE_SECTION.PHONE_NUMBER';
  @Input() index!: number;
  @Input() form: UntypedFormGroup = this._fb.group({
    id: [''],
    phoneType: ['COMMPH1'],
    countryCode: [null],
    cityCode: [''],
    number: [''],
    isPreferred: [true],
    comment: [''],
    toBeDeleted: [false],
    isMandatory: [false],
    verified: [null],
    unique: [null],
  });
  @Input() dedupeMatches: IContactDedupeItem[] = [];
  @Input() fieldStates?: IPhoneNumberFieldStates;
  @Input() dedupeOperationMode?: DedupeOperationMode;
  @Input() required: boolean = false;
  @Input() readonly?: boolean;
  country!: { flagPath: string; countryName: string };

  ngOnInit(): void {
    if (this.parentForm && this.parentFormControlName) {
      this.parentForm.addControl(this.parentFormControlName, this.form);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['fieldStates']?.currentValue) this.patchValues();
  }

  patchValues(): void {
    if (this.fieldStates) {
      this.form.patchValue({
        phoneType: this.fieldStates.phoneType?.value,
        countryCode: this.fieldStates.countryCode?.value,
        cityCode: this.fieldStates.cityCode?.value,
        number: this.fieldStates.number?.value,
      });

      if (this.fieldStates.countryCode?.readonly)
        this.form.get('countryCode')?.disable();
      else this.form.get('countryCode')?.enable();

      if (this.fieldStates.cityCode?.readonly)
        this.form.get('cityCode')?.disable();
      else this.form.get('cityCode')?.enable();

      if (this.fieldStates.number?.readonly) this.form.get('number')?.disable();
      else this.form.get('number')?.enable();

      if (this.fieldStates.isPreferred?.readonly)
        this.form.get('isPreferred')?.disable();
      else this.form.get('isPreferred')?.enable();

      if (this.fieldStates.comment?.readonly)
        this.form.get('comment')?.disable();
      else this.form.get('comment')?.enable();
    }
  }

  showMatches() {
    const { countryCode, cityCode, number } = this.form.value;
    const dialogRef = this._dialog.open(MatchedProfilesDialog, {
      data: {
        contact: `${countryCode}${cityCode || ''}${number}`,
        profiles: this.dedupeMatches,
      },
      maxWidth: '650px',
      minWidth: '550px',
    });
    dialogRef.afterClosed().subscribe(() => {});
  }
}

import { Component, OnInit, Input, ViewChild } from '@angular/core';
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

import { DivendDisposalPreference } from 'src/app/shared/models/save-and-invest/save-and-invest.model';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BicSearchDialog } from 'src/app/shared/components/bic-search-dialog/bic-search-dialog';
import { PhoneOtpValidationComponent } from 'src/app/shared/components/phone-otp-validation/phone-otp-validation.component';

import { PrepopulatedFormErrorStateMatcher } from 'src/app/shared/utils/prepopulatedFormErrorStateMatcher';
import { CdscAccountOpeningService } from 'src/app/core/services/cdsc-account-opening/cdsc-account-opening.service';

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss'],
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
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    TranslatePipe,
    BicSearchDialog,
    PhoneOtpValidationComponent,
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
export class AdditionalInformationComponent implements OnInit {
  @Input() form!: UntypedFormGroup;
  @Input() existingFormData?: any;

  public phoneNumberForm!: UntypedFormGroup;

  public expanded = true;
  public selectedDivendDisposalPreference!: DivendDisposalPreference;

  public matcher = new PrepopulatedFormErrorStateMatcher();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private dialog: MatDialog,
    private cdscAccountOpeningService: CdscAccountOpeningService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initDivendDisposalPreference();
  }

  toggleExpandCollapse = () => (this.expanded = !this.expanded);

  initForm = () => {
    this.form.addControl(
      'additionalInfo',
      this.formBuilder.group({
        CDSCAccountNumber: [
          this.cdscAccountOpeningService.getAccountNumber(),
          Validators.required,
        ],
        divendDisposalPreference: this.formBuilder.group({
          divendDisposalPreferenceType: ['', Validators.required],
        }),
      })
    );
  };

  initDivendDisposalPreference = () => {
    if (!this.existingFormData) return;
    const divendDisposalPreferenceData =
      this.existingFormData.additionalInfo.divendDisposalPreference;
    const disposalPreferenceForm = this.form.get(
      'additionalInfo.divendDisposalPreference'
    ) as UntypedFormGroup;

    this.selectedDivendDisposalPreference =
      divendDisposalPreferenceData.divendDisposalPreferenceType;

    disposalPreferenceForm.patchValue({
      divendDisposalPreferenceType: this.selectedDivendDisposalPreference,
    });

    switch (this.selectedDivendDisposalPreference) {
      default:
        break;
      case 'Cheque':
        break;
      case 'Domestic bank':
        disposalPreferenceForm.addControl(
          'domesticBankBankNameCode',
          new UntypedFormControl(
            divendDisposalPreferenceData.domesticBankBankNameCode,
            Validators.required
          )
        );
        disposalPreferenceForm.addControl(
          'cityCode',
          new UntypedFormControl(
            divendDisposalPreferenceData.cityCode,
            Validators.required
          )
        );
        disposalPreferenceForm.addControl(
          'domesticBankBranch',
          new UntypedFormControl(
            divendDisposalPreferenceData.domesticBankBranch,
            Validators.required
          )
        );
        disposalPreferenceForm.addControl(
          'bankAccountNumber',
          new UntypedFormControl(
            divendDisposalPreferenceData.bankAccountNumber,
            Validators.required
          )
        );
        break;
      case 'International bank':
        disposalPreferenceForm.addControl(
          'internationBankNumber',
          new UntypedFormControl(
            divendDisposalPreferenceData.internationBankNumber,
            Validators.required
          )
        );
        disposalPreferenceForm.addControl(
          'bankSwiftBIC',
          new UntypedFormControl(
            divendDisposalPreferenceData.bankSwiftBIC,
            Validators.required
          )
        );
        disposalPreferenceForm.addControl(
          'bankCurrency',
          new UntypedFormControl(
            divendDisposalPreferenceData.bankCurrency,
            Validators.required
          )
        );
        break;
      case 'Draft':
        disposalPreferenceForm.addControl(
          'draftCurrency',
          new UntypedFormControl(
            divendDisposalPreferenceData.draftCurrency,
            Validators.required
          )
        );
        break;
      case 'Mobile payment':
        disposalPreferenceForm.addControl(
          'mobilePaymentNumber',
          this.formBuilder.group({
            countryCode: [
              divendDisposalPreferenceData.mobilePaymentNumber.countryCode,
              Validators.required,
            ],
            number: [
              divendDisposalPreferenceData.mobilePaymentNumber.number,
              Validators.required,
            ],
          })
        );
        this.phoneNumberForm = disposalPreferenceForm.get(
          'mobilePaymentNumber'
        ) as UntypedFormGroup;
        break;
      case 'Direct payments':
        disposalPreferenceForm.addControl(
          'directPaymentSettlementBank',
          new UntypedFormControl(
            divendDisposalPreferenceData.directPaymentSettlementBank,
            Validators.required
          )
        );
        disposalPreferenceForm.addControl(
          'directPaymentAccountNumber',
          new UntypedFormControl(
            divendDisposalPreferenceData.directPaymentAccountNumber,
            Validators.required
          )
        );
        disposalPreferenceForm.addControl(
          'directPaymentLegalName',
          new UntypedFormControl(
            divendDisposalPreferenceData.directPaymentLegalName,
            Validators.required
          )
        );
        break;
    }
  };

  onDivendDisposalPreferenceChange = () => {
    const disposalPreferenceForm = this.form.get(
      'additionalInfo.divendDisposalPreference'
    ) as UntypedFormGroup;
    const previousType: DivendDisposalPreference =
      this.selectedDivendDisposalPreference;
    const currentType: DivendDisposalPreference = disposalPreferenceForm.get(
      'divendDisposalPreferenceType'
    )?.value as DivendDisposalPreference;
    this.selectedDivendDisposalPreference = currentType;
    switch (previousType) {
      default:
        break;
      case 'Cheque':
        break;
      case 'Domestic bank':
        disposalPreferenceForm.removeControl('domesticBankBankNameCode');
        disposalPreferenceForm.removeControl('cityCode');
        disposalPreferenceForm.removeControl('domesticBankBranch');
        disposalPreferenceForm.removeControl('bankAccountNumber');
        break;
      case 'International bank':
        disposalPreferenceForm.removeControl('internationBankNumber');
        disposalPreferenceForm.removeControl('bankSwiftBIC');
        disposalPreferenceForm.removeControl('bankCurrency');
        break;
      case 'Draft':
        disposalPreferenceForm.removeControl('draftCurrency');
        break;
      case 'Mobile payment':
        disposalPreferenceForm.removeControl('mobilePaymentNumber');
        this.phoneNumberForm = <any>null;
        break;
      case 'Direct payments':
        disposalPreferenceForm.removeControl('directPaymentSettlementBank');
        disposalPreferenceForm.removeControl('directPaymentAccountNumber');
        disposalPreferenceForm.removeControl('directPaymentLegalName');
        break;
    }
    switch (currentType) {
      default:
        break;
      case 'Cheque':
        break;
      case 'Domestic bank':
        disposalPreferenceForm.addControl(
          'domesticBankBankNameCode',
          new UntypedFormControl('', Validators.required)
        );
        disposalPreferenceForm.addControl(
          'cityCode',
          new UntypedFormControl('', Validators.required)
        );
        disposalPreferenceForm.addControl(
          'domesticBankBranch',
          new UntypedFormControl('', Validators.required)
        );
        disposalPreferenceForm.addControl(
          'bankAccountNumber',
          new UntypedFormControl('', Validators.required)
        );
        break;
      case 'International bank':
        disposalPreferenceForm.addControl(
          'internationBankNumber',
          new UntypedFormControl('', Validators.required)
        );
        disposalPreferenceForm.addControl(
          'bankSwiftBIC',
          new UntypedFormControl('', Validators.required)
        );
        disposalPreferenceForm.addControl(
          'bankCurrency',
          new UntypedFormControl('', Validators.required)
        );
        break;
      case 'Draft':
        disposalPreferenceForm.addControl(
          'draftCurrency',
          new UntypedFormControl('', Validators.required)
        );
        break;
      case 'Mobile payment':
        disposalPreferenceForm.addControl(
          'mobilePaymentNumber',
          this.formBuilder.group({
            countryCode: ['', Validators.required],
            number: ['', Validators.required],
          })
        );
        this.phoneNumberForm = disposalPreferenceForm.get(
          'mobilePaymentNumber'
        ) as UntypedFormGroup;
        break;
      case 'Direct payments':
        disposalPreferenceForm.addControl(
          'directPaymentSettlementBank',
          new UntypedFormControl('', Validators.required)
        );
        disposalPreferenceForm.addControl(
          'directPaymentAccountNumber',
          new UntypedFormControl('', Validators.required)
        );
        disposalPreferenceForm.addControl(
          'directPaymentLegalName',
          new UntypedFormControl('', Validators.required)
        );
        break;
    }
    disposalPreferenceForm.updateValueAndValidity();
  };

  get displayDomesticBankInputs(): boolean {
    return this.selectedDivendDisposalPreference === 'Domestic bank';
  }

  get displayInternationalBankInputs(): boolean {
    return this.selectedDivendDisposalPreference === 'International bank';
  }

  get displayDraftInputs(): boolean {
    return this.selectedDivendDisposalPreference === 'Draft';
  }

  get displayMobilePaymentInputs(): boolean {
    return this.selectedDivendDisposalPreference === 'Mobile payment';
  }

  get displayDirectPaymentsInputs(): boolean {
    return this.selectedDivendDisposalPreference == 'Direct payments';
  }

  get currencies(): Array<string> {
    return this.cdscAccountOpeningService.getCurrencies();
  }

  openBICDialog = () => {
    const dialogRef = this.dialog.open(BicSearchDialog, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const disposalPreferenceForm = this.form.get(
        'additionalInfo.divendDisposalPreference'
      ) as UntypedFormGroup;
      disposalPreferenceForm.patchValue({
        bankSwiftBIC: result.data.code,
      });
    });
  };

  openDomesticBankDialog = () => {
    const dialogRef = this.dialog.open(BicSearchDialog, {
      data: { localBank: true },
      width: '450px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const disposalPreferenceForm = this.form.get(
        'additionalInfo.divendDisposalPreference'
      ) as UntypedFormGroup;
      disposalPreferenceForm.patchValue({
        domesticBankBankNameCode: result.data.code,
        cityCode: '',
        domesticBankBranch: '',
        bankAccountNumber: '',
      });
    });
  };

  openCityDialog = () => {
    const dialogRef = this.dialog.open(BicSearchDialog, {
      data: { cities: true },
      width: '450px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const disposalPreferenceForm = this.form.get(
        'additionalInfo.divendDisposalPreference'
      ) as UntypedFormGroup;
      disposalPreferenceForm.patchValue({
        cityCode: result.data?.code,
        domesticBankBranch: '',
        bankAccountNumber: '',
      });
    });
  };

  openBranchDialog = () => {
    const disposalPreferenceForm = this.form.get(
      'additionalInfo.divendDisposalPreference'
    ) as UntypedFormGroup;
    const dialogRef = this.dialog.open(BicSearchDialog, {
      data: {
        branchCityCode: true,
        bankCode: disposalPreferenceForm.get('domesticBankBankNameCode')?.value,
        cityCode: disposalPreferenceForm.get('cityCode')?.value,
      },
      width: '450px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const disposalPreferenceForm = this.form.get(
        'additionalInfo.divendDisposalPreference'
      ) as UntypedFormGroup;
      disposalPreferenceForm.patchValue({
        domesticBankBranch: result.data.branchCode,
        bankAccountNumber: '',
      });
    });
  };

  openSettlementBankDialog = () => {
    const dialogRef = this.dialog.open(BicSearchDialog, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const disposalPreferenceForm = this.form.get(
        'additionalInfo.divendDisposalPreference'
      ) as UntypedFormGroup;
      disposalPreferenceForm.patchValue({
        directPaymentSettlementBank: result.data.code,
      });
    });
  };
}

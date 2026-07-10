import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { MatAccordion } from '@angular/material/expansion';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TransactionsService } from '../../../../../core/services';
import { DynamicFormService, FieldAttribute, FormFieldBase } from '@shared/dynamic-form';
import { BicSearchDialog } from '../../../dialogs';
import { MessageBoxType, ToastService } from '@shared/modules/toast';
import { MatDialog } from '@angular/material/dialog';
import { BankDetails, BranchDetails, LicensePurposeCode, PurposeCode } from '@shared/documents-upload-drc/models';
import { SessionService } from '@shared/services';
import { IBANDigitsValidator } from '@shared/validators';
import { TranslatePipe } from '../../../../shared-stubs/translate.pipe';
import {
  AdditionalFieldBranchOption,
  AdditionalFieldCodeOption,
  filterBankCodeOptions,
  filterBranchCodeOptions,
} from './additional-fields-code-filters';
import { COMPAT_IMPORTS } from '../../../../shared-stubs/compat-barrel';
import {
  mapBankCodeOptions,
  mapBranchCodeOptions,
  mapLicensePurposeCodeOptions,
  mapPurposeCodeOptions,
  mapRtgsPurposeCodeOptions,
  resolveIbanLength,
} from './additional-fields-code-mappers';

@Component({
  standalone: true,
  imports: [...COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-additional-fields',
  templateUrl: './additional-fields.component.html',
  styleUrls: ['./additional-fields.component.scss'],
})
export class AdditionalFieldsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() title = 'Section title';
  @Input() description!: string;
  @Input() sectionNumber: number | null = null;
  @Input() fieldAttributes: FieldAttribute[] = [];
  @Input() purposeCodes: PurposeCode[] = [];
  @Input() RTGSPurposeCodes: PurposeCode[] = [];
  @Input() LicensePurposeCode: LicensePurposeCode[] = [];
  @Input() bankCodes: BankDetails[] = [];
  @Input() branchCodes: BranchDetails[] = [];
  @Input() beneficiaryCountryCode: any[] = [];
  @Input() collapsible: boolean = false;
  @Input() layoutStyleClass: string = 'fieldset';
  @Output() form!: UntypedFormGroup;
  @Output() valueChanges: EventEmitter<any> = new EventEmitter<any>();
  @Output() formReady: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  fields: FormFieldBase<any>[] = [];
  banks: any[] = [];
  filteredOptions!: Observable<string[]>;
  panelOpenState: boolean = false;

  private destroy$: Subject<any> = new Subject<any>();

  protected purposeCodes$ = new BehaviorSubject<AdditionalFieldCodeOption[]>([]);

  /** Control for filter for server side. */
  public purposeCodeFilteringCtrl: FormControl<string> = new FormControl<string>('', { nonNullable: true });

  purposeCodeControlsChanges$ = this.purposeCodeFilteringCtrl.valueChanges.pipe(
    startWith(''),
    tap(() => this.searching.set(true)),
    debounceTime(200)
  );

  purposeCode$ = this.purposeCodeControlsChanges$.pipe(
    startWith(''),
    tap(() => this.searching.set(true)),
    switchMap(search =>
      this.purposeCodes$.pipe(
        map(purposeCodes => {
          if (!purposeCodes?.length) {
            return [];
          }

          const searchTerm = search.trim().toLowerCase();
          return searchTerm
            ? purposeCodes.filter(bank => bank.value.trim().toLowerCase().includes(searchTerm))
            : purposeCodes;
        })
      )
    ),
    tap(() => this.searching.set(false))
  );
  /** Indicate search operation is in progress */
  public searching = signal(false);

  /** List of purpose code */
  public $filteredPurposeCodeList = toSignal<AdditionalFieldCodeOption[]>(this.purposeCode$);

  currentPurposeSelection = { code: '', value: '' };

  // ========== Bank Code Infrastructure ==========
  protected bankCodes$ = new BehaviorSubject<AdditionalFieldCodeOption[]>([]);

  /** Control for bank code filter */
  public bankCodeFilteringCtrl: FormControl<string> = new FormControl<string>('', { nonNullable: true });

  /** Indicate bank code search operation is in progress */
  public searchingBankCode = signal(false);

  bankCodeControlsChanges$ = this.bankCodeFilteringCtrl.valueChanges.pipe(
    startWith(''),
    tap(() => this.searchingBankCode.set(true)),
    debounceTime(200)
  );

  bankCode$ = this.bankCodeControlsChanges$.pipe(
    startWith(''),
    tap(() => this.searchingBankCode.set(true)),
    switchMap(search =>
      this.bankCodes$.pipe(
        map(codes => {
          if (!codes?.length) {
            return [];
          }
          return filterBankCodeOptions(codes, search || '');
        })
      )
    ),
    tap(() => this.searchingBankCode.set(false))
  );

  /** List of bank codes */
  public $filteredBankCodeList = toSignal<AdditionalFieldCodeOption[]>(this.bankCode$);

  // ========== Branch Code Infrastructure ==========
  protected branchCodes$ = new BehaviorSubject<AdditionalFieldBranchOption[]>([]);

  /** Control for branch code filter */
  public branchCodeFilteringCtrl: FormControl<string> = new FormControl<string>('', { nonNullable: true });

  /** Indicate branch code search operation is in progress */
  public searchingBranchCode = signal(false);

  branchCodeControlsChanges$ = this.branchCodeFilteringCtrl.valueChanges.pipe(
    startWith(''),
    tap(() => this.searchingBranchCode.set(true)),
    debounceTime(200)
  );

  branchCode$ = this.branchCodeControlsChanges$.pipe(
    startWith(''),
    tap(() => this.searchingBranchCode.set(true)),
    switchMap(search =>
      this.branchCodes$.pipe(
        map(codes => {
          if (!codes?.length) {
            return [];
          }
          return filterBranchCodeOptions(codes, search || '');
        })
      )
    ),
    tap(() => this.searchingBranchCode.set(false))
  );

  /** List of branch codes */
  public $filteredBranchCodeList = toSignal<AdditionalFieldBranchOption[]>(this.branchCode$);

  // ========== License Purpose Code Infrastructure ==========
  protected licensePurposeCodes$ = new BehaviorSubject<LicensePurposeCode[]>([]);

  /** Control for license purpose code filter */
  public licensePurposeCodeFilteringCtrl: FormControl<string> = new FormControl<string>('', { nonNullable: true });

  /** Indicate license purpose code search operation is in progress */
  public searchingLicensePurposeCode = signal(false);

  licensePurposeCodeControlsChanges$ = this.licensePurposeCodeFilteringCtrl.valueChanges.pipe(
    startWith(''),
    tap(() => this.searchingLicensePurposeCode.set(true)),
    debounceTime(200)
  );

  licensePurposeCode$ = this.licensePurposeCodeControlsChanges$.pipe(
    startWith(''),
    tap(() => this.searchingLicensePurposeCode.set(true)),
    switchMap(search =>
      this.licensePurposeCodes$.pipe(
        map(codes => {
          if (!codes?.length) {
            return [];
          }
          const searchTerm = (search || '').trim().toLowerCase();
          return searchTerm
            ? codes.filter(
                c => c.value?.toLowerCase().includes(searchTerm) || c.text?.toLowerCase().includes(searchTerm)
              )
            : codes;
        })
      )
    ),
    tap(() => this.searchingLicensePurposeCode.set(false))
  );

  /** List of license purpose codes */
  public $filteredLicensePurposeCodeList = toSignal<LicensePurposeCode[]>(this.licensePurposeCode$);

  constructor(
    private dialog: MatDialog,
    private toast: ToastService,
    private translate: TranslateService,
    private transService: TransactionsService,
    private formService: DynamicFormService,
    private session: SessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();

    // Check transaction type to determine which purpose codes to load
    const transactionType = this.transService.contextData?.selectionForm?.transactionType;
    const countryCode = this.session.userCountryCode || 'KE';

    if (transactionType === 'RTGS' && countryCode !== 'CD') {
      this.getRTGSPaymentCodes();
    } else {
      this.getPaymentCodes();
    }

    this.getBankCodes2();
    this.getBranchCodes();
    this.setupPurposeCodeSubscription();
  }

  private initForms(): void {
    const fieldAttrs = this.fieldAttributes;
    const htmlFormFields = fieldAttrs.map(fa => this.formService.fieldAttributeToFormField(fa));

    this.fields = htmlFormFields;
    this.form = this.formService.toFormGroup(htmlFormFields);

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(change => this.valueChanges.emit(change));

    if (this.fields.map(f => f.key).includes('CountryCode')) {
      this.setupCountryCode();
    }

    if (this.fields.map(f => f.key).includes('BeneficiaryCountryCode')) {
      this.setupBeneficiaryCountryCode();
    }

    if (this.fields.map(f => f.key).includes('LicensePurposeCodeCategory')) {
      this.setupLicensePurposeCodeCategorySubscription();
    }

    if (this.fields.map(f => f.key).includes('LicensePurposeCode')) {
      this.setupLicensePurposeSubscription();
    }

    this.updateIBANFieldLengthValidation();
    this.formReady.emit(this.form);

    // Mark for check to ensure OnPush change detection picks up form changes
    this.cdr.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fieldAttributes'] && !changes['fieldAttributes'].firstChange) {
      this.initForms();
    }

    if (changes['purposeCodes'] && !changes['purposeCodes'].firstChange) {
      const transactionType = this.transService.contextData?.selectionForm?.transactionType;
      if (transactionType !== 'RTGS') {
        this.getPaymentCodes();
        this.cdr.markForCheck();
      }
    }

    // Handle RTGSPurposeCodes changes (including first change)
    if (changes['RTGSPurposeCodes']) {
      const transactionType = this.transService.contextData?.selectionForm?.transactionType;
      const countryCode = this.session.userCountryCode || 'KE';

      if (transactionType === 'RTGS' && countryCode !== 'CD') {
        this.getRTGSPaymentCodes();
        this.cdr.markForCheck();
      }
    }

    if (changes['bankCodes'] && !changes['bankCodes'].firstChange) {
      this.getBankCodes2();
      this.cdr.markForCheck();
    }

    if (changes['branchCodes'] && !changes['branchCodes'].firstChange) {
      this.getBranchCodes();
      this.cdr.markForCheck();
    }
  }

  getFormControl(key: string): UntypedFormControl {
    return this.form.controls[key] as UntypedFormControl;
  }

  setupCountryCode() {
    const countryCodeControl = this.getFormControl('CountryCode');
    if (countryCodeControl) {
      countryCodeControl.valueChanges
        .pipe(startWith(countryCodeControl.value), debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
        .subscribe(countryCode => {
          this.transService.patchContextData({
            selectionForm: {
              ...this.transService.contextData?.selectionForm,
              countryCode: countryCode,
            },
          });
        });
    }
  }

  setupBeneficiaryCountryCode() {
    const beneficiaryCountryCodeControl = this.getFormControl('BeneficiaryCountryCode');
    if (beneficiaryCountryCodeControl) {
      const initialValue = beneficiaryCountryCodeControl.value;
      if (initialValue === 'AE') {
        this.loadPurposeCodesForRegion('UAE');
      }

      beneficiaryCountryCodeControl.valueChanges
        .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
        .subscribe(beneficiaryCountryCode => {
          if (beneficiaryCountryCode === 'AE') {
            this.loadPurposeCodesForRegion('UAE');
          } else {
            this.loadPurposeCodesForRegion('GLOBAL');
          }
        });
    }
  }

  getRTGSPaymentCodes() {
    if (!this.RTGSPurposeCodes || !Array.isArray(this.RTGSPurposeCodes) || this.RTGSPurposeCodes.length === 0) {
      this.purposeCodes$.next([]);
      return;
    }

    const mappedCodes = mapRtgsPurposeCodeOptions(this.RTGSPurposeCodes);

    this.purposeCodes$.next(mappedCodes);
    const purposeCodeControl = this.getFormControl('PurposeCode');
    const purposeControl = this.getFormControl('Purpose');

    if (purposeCodeControl && purposeControl) {
      const currentCode = purposeCodeControl.value;

      if (currentCode) {
        const matchingPurpose = mappedCodes.find(pc => pc.code === currentCode);

        if (matchingPurpose) {
          purposeControl.setValue(matchingPurpose.value, { emitEvent: true });
          this.cdr.markForCheck();
        }
      }
    }
  }

  private loadPurposeCodesForRegion(region: string) {
    const countryCode = this.session.userCountryCode || 'KE';
    const transactionType = this.transService.contextData?.selectionForm?.transactionType;

    if (transactionType === 'RTGS') {
      if (countryCode === 'CD') {
        return;
      }

      this.getRTGSPaymentCodes();
      return;
    }

    this.transService
      .getPurposeCode(countryCode, region)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          if (response?.responseObject) {
            const purposeCodes = mapPurposeCodeOptions(response.responseObject);
            this.purposeCodes$.next(purposeCodes);

            const purposeCodeControl = this.getFormControl('PurposeCode');
            const purposeControl = this.getFormControl('Purpose');

            if (purposeCodeControl && purposeControl) {
              const currentCode = purposeCodeControl.value;

              if (currentCode) {
                const matchingPurpose = purposeCodes.find((pc: PurposeCode) => pc.code === currentCode);

                if (matchingPurpose) {
                  purposeControl.setValue(matchingPurpose.value, { emitEvent: true });
                  this.cdr.markForCheck();
                }
              }
            }
          }
        },
        error: () => {
          this.getPaymentCodes();
        },
      });
  }

  private setupPurposeCodeSubscription(): void {
    const purposeCodeControl = this.getFormControl('PurposeCode');

    if (purposeCodeControl) {
      purposeCodeControl.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          switchMap(selectedCode => {
            return this.purposeCode$.pipe(map(purposeCodes => ({ selectedCode, purposeCodes })));
          })
        )
        .subscribe(({ selectedCode, purposeCodes }) => {
          const purpose = purposeCodes.find(code => code.code === selectedCode);
          const purposeControl = this.getFormControl('Purpose');

          if (purposeControl && purpose) {
            purposeControl.setValue(purpose.value, { emitEvent: true });
            this.currentPurposeSelection = { code: purpose.code, value: purpose.value };
          }
        });
    }
  }

  private setupLicensePurposeCodeCategorySubscription(): void {
    const licensePurposeCodeCategoryControl = this.getFormControl('LicensePurposeCodeCategory');

    if (licensePurposeCodeCategoryControl) {
      licensePurposeCodeCategoryControl.valueChanges
        .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
        .subscribe(categoryValue => {
          const licensePurposeCodeControl = this.getFormControl('LicensePurposeCode');
          const licensePurposeControl = this.getFormControl('LicensePurpose');

          if (licensePurposeCodeControl) {
            licensePurposeCodeControl.setValue('', { emitEvent: false });
          }
          if (licensePurposeControl) {
            licensePurposeControl.setValue('', { emitEvent: false });
          }

          this.licensePurposeCodes$.next([]);

          if (categoryValue) {
            this.searchingLicensePurposeCode.set(true);
            this.transService
              .getLicenseCategoriesList(categoryValue)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (response: any) => {
                  if (response?.responseObject?.licensecode) {
                    const mappedCodes = mapLicensePurposeCodeOptions(response.responseObject.licensecode);
                    this.licensePurposeCodes$.next(mappedCodes as any);
                  }
                  this.searchingLicensePurposeCode.set(false);
                  this.cdr.markForCheck();
                },
                error: () => {
                  this.searchingLicensePurposeCode.set(false);
                  this.cdr.markForCheck();
                },
              });
          }
        });
    }
  }

  private setupLicensePurposeSubscription(): void {
    const licensePurposeCodeControl = this.getFormControl('LicensePurposeCode');

    if (licensePurposeCodeControl) {
      licensePurposeCodeControl.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          switchMap(selectedCode => {
            return this.licensePurposeCode$.pipe(map(licensePurposeCodes => ({ selectedCode, licensePurposeCodes })));
          })
        )
        .subscribe(({ selectedCode, licensePurposeCodes }) => {
          const licensePurpose = licensePurposeCodes.find(code => code.value === selectedCode);
          const licensePurposeControl = this.getFormControl('LicensePurpose');

          if (licensePurposeControl && licensePurpose) {
            licensePurposeControl.setValue(licensePurpose.text, { emitEvent: true });
            this.cdr.markForCheck();
          }
        });
    }
  }

  openBICDialog(formControlName: string): void {
    let countryCode = '';
    if (
      this.transService.contextData?.selectionForm?.transactionType === 'RTGS' ||
      this.transService.contextData?.selectionForm?.transactionType === 'LOCALSWIFT'
    ) {
      countryCode = this.transService.contextData?.selectionForm?.countryCode;
    }
    const dialogRef = this.dialog.open(BicSearchDialog, {
      width: '450px',
      data: { formControlName, countryCode },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.form.get(formControlName)?.patchValue(result.data.split(' - ')[0]); // Patch bank code
        }
      });
  }

  showToast(msg: any): void {
    if (msg) {
      this.toast.show(null, this.translate.instant(msg), MessageBoxType.INFO, 4000);
    }
  }

  getPaymentCodes() {
    const mappedCodes = mapPurposeCodeOptions(this.purposeCodes);
    this.purposeCodes$.next(mappedCodes);

    const purposeCodeControl = this.getFormControl('PurposeCode');
    const purposeControl = this.getFormControl('Purpose');

    if (purposeCodeControl && purposeControl) {
      const currentCode = purposeCodeControl.value;

      if (currentCode) {
        const matchingPurpose = mappedCodes.find(pc => pc.code === currentCode);

        if (matchingPurpose) {
          purposeControl.setValue(matchingPurpose.value, { emitEvent: true });
          this.cdr.markForCheck();
        }
      }
    }
  }

  getBankCodes2(): void {
    const mappedCodes = mapBankCodeOptions(this.bankCodes);
    this.bankCodes$.next(mappedCodes);
  }

  getBranchCodes(): void {
    const mappedCodes = mapBranchCodeOptions(this.branchCodes);
    this.branchCodes$.next(mappedCodes);
  }

  updateIBANFieldLengthValidation(): void {
    const IBANLength = resolveIbanLength(
      this.transService.contextData?.selectionForm?.remitterCountry,
      this.transService.contextData?.selectionForm?.remitterBank
    ) ?? 0;
    const accountNumberField = this.getFormControl('AccountNumber');
    if (accountNumberField) {
      const existingValidators = accountNumberField.validator;
      const validators = existingValidators
        ? [existingValidators, IBANDigitsValidator(IBANLength)]
        : [IBANDigitsValidator(IBANLength)];
      accountNumberField.setValidators(validators);
      accountNumberField.updateValueAndValidity();
    }

    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}

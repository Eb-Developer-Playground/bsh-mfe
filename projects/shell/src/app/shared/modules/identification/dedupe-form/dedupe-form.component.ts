import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  finalize,
  takeUntil,
} from 'rxjs/operators';
import { Country } from '../../../models/country';
import { Nationality } from '../../../models/nationality';
import { StaticDataService } from '../../../services';
import { MessageBoxType, ToastService } from '../../toast';
import { DedupeService, ICIFItem } from '../dedupe.service';
import { IdDocumentService } from '../id-document.service';
import {
  IDedupeCIFResult,
  IDedupeFieldStates,
  IDedupeFormOutput,
  IdTypeDescription,
  IdTypeSpec,
} from '../types';
import { FinacleCity } from '@app/shared/models/finacle-city';
import {
  ISubsidiary,
  SessionService,
} from '@app/shared/services/session/session.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import CONST from '@app/shared/utils/constants';
import { DRCRegions } from '@app/shared/models/regions-drc';
import { subYears } from 'date-fns';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import drc_blacklisted_countries from '../../../../../assets/data/drc_blacklisted_countries.json';
import { RestrictedCountryDialog } from '@app/shared/dialogs/restricted-country-dialog/restricted-country.dialog';
import {
  IMaritalStatus,
  MaritalStatus,
} from '@app/shared/models/marital-status';

const { COUNTRY_CODE } = CONST;
@Component({
  selector: 'app-dedupe-form',
  templateUrl: './dedupe-form.component.html',
  styleUrls: ['./dedupe-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DedupeFormComponent implements OnInit, OnDestroy {
  private readonly _destroyRef = inject(DestroyRef);
  @Output() onDedupeChecked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDedupeCheckedV2: EventEmitter<IDedupeFormOutput> =
    new EventEmitter<IDedupeFormOutput>();
  @Output() onDedupeFormIsValid: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Input() readonly!: boolean;
  @Input() showActions!: boolean;
  @Input() fieldStates!: IDedupeFieldStates;
  @Input() valuesConf!: IdTypeSpec;
  @Input() customerAgeGroup: 'Adult' | 'Minor' = 'Adult';
  @Input() showVerify = true;
  @Input() isCivilServant = false;
  @Input() dedupeForm = this.fb.group({
    nationality: [null, Validators.required],
    countryOfResidence: [null, Validators.required],
    refNum: [null, Validators.required],
    idType: [null, Validators.required],
  });
  @Input() hideDedupeFormButton = false;

  countries$: BehaviorSubject<Country[]> = new BehaviorSubject<Country[]>([]);
  nationalities$: BehaviorSubject<Nationality[]> = new BehaviorSubject<
    Nationality[]
  >([]);

  dedupeCompleted!: boolean;
  selectableIdTypes: IdTypeDescription[] = [];
  canIdTypeChange$: BehaviorSubject<any> = new BehaviorSubject<any>('');

  iCIFItemResult: ICIFItem[] = [];
  dedupeCifResults!: IDedupeCIFResult[];

  selectedDedupe: any;
  destroy$: Subject<any> = new Subject<any>();
  phoneNumberForm: UntypedFormGroup = this.fb.group({
    id: [''],
    phoneType: ['COMMPH1'],
    countryCode: [''],
    cityCode: [null],
    number: [null, [Validators.required]],
    comment: [null],
    isPreferred: [true],
    toBeDeleted: [false],
  });
  subsidiary: ISubsidiary;
  cities$: BehaviorSubject<FinacleCity[]> = new BehaviorSubject<FinacleCity[]>(
    []
  );
  regions$: BehaviorSubject<DRCRegions[]> = new BehaviorSubject<DRCRegions[]>(
    []
  );
  maritalStatus$: BehaviorSubject<IMaritalStatus[]> = new BehaviorSubject<
    IMaritalStatus[]
  >([]);

  restrictedCountries = drc_blacklisted_countries;
  public minDate: Date = subYears(new Date(), 100);
  public maxDate: Date = subYears(new Date(), 18);
  isTZCD: boolean = false;

  constructor(
    private fb: UntypedFormBuilder,
    private toast: ToastService,
    private service: DedupeService,
    private session: SessionService,
    private dataService: StaticDataService,
    public documentService: IdDocumentService,
    protected dialog: MatDialog,
    private router: Router
  ) {
    this.subsidiary = this.session.subsidiary;

    forkJoin([
      this.dataService.getCountries(),
      this.dataService.getNationalities(),
      this.dataService.getCities(),
      this.dataService.getDRCRegions(),
      this.dataService.getMaritalStatuses(),
    ]).subscribe(
      ([countries, nationalities, cities, regions, maritalStatus]) => {
        // countries
        countries.sort((a, b) => a.countryName.localeCompare(b.countryName));
        this.countries$.next(countries.map(c => new Country(c)));

        // nationalities
        nationalities.sort((a, b) =>
          a.nationalityName.localeCompare(b.nationalityName)
        );
        this.nationalities$.next(nationalities.map(b => new Nationality(b)));

        // cities
        cities.sort((a, b) => a.cityPlaceName.localeCompare(b.cityPlaceName));
        this.cities$.next(
          cities
            .filter(c => c.cityPlaceName !== '.')
            .map(b => new FinacleCity(b))
        );

        //Marital status
        maritalStatus.sort((a, b) => a.codeDesc.localeCompare(b.codeDesc));
        this.maritalStatus$.next(maritalStatus.map(c => new MaritalStatus(c)));

        // Regions
        if (this.subsidiary.countryCode === 'CD' && regions) {
          regions.sort((a, b) => a.text.localeCompare(b.text));
          this.regions$.next(regions.map(c => new DRCRegions(c)));
        } else if (this.subsidiary.countryCode === 'CD') {
          this.regions$.next([]);
        }
      }
    );
  }
  ngOnInit() {
    // Conditionally set the countryCode based on subsidiary.countryCode
    if (this.subsidiary.countryCode === COUNTRY_CODE.CD) {
      this.phoneNumberForm.get('countryCode')?.setValue('243');
    } else {
      this.phoneNumberForm.get('countryCode')?.setValue('');
    }

    //drc
    if (this.subsidiary.bankId === '43') {
      this.dedupeForm
        .get('nationality')
        ?.valueChanges.pipe(
          distinctUntilChanged(),
          filter(value => !!value),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe(ch => {
          this.dedupeForm.patchValue({
            idType: this.fieldStates?.idType?.value,
          });
          this.canIdTypeChange$.next(ch);
          // TODO: Implement universal country banklist as a rule
          if (this.subsidiary.countryCode === COUNTRY_CODE.CD)
            this.handleRestrictedCountries(ch);
          this.handleExtraFields();
        });
      if (this.subsidiary.countryCode === COUNTRY_CODE.CD) {
        this.dedupeForm
          .get('countryOfResidence')
          ?.valueChanges.pipe(
            distinctUntilChanged(),
            takeUntilDestroyed(this._destroyRef)
          )
          .subscribe(ch => {
            if (this.subsidiary.countryCode === COUNTRY_CODE.CD)
              this.handleRestrictedCountries(ch);
          });
      }

      if (this.subsidiary.countryCode !== COUNTRY_CODE.CD) {
        this.dedupeForm
          .get('countryOfResidence')
          ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe(ch => this.canIdTypeChange$.next(ch));
      }
      this.canIdTypeChange$
        .asObservable()
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => this.setIdTypes());

      this.dedupeForm
        .get('idType')
        ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(type => {
          this.valuesConf = <IdTypeSpec>(
            this.documentService.docSpecs.find(
              d =>
                d.idType === type &&
                d.countryCode === this.subsidiary.countryCode
            )
          );

          this.documentService.setRefNumberValidations(
            type,
            this.dedupeForm.get('refNum')
          );
        });

      this.dedupeForm.valueChanges
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          if (!this.dedupeCompleted) return;
          this.dedupeCompleted = false;
        });
      this.handleExtraFields();

      // Dedupe Logic for the other subsidiaries
    } else {
      this.dedupeForm
        .get('refNum')
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.dedupeCifResults = [];
        });

      this.dedupeForm
        .get('nationality')
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe(ch => this.canIdTypeChange$.next(ch));

      this.dedupeForm
        .get('countryOfResidence')
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe(ch => this.canIdTypeChange$.next(ch));

      this.canIdTypeChange$
        .asObservable()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          const nationality = this.dedupeForm.get('nationality')?.value;
          const countryOfResidence =
            this.dedupeForm.get('countryOfResidence')?.value;
          if (nationality && countryOfResidence) {
            this.selectableIdTypes = this.documentService
              .getPrimaryIdTypes(
                nationality,
                countryOfResidence,
                undefined,
                this.customerAgeGroup
              )
              .filter(s => s.isPrimary);
          }
        });

      this.dedupeForm
        .get('idType')
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe(type => {
          this.valuesConf = <IdTypeSpec>(
            this.documentService.DOC_SPECS.find(d => d.idType === type)
          );
          this.documentService.setRefNumberValidations(
            type,
            this.dedupeForm.get('refNum')
          );
        });

      this.dedupeForm.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (!this.dedupeCompleted) return;
          this.dedupeCompleted = false;
        });

      this.dedupeForm.statusChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(status => {
          const isValid = status === 'VALID';
          if (!isValid) {
            this.dedupeCifResults = [];
          }
          this.onDedupeFormIsValid.emit(isValid);
        });

      this.service
        .getDoDedupeObs()
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          if (data) {
            this.performDedupe();
          }
        });
    }
    // this.storeCountryMappings();
  }

  // private storeCountryMappings() {
  //   this.dedupeForm.get('nationality')?.valueChanges
  //     .pipe(takeUntilDestroyed(this._destroyRef))
  //     .subscribe(value => {
  //       const nationality = this.nationalities$.value.find(n => n.nationalityCode === value);
  //       if (nationality) {
  //         localStorage.setItem('selectedNational', JSON.stringify({
  //           code: nationality.nationalityCode,
  //           text: nationality.nationalityName
  //         }));

  //       }
  //     });

  //   this.dedupeForm.get('countryOfResidence')?.valueChanges
  //     .pipe(takeUntilDestroyed(this._destroyRef))
  //     .subscribe(value => {
  //       const country = this.countries$.value.find(c => c.countryCode === value);
  //       if (country) {
  //         localStorage.setItem('selectedResidence', JSON.stringify({
  //           code: country.countryCode,
  //           text: country.countryName
  //         }));
  //       }
  //     });
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fieldStates?.currentValue) this.patchForm();
  }

  setIdTypes() {
    const nationality = this.dedupeForm.get('nationality')?.value;
    const countryOfResidence = this.dedupeForm.get('countryOfResidence')?.value;
    if (nationality && countryOfResidence) {
      this.selectableIdTypes = this.documentService
        .getIdTypes(
          nationality,
          countryOfResidence,
          undefined,
          this.customerAgeGroup
        )
        .filter(s => s.isPrimary);

      if (this.selectableIdTypes.length === 0)
        this.dedupeForm.patchValue({ idType: null });
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  handleRestrictedCountries(nationality: string): void {
    const restricted = this.restrictedCountries.some(
      country => country.countryCode === nationality
    );

    if (restricted) {
      const dialogRef = this.dialog.open(RestrictedCountryDialog, {
        width: '550px',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/dashboard']).then(() => {});
        }
      });
    }
  }

  handleExtraFields() {
    if (
      this.subsidiary.countryCode === 'TZ' &&
      this.customerAgeGroup === 'Adult'
    ) {
      this.dedupeForm.addControl(
        'emailAddress',
        new FormControl('', Validators.email)
      );
      this.dedupeForm.addControl('phoneNumber', this.phoneNumberForm);
    } else if (
      this.subsidiary.countryCode === COUNTRY_CODE.CD &&
      this.customerAgeGroup === 'Adult'
    ) {
      this.dedupeForm.addControl(
        'firstName',
        new FormControl('', Validators.required)
      );
      this.dedupeForm.addControl('middleName', new FormControl(''));
      this.dedupeForm.addControl(
        'lastName',
        new FormControl('', Validators.required)
      );
      this.dedupeForm.addControl('otherName', new FormControl(''));
      this.dedupeForm.addControl(
        'birthPlace',
        new FormControl('', Validators.required)
      );
      this.dedupeForm.addControl(
        'birthDate',
        new FormControl('', Validators.required)
      );
      this.dedupeForm.addControl('phoneNumber', this.phoneNumberForm);
      this.dedupeForm.addControl(
        'emailAddress',
        new FormControl('', Validators.email)
      );
    } else {
      [
        'firstName',
        'middleName',
        'lastName',
        'emailAddress',
        'phoneNumber',
        'otherName',
        'birthPlace',
        'birthDate',
      ].forEach(f => this.dedupeForm.removeControl(f));
    }
    this.dedupeForm.updateValueAndValidity();
  }

  ngOnDestroy() {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  // onSelectedICIFItem(event: ICIFItem) {
  //   const formValues = this.dedupeForm.getRawValue();

  //   this.selectedDedupe = {
  //     formValues: { ...formValues, status: 'EXISTINGUSER' },
  //     result: [event],
  //   };

  //   this.onDedupeChecked.emit({
  //     formValues: { ...formValues, status: 'EXISTINGUSER' },
  //     result: [event],
  //   });
  // }
  onCifSelected(cifResult: IDedupeCIFResult) {
    this.onDedupeChecked.emit({
      formValues: { ...this.dedupeForm.getRawValue(), status: 'EXISTINGUSER' },
      result: [cifResult],
    });
  }

  performDedupe() {
    const formValues = this.dedupeForm.getRawValue();
    this.service
      .performDedupe(formValues.idType, formValues.refNum)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (resp: {
          statusMessage: string;
          statusCode: string;
          successful: boolean;
          responseObject: ICIFItem[];
        }) => {
          const dedupeCifResults = resp.responseObject.filter(
            (item: any) =>
              item.isSuspended === 'N' ||
              item.isSuspended === false ||
              !item.isSuspended
          );
          if (dedupeCifResults.length > 1) {
            this.dedupeCifResults = dedupeCifResults;

            //disable next button waiting for the cif selection
            this.onDedupeFormIsValid.emit(false);

            // this.onDedupeChecked.emit({
            //     formValues: formValues,
            //     result: resp.responseObject,
            // });
          }

          if (dedupeCifResults.length === 1) {
            this.onDedupeChecked.emit({
              formValues: { ...formValues, status: 'EXISTINGUSER' },
              result: resp.responseObject,
            });
          }

          // "User not found"
          if (dedupeCifResults.length === 0) {
            this.onDedupeChecked.emit({
              formValues: { ...formValues, status: 'NONEXISTINGUSER' },
              result: resp.responseObject,
            });
          }
        },
        error: err => {
          this.toast.show(
            null,
            err.message || `Unable to perform dedupe!`,
            MessageBoxType.WARNING,
            5000,
            undefined,
            undefined,
            false
          );
        },
      });
  }

  // Perform Dedupe for DRC Form
  performDedupeDRC() {
    const formValues = this.dedupeForm.getRawValue();
    let dedupeCall$ = null;

    const {
      idType,
      refNum,
      firstName,
      lastName,
      phoneNumber,
      emailAddress,
      birthDate,
      birthPlace,
    } = formValues;

    if (this.subsidiary.countryCode === 'TZ') {
      const phoneDetails = this.phoneNumberForm.getRawValue();
      dedupeCall$ = this.service.performDedupeV2(
        formValues.idType,
        formValues.refNum,
        {
          phone: `${phoneDetails.countryCode}${phoneDetails?.cityCode || ''}${phoneDetails.number}`,
          email: this.dedupeForm.get('emailAddress')?.value,
        }
      );
    } else if (this.subsidiary.countryCode === COUNTRY_CODE.CD) {
      const phoneDetails = this.phoneNumberForm.getRawValue();
      const phone = `${phoneDetails.countryCode}${phoneDetails?.cityCode || ''}${phoneDetails.number}`;
      dedupeCall$ = this.service.performDRCDedupe(
        idType,
        refNum,
        firstName,
        lastName,
        phone,
        emailAddress,
        birthDate,
        birthPlace
      );
    } else {
      dedupeCall$ = this.service.performDedupeDRC(
        formValues.idType,
        formValues.refNum
      );
    }

    if (!dedupeCall$) {
      return;
    }

    dedupeCall$.subscribe({
      next: resp => {
        if (resp.successful && resp.responseObject) {
          const dedupeCifResults = resp.responseObject.filter(
            (item: any) =>
              item.isSuspended === 'N' || item.isSuspended === false ||
              !item.isSuspended // Allow 'N', false, null, undefined
          );

          const selectedNationality = this.nationalities$.value.find(
            n => n.nationalityCode === formValues.nationality
          );
          const selectedCountry = this.countries$.value.find(
            c => c.countryCode === formValues.countryOfResidence
          );
          const selectedCity = this.cities$.value.find(
            c => c.cityPlaceCode === formValues.birthPlace
          );
          const selectedRegion = this.regions$.value.find(
            r => r.value === resp.responseObject[0]?.region
          )?.text;
          const selectedMaritalStatus = this.maritalStatus$.value.find(
            m => m.code === resp.responseObject[0]?.maritalStatus
          )?.codeDesc;

          const languageMap = {
            EN: 'English',
            FR: 'French',
            SW: 'Swahili',
          };

          const selectedLanguage =
            languageMap[
              resp.responseObject[0]
                ?.preferredLanguageCode as keyof typeof languageMap
            ];

          if (dedupeCifResults.length > 1) {
            this.dedupeCifResults = dedupeCifResults;
            this.onDedupeFormIsValid.emit(false);
          } else if (dedupeCifResults.length === 1) {
            this.onDedupeChecked.emit({
              successful: resp.successful,
              statusMessage: resp.statusMessage,
              formValues: {
                ...formValues,
                status: 'EXISTINGUSER',
                nationality: selectedNationality?.nationalityName,
                countryOfResidence: selectedCountry?.countryName,
                birthPlace: selectedCity?.cityPlaceName,
                region: selectedRegion,
                maritalStatus: selectedMaritalStatus,
                preferredLanguageCode: selectedLanguage,
              },
              result: [
                {
                  cif: dedupeCifResults[0]?.cifNumber || null,
                  ...dedupeCifResults[0],
                },
              ],
            });
          } else {
            this.onDedupeChecked.emit({
              successful: resp.successful,
              statusMessage: resp.statusMessage,
              formValues: { ...formValues, status: 'NONEXISTINGUSER' },
              result: resp.responseObject,
            });
          }
        } else {
          this.toast.show(
            null,
            `Dedupe; ${resp.statusMessage}`,
            MessageBoxType.DANGER
          );
        }
      },
      error: (msg: any) => {
        this.toast.show(
          null,
          msg?.message || 'Dedupe failed!',
          MessageBoxType.DANGER
        );
      },
    });
  }

  resetForm(): void {
    this.dedupeForm.reset();
    this.dedupeCompleted = false;
  }

  patchForm() {
    if (this.fieldStates) {
      this.dedupeForm.patchValue({
        nationality: this.fieldStates.nationality.value,
        countryOfResidence: this.fieldStates.countryOfResidence.value,
        idType: this.fieldStates.idType.value,
        refNum: this.fieldStates.refNum.value,
      });
      this.setIdTypes();
    }
  }

  initMaxDate = () => {
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  };
}

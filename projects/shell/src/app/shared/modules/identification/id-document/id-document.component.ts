import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  takeUntil,
} from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { IdDocumentService } from '../id-document.service';
import {
  ID_TYPES,
  IdDocumentFieldStates,
  IdTypeDescription,
  IdTypeSpec,
} from '../types';
import { StaticDataService } from '../../../services';
import { DedupeService } from '../dedupe.service';
import { Country } from '../../../models/country';
import { FinacleCity } from '../../../models/finacle-city';

@Component({
  selector: 'app-id-document',
  templateUrl: './id-document.component.html',
  styleUrls: ['./id-document.component.scss'],
})
export class IdDocumentComponent implements OnInit, OnChanges, OnDestroy {
  @Input() index!: number;
  @Input() readonly!: boolean;
  @Input() fieldStates!: IdDocumentFieldStates;
  @Input() selectedTypes!: string[];
  @Input() documentForm: UntypedFormGroup = this.fb.group({
    documentId: [''],
    idType: [''],
    countryOfIssue: [''],
    placeOfIssue: ['', Validators.required],
    docCode: [''],
    docDescr: [''],
    docTypeCode: [''],
    docTypeDesc: [''],
    docIssueDt: [''],
    expDt: [''],
    refNum: [''],
    serialNumber: [''],
    isMandatory: [false],
    isDocumentVerified: [false],
    preferredUniqueId: [false],
    idIssuedOrganisation: [''],
  });
  @Input() valuesConf!: IdTypeSpec;
  @Input() minIssueDate: Date = new Date(new Date().getFullYear() - 100, 1, 1);
  @Input() maxIssueDate: Date = new Date();
  @Input() minExpiryDate: Date = new Date();
  @Input() selectableIdTypes!: IdTypeDescription[];
  @Output() preferredToggled: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  countries$: BehaviorSubject<Country[]> = new BehaviorSubject<Country[]>([]);
  cities$: BehaviorSubject<FinacleCity[]> = new BehaviorSubject<FinacleCity[]>(
    []
  );
  destroy$: Subject<any> = new Subject<any>();

  get title(): string {
    if (this.index === 0) {
      return 'Primary identification document';
    } else if (this.index === 1) {
      return 'Secondary identification document';
    } else if (this.index > 1) {
      return `Alternative identification document ${this.index - 1}`;
    }
    return 'Identification document';
  }

  get isMandatory(): boolean {
    return !!this.documentForm.get('isMandatory')?.value;
  }

  get displaySerialNumber(): boolean {
    return [ID_TYPES.NationalId, ID_TYPES.ForeignId].includes(
      this.documentForm.get('idType')?.value
    );
  }

  get displayExpiryDate(): boolean {
    return ![
      ID_TYPES.NationalId,
      ID_TYPES.BirthCertificate,
      ID_TYPES.UNHCRPROOF,
    ].includes(this.documentForm.get('idType')?.value);
  }

  get displayCountryOfIssue(): boolean {
    return [ID_TYPES.ForeignPassport].includes(
      this.documentForm.get('idType')?.value
    );
  }

  constructor(
    private fb: UntypedFormBuilder,
    private dedupe: DedupeService,
    private dataService: StaticDataService,
    public service: IdDocumentService
  ) {
    this.dataService.getCountries().subscribe(data => {
      data.sort((a, b) => a.countryName.localeCompare(b.countryName));
      this.countries$.next(data.map(c => new Country(c)));
    });

    this.dataService.getCities().subscribe(data => {
      data.sort((a, b) => a.cityPlaceName.localeCompare(b.cityPlaceName));
      this.cities$.next(
        data.filter(c => c.cityPlaceName !== '.').map(b => new FinacleCity(b))
      );
    });
  }

  ngOnInit() {
    if (this.documentForm?.get('idType')?.getRawValue())
      this.setupValidations(this.documentForm?.get('idType')?.getRawValue());
    this.documentForm
      ?.get('idType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(type => this.setupValidations(type));
    this.documentForm
      ?.get('refNum')
      ?.valueChanges.pipe(
        debounceTime(5500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const idTypeCtl = this.documentForm.get('idType');
        const refNumCtl = this.documentForm.get('refNum');
        if (idTypeCtl?.value && refNumCtl?.value)
          this.dedupe
            .performDedupe(idTypeCtl?.value, refNumCtl?.value, {
              headers: { skipLoadingInterceptor: 'true' },
            })
            .subscribe({
              next: (resp: any) => {
                if (!resp?.successful) {
                  refNumCtl.setErrors({ dedupeFailed: true });
                  refNumCtl.updateValueAndValidity({ emitEvent: false });
                  this.documentForm.updateValueAndValidity({
                    emitEvent: false,
                  });
                }
              },
            });
      });
    this.patchValues();
  }

  setupValidations(type: string): void {
    const idTypeSpec = this.service.DOC_SPECS.find(d => d.idType === type);
    this.valuesConf = <IdTypeSpec>idTypeSpec;
    const numControl = this.documentForm.get('refNum');
    this.documentForm.patchValue(
      {
        docCode: idTypeSpec?.docCode,
        docDescr: idTypeSpec?.docDescr,
        docTypeCode: idTypeSpec?.docTypeCode,
        docTypeDesc: idTypeSpec?.docTypeDesc,
        countryOfIssue: idTypeSpec?.countryOfIssue,
      },
      { emitEvent: false }
    );
    this.service.setRefNumberValidations(<ID_TYPES>type, numControl);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fieldStates?.currentValue) {
      this.patchValues();
    }
  }

  ngOnDestroy() {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  patchValues(): void {
    if (this.fieldStates) {
      const payload: { [key: string]: any } = {};
      if (this.fieldStates.documentId?.value)
        payload['documentId'] = this.fieldStates.documentId?.value;
      if (this.fieldStates.idType?.value)
        payload['idType'] = this.fieldStates.idType?.value;
      if (this.fieldStates.countryOfIssue?.value)
        payload['countryOfIssue'] = this.fieldStates.countryOfIssue?.value;
      if (this.fieldStates.placeOfIssue?.value)
        payload['placeOfIssue'] = this.fieldStates.placeOfIssue?.value;
      if (this.fieldStates.docCode?.value)
        payload['docCode'] = this.fieldStates.docCode?.value;
      if (this.fieldStates.docDescr?.value)
        payload['docDescr'] = this.fieldStates.docDescr?.value;
      if (this.fieldStates.docTypeCode?.value)
        payload['docTypeCode'] = this.fieldStates.docTypeCode?.value;
      if (this.fieldStates.docTypeDesc?.value)
        payload['docTypeDesc'] = this.fieldStates.docTypeDesc?.value;
      if (this.fieldStates.docIssueDt?.value)
        payload['docIssueDt'] = this.fieldStates.docIssueDt?.value;
      if (this.fieldStates.expDt?.value)
        payload['expDt'] = this.fieldStates.expDt?.value;
      if (this.fieldStates.refNum?.value)
        payload['refNum'] = this.fieldStates.refNum?.value;
      if (this.fieldStates.serialNumber?.value)
        payload['serialNumber'] = this.fieldStates.serialNumber?.value;
      if (this.fieldStates.isMandatory?.value)
        payload['isMandatory'] = this.fieldStates.isMandatory?.value;
      if (this.fieldStates.isDocumentVerified?.value)
        payload['isDocumentVerified'] =
          this.fieldStates.isDocumentVerified?.value;
      if (this.fieldStates.preferredUniqueId?.value)
        payload['preferredUniqueId'] =
          this.fieldStates.preferredUniqueId?.value;
      if (this.fieldStates.idIssuedOrganisation?.value)
        payload['idIssuedOrganisation'] =
          this.fieldStates.idIssuedOrganisation?.value;
      this.documentForm.patchValue(payload);
    }
  }
}

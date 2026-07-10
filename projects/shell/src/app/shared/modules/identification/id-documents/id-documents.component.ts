import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { IdDocumentService } from '../id-document.service';
import { ID_TYPES, IdDocumentFieldStates, IdTypeDescription } from '../types';

@Component({
  selector: 'app-id-documents',
  templateUrl: './id-documents.component.html',
  styleUrls: ['./id-documents.component.scss'],
})
export class IdDocumentsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() nationality!: string;
  @Input() countryOfResidence!: string;
  @Input() dedupeIdType!:
    | ID_TYPES.NationalId
    | ID_TYPES.ForeignId
    | ID_TYPES.RefugeeId;
  @Input() customerAgeGroup: 'Adult' | 'Minor' = 'Adult';
  // Others
  @Input() readonly!: boolean;
  @Input() parentForm!: UntypedFormGroup;
  @Input() parentFormControlName!: string;
  @Input() documentsFormArray: UntypedFormArray = this.fb.array([]);
  @Input() fieldStates?: IdDocumentFieldStates[];
  @Input() stateChanged!: boolean;
  @Input() enableMultiple = true;
  selectableIdTypes: IdTypeDescription[] = [];
  selectedIdTypes: string[] = [];
  nationalityForm: UntypedFormGroup = this.fb.group({
    nationality: [null, Validators.required],
    countryOfResidence: [null, Validators.required],
  });
  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private fb: UntypedFormBuilder,
    private service: IdDocumentService
  ) {}

  ngOnInit() {
    if (this.nationality && this.countryOfResidence && this.dedupeIdType)
      this.setMandatoryDocuments();
    if (this.parentForm && this.parentFormControlName) {
      this.parentForm.addControl(
        this.parentFormControlName,
        this.documentsFormArray
      );
    }
    this.documentsFormArray.valueChanges
      .pipe(startWith([]), takeUntil(this.destroy$))
      .subscribe(() => this.performChecks());
    this.nationalityForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Required ID TYPES
        if (this.nationalityForm.valid) {
          this.setMandatoryDocuments();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fieldStates?.currentValue) {
      this.patchValues();
    }
    if (changes.nationality || changes.countryOfResidence) {
      this.setMandatoryDocuments();
    }
  }

  ngOnDestroy() {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  getIdDocumentForm(ind: number): UntypedFormGroup {
    return <UntypedFormGroup>this.documentsFormArray.at(ind);
  }

  getIdDocumentState(idType: string): any {
    return this.fieldStates?.find(f => f.idType?.value === idType);
  }

  isDocumentReadOnly(idType: string): boolean {
    const id = this.getIdDocumentState(idType);
    return (
      id?.refNum?.readonly && id?.docCode?.readonly && id?.docTypeCode?.readonly
    );
  }

  performChecks(): void {
    this.selectedIdTypes = this.documentsFormArray.controls.map(
      (i, ind) => this.documentsFormArray.at(ind).get('idType')?.value
    );
  }

  preferredIdToggled(isTrue: boolean, ind: number) {
    if (isTrue) {
      this.documentsFormArray.controls.forEach((v, i) => {
        if (ind !== i)
          this.documentsFormArray
            .at(i)
            .get('preferredUniqueId')
            ?.setValue(false);
      });
    }
  }

  setMandatoryDocuments(): void {
    this.selectableIdTypes = this.service.getPrimaryIdTypes(
      this.nationalityForm.get('nationality')?.value || this.nationality,
      this.nationalityForm.get('countryOfResidence')?.value ||
        this.countryOfResidence,
      this.dedupeIdType,
      this.customerAgeGroup
    );
    const idTypes = this.documentsFormArray.controls.map(
      (i, ind) => this.documentsFormArray.at(ind).get('idType')?.value
    );
    this.documentsFormArray.clear();
    this.selectableIdTypes
      .filter(d => d.isMandatory || d.isPrimary)
      .forEach((d, ind) => {
        if (!idTypes.includes(d)) {
          const conf = this.service.DOC_SPECS.find(s => s.idType === d.value);
          this.addIdDocument();
          this.documentsFormArray.at(ind).get('idType')?.setValue(d.value);
          this.documentsFormArray
            .at(ind)
            .get('docCode')
            ?.setValue(conf?.docCode);
          this.documentsFormArray
            .at(ind)
            .get('docDescr')
            ?.setValue(conf?.docDescr);
          this.documentsFormArray
            .at(ind)
            .get('docTypeCode')
            ?.setValue(conf?.docTypeCode);
          this.documentsFormArray
            .at(ind)
            .get('docTypeDesc')
            ?.setValue(conf?.docTypeDesc);
          this.documentsFormArray
            .at(ind)
            .get('countryOfIssue')
            ?.setValue(conf?.countryOfIssue);
          this.documentsFormArray.at(ind).get('isMandatory')?.setValue(true);
          this.documentsFormArray
            .at(ind)
            .get('isDocumentVerified')
            ?.setValue(true);
          this.documentsFormArray
            .at(ind)
            .get('preferredUniqueId')
            ?.setValue(d.isPrimary);
        }
      });
  }

  addIdDocument(): void {
    this.documentsFormArray.push(
      this.fb.group({
        documentId: [''],
        idType: [''],
        countryOfIssue: [''],
        placeOfIssue: [''],
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
      })
    );
  }

  removeIdDocument(ind: number): void {
    this.documentsFormArray.removeAt(ind);
  }

  patchValues(): void {
    if (this.fieldStates) {
      this.fieldStates.forEach((ph, ind) => {
        if (!this.documentsFormArray.at(ind)) {
          this.addIdDocument();
        }
      });
    }
  }
}

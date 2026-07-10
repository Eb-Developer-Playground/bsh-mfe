import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { KraPinService } from 'src/app/shared/modules/identification/kra-pin.service';
import { IdentityService } from 'src/app/shared/modules/identification/identity.service';
import { ApiService, SessionService } from 'src/app/shared/services';

import { IdDocumentFieldStates } from 'src/app/shared/modules/identification/types';

import { finalize, map } from 'rxjs/operators';
import { CustomerCifDetailsFilteringService } from '../../services/customer-cif-details-filtering.service';
import { ExistingCustomerComponent } from 'src/app/shared/components/existing-customer/existing-customer.component';
import {
  ICIFItem,
  IDedupeResult,
} from '../../../identification/dedupe.service';
import { MatDialog } from '@angular/material/dialog';
import { ISubsidiary } from '@app/shared/services/session/session.service';

@Component({
  selector: 'app-customer-dedupe-and-identification-details',
  templateUrl: './customer-dedupe-and-identification-details.component.html',
  styleUrls: ['./customer-dedupe-and-identification-details.component.scss'],
})
export class CustomerDedupeAndIdentificationDetailsComponent implements OnInit {
  @Input() subsidiaryCountry!: string;
  @Input() parentForm!: UntypedFormGroup;
  @Input() parentFormControlName!: string;
  @Input() sharedRequestId?: string;

  @Input() redirectExistingToStaticData?: boolean;
  @Input() doNotRedirectToLandingOnCancel?: boolean;

  @Output() onDedupeChecked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onIPRSChecked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onIPRSCheckFailed: EventEmitter<void> = new EventEmitter<void>();
  @Output() onKRAChecked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSearchReset: EventEmitter<void> = new EventEmitter<void>();

  @Output() onDedupeFormIsValid: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  public dedupeChecked = false;
  public customerExists = false;
  public iprsChecked = false;

  public selectedIdSerialNumber?: string;
  public selectedIdIssueDate?: string;
  public primaryIdFieldState?: IdDocumentFieldStates;
  public formValues: any;
  // public bankId= JSON.parse(localStorage.getItem('subsidiary-bank-id') || '');
  public subsidiary!: ISubsidiary;
  public dedupeForm!: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private idService: IdentityService,
    private sessionService: SessionService,
    private kraService: KraPinService,
    private api: ApiService,
    private dialog: MatDialog,
    private router: Router,
    private customerCifDetailsFilteringService: CustomerCifDetailsFilteringService
  ) {
    this.subsidiary = this.sessionService.subsidiary;
  }

  ngOnInit() {
    this.dedupeForm = this.fb.group({
      nationality: [this.subsidiary?.countryCode || '', Validators.required],
      countryOfResidence: [
        this.subsidiary?.countryCode || '',
        Validators.required,
      ],
      refNum: [null, Validators.required],
      idType: [null, Validators.required],
    });
    this.initDedupeFormChangeWatch();
  }

  initDedupeFormChangeWatch = () => {
    this.dedupeForm.valueChanges.subscribe(() => {
      if (!this.dedupeChecked) return;
      this.formValues = null;
      this.dedupeChecked = false;
      this.onSearchReset.emit();
    });
  };

  dedupeCheckPerformed = (event: IDedupeResult) => {
    this.dedupeChecked = true;
    if (this.subsidiary.bankId === '43') {
      const existingCustomerResult = event.result?.length
        ? event.result.find((el: any) => el.cifNumber)
        : null;

      this.customerExists = !!existingCustomerResult;
      this.formValues = event.formValues;
      if (this.customerExists && existingCustomerResult?.cifNumber) {
        this.initExistingUser(existingCustomerResult?.cifNumber);
        return;
      }
      const eventCopy = JSON.parse(JSON.stringify(event));
      eventCopy.result = { cif: existingCustomerResult?.cifNumber };

      this.onDedupeChecked.emit(eventCopy);
    } else {
      const existingCustomerResult = event.result?.length
        ? event.result.find((el: ICIFItem) => el.cifId && !el.isSuspended)
        : null;
      this.customerExists = !!existingCustomerResult;
      this.formValues = event.formValues;

      if (this.customerExists && existingCustomerResult?.cifId) {
        this.initExistingUser(existingCustomerResult.cifId);
        return;
      }
      const eventCopy = JSON.parse(JSON.stringify(event));
      eventCopy.result = { cif: existingCustomerResult?.cifId };
      this.onDedupeChecked.emit(eventCopy);
    }

    switch (this.subsidiaryCountry) {
      case 'KE':
        this.performIPRSCheck();
        this.performKRACheck();
        break;
      default:
        break;
    }
  };

  initExistingUser = (cif: string) => {
    const data = {
      CustomerID: cif,
      BankID: this.sessionService.userBank,
    };
    this.api
      .post<any>('/v2/account/cifinquiry', data)
      .pipe(
        map((result: any) =>
          this.customerCifDetailsFilteringService.removeDuplicateIdentificationDetails(
            result
          )
        )
      )
      .subscribe((result: any) => {
        this.onDedupeChecked.emit({
          userData: result.responseObject,
          formValues: this.formValues,
        });
        //this.openExistingCustomerDialog(result.responseObject);
      });
  };

  openExistingCustomerDialog = (customer: any) => {
    const dialogRef = this.dialog.open(ExistingCustomerComponent, {
      width: '400px',
      data: customer,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) {
        if (!this.doNotRedirectToLandingOnCancel) this.router.navigateByUrl('');
        return;
      }
      if (this.redirectExistingToStaticData) {
        // const redirectUrl = `/services/static-data/ke/individual?cif=${customer.personalDetails.customerId}&bankId=54`;
        // this.router.navigateByUrl(redirectUrl);
        this.router.navigateByUrl('');
        return;
      }
      this.onDedupeChecked.emit({
        userData: customer,
        formValues: this.formValues,
      });
    });
  };

  performIPRSCheck = () => {
    if (!this.shouldPerformIPRSCheck) {
      this.primaryIdFieldState = {
        idType: {
          value: this.selectedIdType,
          readonly: true,
        },
        refNum: {
          value: this.selectedIdNumber,
          readonly: true,
        },
      };
      this.iprsChecked = true;
      return;
    }
    this.idService
      .validateIPRS(
        this.selectedNationality,
        this.selectedIdType,
        this.selectedIdNumber,
        this.sharedRequestId
      )
      .pipe(
        finalize(() => {
          this.primaryIdFieldState = {
            idType: {
              value: this.selectedIdType,
              readonly: true,
            },
            refNum: {
              value: this.selectedIdNumber,
              readonly: true,
            },
            serialNumber: {
              value: this.selectedIdSerialNumber,
              readonly: !!this.selectedIdSerialNumber,
            },
            docIssueDt: {
              value: this.selectedIdIssueDate,
              readonly: !!this.selectedIdIssueDate,
            },
          };
        })
      )
      .subscribe(
        (result: any) => {
          if (!result?.serialNumber) {
            this.iprsChecked = true;
            return;
          }
          // if result contains user info
          this.onIPRSChecked.emit(result);
          this.selectedIdSerialNumber = result.serialNumber;
          this.selectedIdIssueDate = result.issueDate;
          this.iprsChecked = true;
        },
        (error: any) => {
          this.iprsChecked = true;
          this.onIPRSCheckFailed.emit();
        }
      );
  };

  performKRACheck = () => {
    this.kraService
      .validatePersonalKRA(
        this.selectedNationality,
        this.selectedIdType,
        this.selectedIdNumber,
        this.selectedCountryOfResidence,
        this.sharedRequestId
      )
      .subscribe((result: any) => {
        if (result?.responseObject)
          this.onKRAChecked.emit(result.responseObject);
      });
  };

  dedupeFormIsValid(isValid: boolean) {
    this.onDedupeFormIsValid.emit(isValid);
  }

  get selectedNationality(): string {
    return this.dedupeForm?.get('nationality')?.value || '';
  }

  get selectedCountryOfResidence(): string {
    return this.dedupeForm?.get('countryOfResidence')?.value || '';
  }

  get selectedIdType(): any {
    return this.dedupeForm.get('idType')?.value || '';
  }

  get selectedIdNumber(): string {
    return this.dedupeForm?.get('refNum')?.value || '';
  }

  get shouldPerformIPRSCheck(): boolean {
    return this.selectedNationality === 'KE';
  }

  get idDetailsFormIsValid(): boolean {
    return this.parentForm.get(this.parentFormControlName)?.valid || false;
  }

  get shouldDisplayFullIdForm(): boolean {
    return this.dedupeChecked && this.iprsChecked;
  }
}

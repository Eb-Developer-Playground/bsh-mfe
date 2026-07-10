import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
// import {AccountService} from 'src/app/shared/services/account/account.service';
import { AccountService } from '@app/core/services';
import { EddFormPrintComponent } from './form-print/edd-form-print.component';
import {
  ContextManager,
  OnActive,
  OnSave,
  StepperChildComponent,
} from '../stepper';
import { DocumentsService } from '../../services/document/document.service';
import { MatDialog } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../compat-barrel';

export function requireCategoryMatch(dummyCat: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const selection: any = control.value;
    const found = dummyCat.find(
      (el: { category: any }) => el.category === selection
    );
    if (dummyCat && !found) {
      return { requireCategoryMatch: true };
    }
    return null;
  };
}

export function requireOccupationMatch(arr: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const selection: any = control.value;
    const found = arr.find(
      (el: { codeDesc: any }) => el.codeDesc === selection
    );
    if (arr && !found) {
      return { requireOccupationMatch: true };
    }
    return null;
  };
}

export function validateEmail(
  control: AbstractControl
): { [key: string]: any } | null {
  const emailRegEx =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
  const valid = emailRegEx.test(control.value);
  return control.value < 1 || valid ? null : { invalidEmail: true };
}

@Component({
  selector: 'app-edd',
  templateUrl: './edd.component.html',
  styleUrls: ['./edd.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class EddComponent
  extends StepperChildComponent
  implements OnInit, OnActive, OnSave
{
  destroyFlag: Subject<any> = new Subject<any>();
  today = new Date();
  dummyOccupation = [
    { code: 'ACC', codeDesc: 'ACCOUNTANT' },
    { code: 'ADMIN', codeDesc: 'ADMINISTRATOR' },
    {
      code: 'ADV',
      codeDesc: 'ADVOCATE',
    },
    { code: 'ARCH', codeDesc: 'ARCHITECT' },
    { code: 'ARTIS', codeDesc: 'ARTISAN' },
    {
      code: 'AUC',
      codeDesc: 'AUCTIONEER',
    },
    { code: 'AUD', codeDesc: 'AUDITOR ' },
    { code: 'BNESS', codeDesc: 'BUSINESSMAN' },
  ].map(el => {
    return { codeDesc: el.codeDesc.toUpperCase(), code: el.code };
  });
  dummyCat: any[] = [
    { category: 'PEPs' },
    { category: 'HIGH NETWORTH INDIVIDUALS' },
    { category: 'MONEY SERVICE/ REMITTANCE BUSINESSES' },
    { category: 'Forex Bureaus' },
    { category: 'Cash-intensive customers' },
    { category: 'Companies with complex ownership structure' },
    { category: 'Religious institution' },
    { category: 'NGOs/Trust/Foundation and other charity organizations' },
    { category: 'Real estate businesses' },
    { category: 'Dealers in precious metals and stones' },
    { category: 'Motor vehicle sellers' },
    { category: 'Pooled client accounts' },
    { category: 'Trusts & Legal Arrangements' },
    { category: 'Casinos and gaming businesses' },
    { category: 'Financial institutions' },
    { category: 'Foreign individuals and entities' },
    { category: 'Export and import businesses' },
    { category: 'Government supplies' },
    { category: 'Fatca client' },
    { category: 'Nominees' },
  ].map(el => {
    return { category: el.category.toUpperCase() };
  });
  // categoryControl = new FormControl(null, [requireCategoryMatch(this.dummyCat)]);
  // occupationControl = new FormControl(null, [requireOccupationMatch(this.dummyOccupation)]);
  filteredCategoryOptions: Observable<any[]> | undefined;
  filteredOccupationOptions: Observable<any[]> | undefined;
  accountForm!: UntypedFormGroup;
  countryCodes: any;

  constructor(
    public ctxManager: ContextManager,
    private formBuilder: UntypedFormBuilder,
    private accountService: AccountService,
    private docsService: DocumentsService,
    public dialog: MatDialog,
    private toast: ToastService
  ) {
    super();
    this.accountForm = this.formBuilder.group({
      highRiskCustomerDescription: [
        null,
        [Validators.required, requireCategoryMatch(this.dummyCat)],
      ],
      typeOfReview: [null, Validators.required],
      dateOfReview: [null, Validators.required],
      lastReviewDate: [null, Validators.required],
      nextReviewDate: [null, Validators.required],
      transactionAnalysis: this.formBuilder.group({
        findings: ['', [Validators.required]],
        period: ['', [Validators.required]],
        analysisWarrants: ['', [Validators.required]],
        amlRelated: ['', [Validators.required]],
      }),
      contactDetails: this.formBuilder.group({
        phone: this.formBuilder.group({
          code: ['254', [Validators.required]],
          number: [
            '',
            [
              Validators.required,
              Validators.minLength(9),
              Validators.maxLength(9),
            ],
          ],
        }),
        email: ['', [Validators.required]],
      }),
      occupation: this.formBuilder.group({
        occupation: ['', [Validators.required]],
        nameOfEmployer: ['', [Validators.required]],
      }),
      sourceOfWealth: this.formBuilder.group({
        sourceOfWealth: ['', [Validators.required]],
        associationWithHRC: ['', [Validators.required]],
      }),
    });
  }

  onActive(): void {
    //
  }

  ngOnInit() {
    this.accountForm.patchValue({
      dateOfReview: moment(this.today).format('yyyy-MM-DD'),
      lastReviewDate: moment(this.today).format('yyyy-MM-DD'),
    });
    this.filteredCategoryOptions =
      this.accountForm.controls['highRiskCustomerDescription'].valueChanges.pipe(
        startWith(''),
        map((value: string) => this._filterCategories(value))
      );
    this.filteredOccupationOptions =
      this.accountForm.controls['occupation'].valueChanges.pipe(
        startWith(''),
        map((value: string) => this._filterOccupations(value))
      );
    // let countryInfo = JSON.parse(localStorage.getItem('countryInfo')!);
    // this.countryCodes = countryInfo;
  }

  private _filterCategories(value: string): any[] {
    return this.dummyCat.filter(option => option.category.includes(value));
  }

  private _filterOccupations(value: string): any[] {
    return this.dummyOccupation.filter(option =>
      option.codeDesc.includes(value)
    );
  }

  formatDates(): void {
    this.accountForm.patchValue({
      nextReviewDate: moment(this.accountForm.value.nextReviewDate).format(
        'yyyy-MM-DD'
      ),
      lastReviewDate: moment(this.accountForm.value.lastReviewDate).format(
        'yyyy-MM-DD'
      ),
      transactionAnalysis: {
        period: moment(
          this.accountForm.value.transactionAnalysis.period
        ).format('yyyy-MM-DD'),
      },
    });
  }

  onSave() {
    const ticketId = this.ctxManager.currentContextData.ticket.id.toString();
    this.formatDates();
    const dialogRef = this.dialog.open(EddFormPrintComponent, {
      width: '100%',
      height: '95vh',
      data: this.accountForm.value,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.gotoNext();
        // this.stepper.patchContextData({'eddForm': result});
        // let doc =  [{
        //     filename: 'EDDForm',
        //     format: 'pdf',
        //     data: result.pdf_Data
        // }];
        // let docObj = {
        //     CIF: this.stepper.currentContextData.signatoryCIF.personalDetails.customerId,
        //     AccountNumber: '',
        //     Country: 'KE',
        //     ticketNumber: ticketId,
        //     idType: '',
        //     idNumber: '',
        //     Service: 'NewGen',
        //     documents: doc
        // };
        // this.docsService.upload(docObj).subscribe(
        //     (v: any) =>{
        //         if (v.successful) {
        //             v.responseObject.forEach((d: any) => {
        //                 if(!d.success) {
        //                     this.toast.show('', d.filename + ' document failed to upload-documents', MessageBoxType.DANGER);
        //                 }
        //                 if(d.success) {
        //                     this.toast.show('', v.filename + '  Uploaded Successfully!', MessageBoxType.SUCCESS);
        //                     this.submitEddForm(ticketId);
        //                 }
        //             })
        //         } else {
        //             this.toast.show('', v.message, MessageBoxType.DANGER);
        //         }
        //     }, (error: any) => {
        //         this.toast.show('EDD Form', 'Unable to upload document', MessageBoxType.DANGER);
        //     }
        // );
      } else {
        this.toast.show(
          '',
          'Please click submit to proceed.',
          MessageBoxType.INFO,
          5000,
          undefined,
          undefined,
          false
        );
      }
    });
  }

  submitEddForm(ticketId: string): void {
    this.ctxManager.patchContextData({ eddFormData: this.accountForm.value });
    this.docsService.postEddForm(ticketId, this.accountForm.value).subscribe(
      v => {
        if (!v.successful) return;
        if (v.successful) {
          this.toast.show(
            'EDD Form',
            'EDD Form Data submitted!',
            MessageBoxType.SUCCESS,
            5000,
            undefined,
            undefined,
            false
          );
          this.gotoNext();
        } else {
          this.toast.show(
            'EDD Form',
            v.message,
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
      },
      (error: any) => {}
    );
  }
}

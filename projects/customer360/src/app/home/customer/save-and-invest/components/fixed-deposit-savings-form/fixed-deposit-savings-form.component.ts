import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
import { IBreadcrumbConfig } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { BreadcrumbNavigationComponent } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { IAccMgntObj } from 'src/app/shared/models/common';
import { CurrentFlowsOptions } from 'src/app/shared/models/common/accMgntObj.model';
import {
  IDocumentSpec,
  IUploadedDocument,
} from 'src/app/shared/modules/upload-docs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { InfoBoxComponent } from 'src/app/shared/components/info-box/info-box.component';
import { InvestmentDetailsComponent } from '../shared/investment-details/investment-details.component';
import { TransactionDetailsComponent } from '../shared/transaction-details/transaction-details.component';
import { PaymentDetailsComponent } from '../shared/payment-details/payment-details.component';
import { RolloverAndWithdravalDetailsComponent } from '../shared/rollover-and-withdraval-details/rollover-and-withdraval-details.component';
import { DocumentsUploadComponent } from 'src/app/shared/modules/upload-docs/documents-upload.component';

@Component({
  selector: 'app-fixed-deposit-savings-form',
  templateUrl: './fixed-deposit-savings-form.component.html',
  styleUrls: ['./fixed-deposit-savings-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    InfoBoxComponent,
    InvestmentDetailsComponent,
    PaymentDetailsComponent,
    RolloverAndWithdravalDetailsComponent,
    DocumentsUploadComponent,
  ],
})
export class FixedDepositSavingsFormComponent implements OnInit, OnDestroy {
  public breadcrumbsConfig: Array<IBreadcrumbConfig> = [
    { label: 'Service portal', url: 'services', active: false },
    { label: 'Customer 360°', url: 'services/customer-360', active: false },
    {
      label: 'Save&Invest',
      url: 'services/customer-360/save-and-invest-profile',
      active: false,
    },
    { label: 'Accounts', active: true },
  ];

  form!: UntypedFormGroup;
  customerActiveAccounts: any;
  savingsDetails: any;

  public uploadedDocs: IUploadedDocument[] = [];
  public uploadedDocsAreValid = false;
  public uploadDocumentsStep = false;

  public UploadDocuments: IDocumentSpec[] = [
    // {
    //     name: 'photo',
    //     description: 'Agent Photo',
    //     required: true,
    // },
  ];

  private accMgntObj: IAccMgntObj = JSON.parse(
    <string>localStorage.getItem('accMgntObj')
  );
  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountManagementService: AccountManagementService
  ) {
    this.customerActiveAccounts = this.accountManagementService.getCustomerAccountsWhere(
      (account: any) => account.accountStatus === 'A'
    );
    this.savingsDetails = this.accountManagementService.getsaveAndInvestDetails();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.uploadDocumentsStep = params['uploadDocumentsStep'] === 'true';
    });
    this.initForm();
  }

  ngOnInit(): void {}

  initForm = () => {
    this.form = new UntypedFormGroup({
      // Investment details
      accountName: new UntypedFormControl(
        this.savingsDetails?.accountName,
        Validators.required
      ),
      currency: new UntypedFormControl(
        { value: this.savingsDetails?.accountCurrency, disabled: true },
        Validators.required
      ),
      initialAmount: new UntypedFormControl(null, Validators.required),
      depositTerm: new UntypedFormControl('', Validators.required),
      customTerm: new UntypedFormControl(''),
      maturityDate: new UntypedFormControl(
        { value: null, disabled: true },
        Validators.required
      ),
      // Rollover & Withdrawal  details
      withdrawOrRollover: new UntypedFormControl('', Validators.required),
      rolloverOption: new UntypedFormControl(''),
      // Payment details
      debitAccount: new UntypedFormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      debitAccountCurrency: new UntypedFormControl(
        { value: this.savingsDetails?.accountCurrency, disabled: true },
        Validators.required
      ),
      effectiveDate: new UntypedFormControl(null, Validators.required),
    });

    this.uploadedDocs = this.savingsDetails?.uploadedDocs;

    if (this.uploadedDocs) {
      this.UploadDocuments = this.UploadDocuments.concat(this.uploadedDocs);
    }

    // eslint-disable-next-line no-prototype-builtins
    if (this.savingsDetails?.hasOwnProperty('formData')) {
      this.form.patchValue(this.savingsDetails.formData);
    }
  };

  navigate = (type: string) => {
    switch (type) {
      case 'quit':
        this.router.navigate(['services/customer-360'], {
          queryParams: { tabIndex: 6 },
        });
        break;
      case 'back':
        if (this.uploadDocumentsStep === true) {
          this.uploadDocumentsStep = false;
        } else {
          if (
            this.accMgntObj.currentFlow ===
            CurrentFlowsOptions.CUSTOMERNOTPRESENT
          ) {
            this.router.navigate(['/services/account-services']);
            return;
          }
          this.router.navigate(['services/customer-360/save-and-invest']);
        }
        break;
      case 'next':
        if (!this.uploadDocumentsStep) {
          this.uploadDocumentsStep = true;
        } else {
          this.submitFixedDeposit();
        }
        break;

      default:
        break;
    }
  };

  submitFixedDeposit = () => {
    this.accountManagementService.setsaveAndInvestDetails({
      ...this.savingsDetails,
      formData: this.form.getRawValue(),
      uploadedDocs: this.uploadedDocs,
    });

    //this.UploadDocuments = this.UploadDocuments.concat(this.uploadedDocs);

    this.router.navigate([
      `/services/customer-360/save-and-invest/transaction/${this.savingsDetails.type}/review`,
    ]);
  };

  getDocuments(documents: IUploadedDocument[]) {
    this.uploadedDocsAreValid = documents
      .filter(doc => doc.required)
      .every(doc => doc.fileName);
    if (this.uploadedDocsAreValid) {
      this.uploadedDocs = documents;
    }
  }

  getFormValidationErrors() {
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {});
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
import { IBreadcrumbConfig } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { BreadcrumbNavigationComponent } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import {
  CurrentFlowsOptions,
  IAccMgntObj,
} from 'src/app/shared/models/common/accMgntObj.model';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
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
import { DocumentsUploadComponent } from 'src/app/shared/modules/upload-docs/documents-upload.component';

@Component({
  selector: 'app-call-deposit-savings-form',
  templateUrl: './call-deposit-savings-form.component.html',
  styleUrls: ['./call-deposit-savings-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    BreadcrumbNavigationComponent,
    InfoBoxComponent,
    InvestmentDetailsComponent,
    PaymentDetailsComponent,
    DocumentsUploadComponent,
  ],
})
export class CallDepositSavingsFormComponent implements OnInit {
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
  uploadedDocsAreValid = false;
  uploadedDocs: IUploadedDocument[] = [];
  UploadDocuments: IDocumentSpec[] = [];
  uploadDocumentsStep = false;
  private accMgntObj: IAccMgntObj = JSON.parse(
    <string>localStorage.getItem('accMgntObj')
  );

  constructor(
    private router: Router,
    private accountManagementService: AccountManagementService,
    private toastService: ToastService
  ) {
    this.customerActiveAccounts = this.accountManagementService.getCustomerAccountsWhere(
      (account: any) => account.accountStatus === 'A'
    );
    this.savingsDetails = this.accountManagementService.getsaveAndInvestDetails();
    this.initForm();
  }

  ngOnInit(): void {}

  initForm = () => {
    this.form = new UntypedFormGroup({
      // Investment details
      accountName: new UntypedFormControl(
        this.savingsDetails.accountName,
        Validators.required
      ),
      currency: new UntypedFormControl(
        { value: this.savingsDetails.accountCurrency, disabled: true },
        Validators.required
      ),
      initialAmount: new UntypedFormControl(null, Validators.required),
      // Payment details
      debitAccount: new UntypedFormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      debitAccountCurrency: new UntypedFormControl(
        { value: this.savingsDetails.accountCurrency, disabled: true },
        Validators.required
      ),
      paymentType: new UntypedFormControl('', Validators.required),
      frequency: new UntypedFormControl('', Validators.required),
      dayOrMonth: new UntypedFormControl('', Validators.required),
      savingAmount: new UntypedFormControl(null, Validators.required),
      startDate: new UntypedFormControl(null, Validators.required),
      endDate: new UntypedFormControl(null, Validators.required),
    });

    if (Object.prototype.hasOwnProperty.call(this.savingsDetails, 'formData'))
      this.form.patchValue(this.savingsDetails.formData);
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
          this.submitCallDeposit();
        }
        break;

      default:
        break;
    }
  };

    submitCallDeposit = () => {

        this.accountManagementService.setsaveAndInvestDetails({
            ...this.savingsDetails,
            formData: this.form.getRawValue(),
            uploadedDocs: this.uploadedDocs
        });
        const paymentDetails: any =
            this.accountManagementService.getsaveAndInvestDetails();
        if (
            paymentDetails?.formData?.initialAmount >
            paymentDetails?.availableBalance
        ) {
            this.toastService.show(
                'Insufficient Balance',
                'Insufficient',
                MessageBoxType.WARNING,
                5000, undefined, undefined, false
            );
            return;
        }
        this.router.navigate([
            `/services/customer-360/save-and-invest/transaction/${this.savingsDetails.type}/review`,
        ]);
    };
    getDocuments(documents: IUploadedDocument[]) {
        this.uploadedDocsAreValid = documents.filter(doc => doc.required).every(doc => doc.fileName);
        if (this.uploadedDocsAreValid) {
            this.uploadedDocs = documents;
        }
    }
}

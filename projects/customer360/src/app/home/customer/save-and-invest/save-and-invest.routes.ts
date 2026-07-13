import { Routes } from '@angular/router';

import { DepositPageComponent } from './components/deposit-page/deposit-page.component';
import { SavingTypesMenuComponent } from './components/saving-types-menu/saving-types-menu.component';
import { FixedDepositSavingsFormComponent } from './components/fixed-deposit-savings-form/fixed-deposit-savings-form.component';
import { CallDepositSavingsFormComponent } from './components/call-deposit-savings-form/call-deposit-savings-form.component';
import { DepositsReviewDetailsComponent } from './components/deposits-review-details/deposits-review-details.component';
import { ReviewPageComponent } from './components/review-page/review-page.component';
import { CdscAccountOpeningPageComponent } from './components/cdsc-account-opening-page/cdsc-account-opening-page.component';
import { CustomerAccountResolver } from 'src/app/core/resolvers/customer-account-resolver.service';
import { SuccessPageComponent } from './components/success-page/success-page.component';
import { DocumentsUploadPageComponent } from './components/documents-upload-page/documents-upload-page.component';

export const routes: Routes = [
  {
    path: '',
    component: SavingTypesMenuComponent,
    data: { title: 'Save and Invest' },
    resolve: {
      customerDetails: CustomerAccountResolver,
    },
  },
  {
    path: 'fixed-deposit-savings',
    component: FixedDepositSavingsFormComponent,
    data: { title: 'Fixed Deposit Savings Account' },
  },
  {
    path: 'call-deposit-savings',
    component: CallDepositSavingsFormComponent,
    data: { title: 'Call Deposit Savings Account' },
  },
  {
    path: 'fixed-deposit-savings/:uploadDocumentsStep',
    component: FixedDepositSavingsFormComponent,
    data: { title: 'Fixed Deposit Savings Account' },
  },
  {
    path: 'call-deposit-savings/:uploadDocumentsStep',
    component: CallDepositSavingsFormComponent,
    data: { title: 'Call Deposit Savings Account' },
  },
  {
    path: 'transaction/:transactionType/review',
    component: DepositsReviewDetailsComponent,
  },
  {
    path: 'deposit/:depositType',
    component: DepositPageComponent,
  },
  {
    path: 'review/:depositType',
    component: ReviewPageComponent,
  },
  {
    path: 'success/:depositType',
    component: SuccessPageComponent,
  },
  {
    path: 'cdsc-account-opening',
    component: CdscAccountOpeningPageComponent,
  },
  {
    path: 'documents-upload/:depositType',
    component: DocumentsUploadPageComponent,
  },
];

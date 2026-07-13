import { Routes } from '@angular/router';
import { FundsTransferComponent } from './funds-transfer.component';
import { ReviewComponent } from './review/review.component';
import { SuccessComponent } from './success/success.component';

export const FUNDS_TRANSFER_ROUTES: Routes = [
  { path: '', component: FundsTransferComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'review', component: ReviewComponent },
];

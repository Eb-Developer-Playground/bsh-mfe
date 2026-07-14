import { Routes } from '@angular/router';
import { BulkPaymentComponent } from './bulk-payment.component';
import { SuccessComponent } from './success/success.component';

export const BULK_PAYMENT_ROUTES: Routes = [
  { path: '', component: BulkPaymentComponent },
  { path: 'success', component: SuccessComponent },
];

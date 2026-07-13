import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkPaymentComponent } from './bulk-payment.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  { path: 'success', component: SuccessComponent },
  { path: '', component: BulkPaymentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BulkPaymentRoutingModule {}

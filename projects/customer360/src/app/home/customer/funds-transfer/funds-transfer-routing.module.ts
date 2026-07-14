import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FundsTransferComponent } from './funds-transfer.component';
import { ReviewComponent } from './review/review.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  { path: '', component: FundsTransferComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'review', component: ReviewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FundsTransferRoutingModule {}

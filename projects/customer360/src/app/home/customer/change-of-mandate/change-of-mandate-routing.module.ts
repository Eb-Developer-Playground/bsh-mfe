import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangeOfMandateComponent } from './change-of-mandate.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  { path: 'success', component: SuccessComponent },
  { path: '', component: ChangeOfMandateComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeOfMandateRoutingModule {}

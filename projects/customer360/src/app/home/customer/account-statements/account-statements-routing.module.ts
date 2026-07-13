import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountStatementsComponent } from './account-statements.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  {
    path: '',
    component: AccountStatementsComponent,
    data: {
      title: 'ROUTES.GENERATE-STATEMENT',
      breadcrumb: 'ROUTES.GENERATE-STATEMENT',
    },
  },
  {
    path: 'success',
    component: SuccessComponent,
    data: {
      title: 'ROUTES.GENERATE-STATEMENT',
      breadcrumb: 'ROUTES.GENERATE-STATEMENT',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountStatementsRoutingModule {}

import { Routes } from '@angular/router';
import { AccountStatementsComponent } from './account-statements.component';
import { SuccessComponent } from './success/success.component';

export const ACCOUNT_STATEMENTS_ROUTES: Routes = [
  {
    path: '',
    component: AccountStatementsComponent,
  },
  {
    path: 'success',
    component: SuccessComponent,
  },
];

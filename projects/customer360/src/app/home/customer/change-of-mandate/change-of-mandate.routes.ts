import { Routes } from '@angular/router';
import { ChangeOfMandateComponent } from './change-of-mandate.component';
import { SuccessComponent } from './success/success.component';

export const CHANGE_OF_MANDATE_ROUTES: Routes = [
  { path: '', component: ChangeOfMandateComponent },
  { path: 'success', component: SuccessComponent },
];

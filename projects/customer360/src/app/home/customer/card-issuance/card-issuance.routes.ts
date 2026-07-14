import { Routes } from '@angular/router';
import { CardIssuanceComponent } from './card-issuance.component';
import { IssuanceSuccessPageComponent } from './pages/issuance-success-page/issuance-success-page.component';
import { CardPrintPageComponent } from './pages/card-print-page/card-print-page.component';

export const CARD_ISSUANCE_ROUTES: Routes = [
  {
    path: '',
    component: CardIssuanceComponent,
  },
  {
    path: 'success',
    component: IssuanceSuccessPageComponent,
  },
  {
    path: 'print',
    component: CardPrintPageComponent,
  },
];

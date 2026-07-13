import { Routes } from '@angular/router';
import { MoveMoneyComponent } from './move-money.component';
import { CdComponent } from './cd/cd.component';
import { OwnaccountComponent } from './cd/ownaccount/ownaccount.component';
import { MmEquityComponent } from './cd/mm-equity/mm-equity.component';
import { MmLocalComponent } from './cd/mm-local/mm-local.component';
import { MmSuccessComponent } from './cd/shared/mm-success/mm-success.component';

export const MOVE_MONEY_ROUTES: Routes = [
  {
    path: '',
    component: MoveMoneyComponent,
    children: [
      {
        path: '',
        component: CdComponent,
        children: [
          {
            path: 'own-account',
            component: OwnaccountComponent,
            children: [
              { path: 'success', component: MmSuccessComponent },
            ],
          },
          {
            path: 'equity-account',
            component: MmEquityComponent,
            children: [
              { path: 'success', component: MmSuccessComponent },
            ],
          },
          {
            path: 'local-account',
            component: MmLocalComponent,
          },
        ],
      },
    ],
  },
];

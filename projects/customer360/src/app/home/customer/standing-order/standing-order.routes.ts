import { Routes } from '@angular/router';
import { StandingOrderComponent } from './standing-order.component';
import { StandingOrderBcdcComponent } from './standing-order-bcdc/standing-order-bcdc.component';
import { StandingOrderOthersComponent } from './standing-order-others/standing-order-others.component';
import { CreateStandingRequestComponent } from './standing-order-others/create-standing-order/create-standing-order.component';
import { AmendStandingOrderComponent } from './standing-order-others/amend-standing-order/amend-standing-order.component';
import { StopStandingOrderComponent } from './standing-order-others/stop-standing-order/stop-standing-order.component';
import { SuccessComponent } from './standing-order-others/success/success.component';

export const standingOrderRoutes: Routes = [
  {
    path: '',
    component: StandingOrderComponent,
    data: { title: 'Standing Order', breadcrumb: 'Standing Order' },
  },
  {
    path: 'bcdc',
    component: StandingOrderBcdcComponent,
    data: { title: 'Standing Order BCDC', breadcrumb: 'Standing Order BCDC' },
  },
  {
    path: 'others',
    component: StandingOrderOthersComponent,
    data: { title: 'Standing Order', breadcrumb: 'Standing Order' },
  },
  {
    path: 'create-standing-order',
    component: CreateStandingRequestComponent,
  },
  {
    path: 'amend-standing-order',
    component: AmendStandingOrderComponent,
  },
  {
    path: 'stop-standing-order',
    component: StopStandingOrderComponent,
  },
  {
    path: 'success',
    component: SuccessComponent,
  },
];

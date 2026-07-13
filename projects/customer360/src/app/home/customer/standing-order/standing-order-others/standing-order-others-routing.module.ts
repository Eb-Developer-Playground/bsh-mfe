import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AmendStandingOrderComponent } from './amend-standing-order/amend-standing-order.component';
import { CreateStandingRequestComponent } from './create-standing-order/create-standing-order.component';
import { StandingOrderOthersComponent } from './standing-order-others.component';
import { StopStandingOrderComponent } from './stop-standing-order/stop-standing-order.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
    {
        path: '',
        component: StandingOrderOthersComponent
    },
    {
        path: 'create-standing-order',
        component: CreateStandingRequestComponent
    },
    {
        path: 'amend-standing-order',
        component: AmendStandingOrderComponent
    },
    {
        path: 'stop-standing-order',
        component: StopStandingOrderComponent
    },
    {
        path: 'success',
        component: SuccessComponent
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class StandingOrderOthersRoutingModule {}

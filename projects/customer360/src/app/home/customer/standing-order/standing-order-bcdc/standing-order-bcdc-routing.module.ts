import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StandingOrderBcdcComponent } from './standing-order-bcdc.component';


const routes: Routes = [
    {
        path: '',
        component: StandingOrderBcdcComponent,
    },
    // {
    //     path: 'create-standing-order',
    //     component: CreateStandingRequestComponent,
    //     // data: {title: 'Standing Order', breadcrumb: 'Standing Order'}
    // },
    // {
    //     path: 'amend-standing-order',
    //     component: AmendStandingOrderComponent,
    // },
    // {
    //     path: 'stop-standing-order',
    //     component: StopStandingOrderComponent,
    // },
    // {
    //     path: 'success',
    //     component: SuccessComponent,
    // }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class StandingOrderBcdcRoutingModule {}

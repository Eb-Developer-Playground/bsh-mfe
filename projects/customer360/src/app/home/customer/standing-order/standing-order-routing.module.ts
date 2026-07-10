import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StandingOrderComponent } from './standing-order.component';
import { featureFlowGuard } from '@app/core/feature-flags/feature-flow.guard';
import { Feature } from '@app/core/feature-flags/feature-flags.model';

const routes: Routes = [
    {
        path: '',
        component: StandingOrderComponent,
        data: { title: 'Standing Order', breadcrumb: 'Standing Order' },
    },
    {
        path: 'bcdc',
        canMatch: [featureFlowGuard],
        loadChildren: () => import('./standing-order-bcdc/standing-order-bcdc.module').then(m => m.StandingOrderBcdcModule),
        data: { title: 'Standing Order BCDC', breadcrumb: 'Standing Order BCDC', feature: Feature.StandingOrder, flow: 'StandingOrder' },
    },
    {
        path: 'others',
        canMatch: [featureFlowGuard],
        loadChildren: () => import('./standing-order-others/standing-order-others.module').then(m => m.StandingOrderOthersModule),
        data: { title: 'Standing Order', breadcrumb: 'Standing Order', feature: Feature.StandingOrder, flow: 'StandingOrder' },
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class StandingOrderRoutingModule {}

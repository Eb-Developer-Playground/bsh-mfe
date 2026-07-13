import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ComponentsModule } from 'src/app/shared/components/components.module';
import { StandingOrderService } from 'src/app/core/services/standing-order/standing-order.service';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import { AccountDetailsModule } from '../../../../shared/modules/account-details';

import { StandingOrderBcdcRoutingModule } from './standing-order-bcdc-routing.module';
import { StandingOrderBcdcComponent } from './standing-order-bcdc.component';
import { MaterialModule } from './material.module';
import { SharedStandingOrderListComponent } from '../components/shared-standing-order-list/shared-standing-order-list.component';

@NgModule({
  declarations: [
    StandingOrderBcdcComponent,
    SharedStandingOrderListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    ComponentsModule,
    StandingOrderBcdcRoutingModule,
    TranslateModule,
    DirectivesModule,
    AccountDetailsModule,
    CurrencyMaskModule,
  ],
  providers: [StandingOrderService],
})
export class StandingOrderBcdcModule {}

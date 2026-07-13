import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';

import { StandingOrderRoutingModule } from './standing-order-routing.module';
import { StandingOrderComponent } from './standing-order.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { StandingOrderService } from 'src/app/core/services/standing-order/standing-order.service';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { AccountDetailsModule } from '../../../shared/modules/account-details';

@NgModule({
  declarations: [
    StandingOrderComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    ComponentsModule,
    StandingOrderRoutingModule,
    TranslateModule,
    DirectivesModule,
    AccountDetailsModule,
    CurrencyMaskModule,
  ],
  providers: [StandingOrderService],
})
export class StandingOrderModule {}

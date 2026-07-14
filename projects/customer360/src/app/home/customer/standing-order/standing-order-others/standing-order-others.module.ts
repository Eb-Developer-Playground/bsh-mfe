import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ComponentsModule } from 'src/app/shared/components/components.module';
import { StandingOrderService } from 'src/app/core/services/standing-order/standing-order.service';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import { AccountDetailsModule } from '../../../../shared/modules/account-details';

import { StandingOrderOthersRoutingModule } from './standing-order-others-routing.module';
import { StandingOrderOthersComponent } from './standing-order-others.component';
import { CreateStandingRequestComponent } from './create-standing-order/create-standing-order.component';
import { AmendStandingOrderComponent } from './amend-standing-order/amend-standing-order.component';
import { StopStandingOrderComponent } from './stop-standing-order/stop-standing-order.component';
import { ReviewDetailComponent } from './review-detail/review-detail.component';
import { StandingOrderDocumentsComponent } from './standing-order-documents/standing-order-documents.component';
import { StandingOrderListComponent } from './standing-order-list/standing-order-list.component';
import { SuccessComponent } from './success/success.component';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [
    StandingOrderOthersComponent,
    CreateStandingRequestComponent,
    AmendStandingOrderComponent,
    StopStandingOrderComponent,
    ReviewDetailComponent,
    StandingOrderDocumentsComponent,
    StandingOrderListComponent,
    SuccessComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    ComponentsModule,
    StandingOrderOthersRoutingModule,
    TranslateModule,
    DirectivesModule,
    AccountDetailsModule,
    CurrencyMaskModule,
  ],
  providers: [StandingOrderService],
})
export class StandingOrderOthersModule {}

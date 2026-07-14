import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountStatementsRoutingModule } from './account-statements-routing.module';
import { AccountStatementsComponent } from './account-statements.component';
import { MaterialModule } from '../../customer/material.module';
import { StatementDetailsComponent } from './statement-details/statement-details.component';
import { NotificationsModule } from 'src/app/shared/modules/notifications/notifications.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SuccessComponent } from './success/success.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AccountStatementsComponent,
    StatementDetailsComponent,
    SuccessComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    AccountStatementsRoutingModule,
    MaterialModule,
    NotificationsModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
  ],
})
export class AccountStatementsModule {}

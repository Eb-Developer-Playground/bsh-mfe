import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './material.module';
import { TicketApprovalComponent } from './ticket-approval.component';

@NgModule({

  imports: [
      CommonModule,
      FlexLayoutModule,
      MaterialModule,
      TicketApprovalComponent,
    ],
  exports: [TicketApprovalComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TicketApprovalModule {}

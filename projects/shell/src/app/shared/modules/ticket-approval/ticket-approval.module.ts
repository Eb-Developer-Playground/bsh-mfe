import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from './material.module';
import { TicketApprovalComponent } from './ticket-approval.component';

@NgModule({
  declarations: [TicketApprovalComponent],
  imports: [CommonModule, FlexLayoutModule, TranslateModule, MaterialModule],
  exports: [TicketApprovalComponent],
})
export class TicketApprovalModule {}

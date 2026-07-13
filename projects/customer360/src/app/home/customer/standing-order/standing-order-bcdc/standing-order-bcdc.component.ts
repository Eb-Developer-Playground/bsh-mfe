import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AccountDetails } from '@app/shared/models';
import { StandingOrderService } from '@app/core/services/standing-order/standing-order.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { AccountDetailSectionComponent } from '../account-detail-section/account-detail-section.component';
import { SharedStandingOrderListComponent } from '../components/shared-standing-order-list/shared-standing-order-list.component';

@Component({
  selector: 'app-standing-order-bcdc',
  templateUrl: './standing-order-bcdc.component.html',
  styleUrls: ['./standing-order-bcdc.component.scss'],
  imports: [MatToolbarModule, MatButtonModule, TranslatePipe, AccountDetailSectionComponent, SharedStandingOrderListComponent],
})
export class StandingOrderBcdcComponent implements OnInit {
  isAccountActive = false;
  showEmptyState = true;
  isAmendStopActive = false;
  isSelfOrETS = true;
  selectedAccount: AccountDetails = {
    accountCurrency: '',
    accountName: '',
    accountStatus: '',
    accountType: '',
    cif: '',
    accountNumber: '',
    availableBalance: '',
  };
  standingOrders: any = [];
  standingOrder: any = {};
  @Output() standingOrdersEvent = new EventEmitter<string>();

  constructor(
    private standingOrderService: StandingOrderService,
    private toastService: ToastService
  ) {}

  accountChange(value: AccountDetails) {
    this.standingOrderService.cif = value.cif;
    this.standingOrderService.setAccountNumber(value.accountNumber);

    this.standingOrderService.getList(value.cif, value.accountNumber)
      .subscribe(response => {
        if (!response.successful) {
          this.toastService.show('Error', response.statusMessage, MessageBoxType.DANGER);
          return;
        }

        this.standingOrders = response.responseObject;
        this.standingOrdersEvent.emit(this.standingOrders);
      });
  }

  onSelectStandingOrder(value: any) {
    this.isAmendStopActive = true;
    this.isAccountActive = true;
    this.standingOrder = value;
    this.standingOrderService.standingOrder = value;
  }
  
  isActiveAccount(value: boolean) {
    this.isAccountActive = value;
  }

  ngOnInit(): void {}

  goBack(): void {}
}

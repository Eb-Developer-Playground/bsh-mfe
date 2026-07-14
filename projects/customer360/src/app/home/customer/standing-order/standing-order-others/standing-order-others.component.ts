import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AccountDetails } from '@app/shared/models';
import { StandingOrderService } from '@app/core/services/standing-order/standing-order.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { AccountDetailSectionComponent } from '../account-detail-section/account-detail-section.component';
import { StandingOrderListComponent } from '../standing-order-others/standing-order-list/standing-order-list.component';

@Component({
  selector: 'app-standing-order',
  templateUrl: './standing-order-others.component.html',
  styleUrls: ['./standing-order-others.component.scss'],
  imports: [CommonModule, MatToolbarModule, MatButtonModule, RouterLink, TranslatePipe, AccountDetailSectionComponent, StandingOrderListComponent],
})
export class StandingOrderOthersComponent implements OnInit {
  isAccountActive = false;
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
    this.standingOrderService
      .getList(value.cif, value.accountNumber)
      .subscribe(response => {
        if (!response.successful) {
          this.toastService.show(
            'Error',
            response.statusMessage,
            MessageBoxType.DANGER
          );
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

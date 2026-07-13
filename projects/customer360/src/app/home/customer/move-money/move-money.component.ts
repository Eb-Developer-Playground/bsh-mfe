import { Component, OnInit } from '@angular/core';

import {
  CustomerAccountDataT,
  ServiceOptions,
} from './models/move-money-services.model';
import { TranslatePipe } from '@ngx-translate/core';
import { SessionService } from '@app/shared/services';
import { ActivatedRoute, Router } from '@angular/router';

import { AccountService, TicketsService } from '@app/core/services';
import { MmSharedLogicService } from '@app/home/customer/move-money/cd/shared/mm-shared-logic.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-move-money',
  templateUrl: './move-money.component.html',
  styleUrl: './move-money.component.scss',
  imports: [TranslatePipe, MatCardModule, MatIconModule, MatDividerModule],
})
export class MoveMoneyComponent implements OnInit {
  moveMoneyServices: ServiceOptions[];

  constructor(
    private accountService: AccountService,
    private ticketService: TicketsService,
    private sessionService: SessionService,
    private shareLogicService: MmSharedLogicService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.moveMoneyServices = this.generateServiceOptions();
  }

  navigateTo(url: string, event: Event): void {
    event.preventDefault();
    const cc = this.sessionService.userCountryCode
      .replace(/\s/g, '')
      .toLowerCase();
    this.router.navigate([`/services/customer-360/move-money/${cc}/${url}`]);
  }

  private generateServiceOptions() {
    return [
      {
        title: 'MOVE-MONEY.SERVICE-OPTIONS.OWN-ACCOUNT.TITLE',
        text: 'MOVE-MONEY.SERVICE-OPTIONS.OWN-ACCOUNT.TEXT',
        icon: 'ic-movemoney-send-own-account',
        url: 'own-account',
        display: true,
      },
      {
        title: 'MOVE-MONEY.SERVICE-OPTIONS.EQUITY-ACCOUNT.TITLE',
        text: 'MOVE-MONEY.SERVICE-OPTIONS.EQUITY-ACCOUNT.TEXT',
        icon: 'ic-movemoney-send-equity-bank',
        url: 'equity-account',
        display: true,
      },
      {
        title: 'MOVE-MONEY.SERVICE-OPTIONS.LOCAL-ACCOUNT.TITLE',
        text: 'MOVE-MONEY.SERVICE-OPTIONS.LOCAL-ACCOUNT.TEXT',
        icon: 'ic-movemoney-send-other-bank',
        url: 'local-account',
        display: true,
      },
      {
        title: 'MOVE-MONEY.SERVICE-OPTIONS.LINKED-CARD.TITLE',
        text: 'MOVE-MONEY.SERVICE-OPTIONS.LINKED-CARD.TEXT',
        icon: 'ic-movemoney-send-linked',
        url: 'linked-card',
        display: true,
      },
      {
        title: 'MOVE-MONEY.SERVICE-OPTIONS.INTERNATIONAL.TITLE',
        text: 'MOVE-MONEY.SERVICE-OPTIONS.INTERNATIONAL.TEXT',
        icon: 'ic-movemoney-send-international',
        url: 'international',
        display: true,
      },
      {
        title: 'MOVE-MONEY.SERVICE-OPTIONS.BULK.TITLE',
        text: 'MOVE-MONEY.SERVICE-OPTIONS.BULK.TEXT',
        icon: 'ic-movemoney-send-bulk',
        url: 'bulk',
        display: true,
      },
      {
        title: 'MOVE-MONEY.SERVICE-OPTIONS.SWIFT.TITLE',
        text: 'MOVE-MONEY.SERVICE-OPTIONS.SWIFT.TEXT',
        icon: 'ic-movemoney-send-swift',
        url: 'swift',
        display: true,
      },
      {
        title: 'MOVE-MONEY.SERVICE-OPTIONS.INTER-COUNTRY.TITLE',
        text: 'MOVE-MONEY.SERVICE-OPTIONS.INTER-COUNTRY.TEXT',
        icon: 'ic-movemoney-send-international',
        url: 'inter-country',
        display: true,
      },
    ];
  }

  ngOnInit() {
    this.checkTicket();
    this.checkIfRequiresBio();
  }

  checkTicket() {
    const ticketId = JSON.parse(<string>localStorage.getItem('ticketId'));
    if (ticketId) {
      this.getTicketData(ticketId);
    }
  }

  checkIfRequiresBio() {
    this.route.queryParams.subscribe(params => {
      if (params && params?.['useBio'] === 'no') {
        this.shareLogicService.movemoneyProcessHasNoBio(true);
      } else {
        this.shareLogicService.movemoneyProcessHasNoBio(false);
      }
    });
  }

  getTicketData(ticketID: string) {
    this.ticketService
      .getTicket(`${ticketID}`)
      .subscribe((ticket: any) => {
        const ticketData = <{ AccountNumber: string }>(
          JSON.parse(ticket.taskData)
        );
        this.updateSelectedAccount(ticket.customerId, ticketData.AccountNumber);
      });
  }

  updateSelectedAccount(cif: string, accountNumber: string) {
    this.accountService
      .getRefreshCacheCustomerAccounts(cif)
      .subscribe(
        (res: { responseObject: { accounts: CustomerAccountDataT[] } }) => {
          const activeAccount = res.responseObject.accounts.find(
            acc => acc.accountNumber === accountNumber
          );
          localStorage.setItem(
            'selectedAccount',
            JSON.stringify(activeAccount)
          );
        }
      );
  }
  // selectedAcc = {
  //     cif: '43000159165',
  //     accountCurrency: 'USD',
  //     accountName: 'KAMBA KAMBA PDG',
  //     accountNumber: '060109351120052',
  //     accountOpeningDate: '2016-08-26T12:00:00.000',
  //     accountStatus: 'A',
  //     availableBalance: '225.62',
  //     disbursedAmount: null,
  //     disbursementAmountSpecified: false,
  //     ecoCode: null,
  //     effectiveBalance: '0.00',
  //     flowAmmount: null,
  //     freezeCode: '',
  //     freezeReasonCode: null,
  //     lienAmmount: '3.17',
  //     mandate: 'SELF',
  //     nextDueDate: null,
  //     nextPaymentDueInNumOfDays: 0,
  //     percentCompleted: 0,
  //     remainingNumberOfInstalments: null,
  //     sanctionLimit: '0.00',
  //     scheduleNo: null,
  //     schemeCode: 'CA213',
  //     schemeType: 'CAA',
  //     shortName: null,
  //     iban: null,
  // };
}

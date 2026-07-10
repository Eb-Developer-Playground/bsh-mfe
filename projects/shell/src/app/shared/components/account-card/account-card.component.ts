import { Component, Input, OnInit } from '@angular/core';
import { Account } from '../../../home/customer/funds-transfer/funds-transfer.model';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss'],
})
export class AccountCardComponent implements OnInit {
  @Input() account: Pick<
    Account,
    | 'accountStatus'
    | 'accountName'
    | 'accountNumber'
    | 'schemeType'
    | 'accountCurrency'
  > = {
    accountStatus: '',
    accountName: '',
    accountNumber: '',
    schemeType: '',
    accountCurrency: '',
  };

  @Input() isActive = false;
  @Input() isMainAccount = false;

  constructor() {}

  ngOnInit(): void {}
}

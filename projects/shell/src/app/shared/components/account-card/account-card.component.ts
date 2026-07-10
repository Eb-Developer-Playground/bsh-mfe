import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Account } from '../../../home/customer/funds-transfer/funds-transfer.model';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-account-card',
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslatePipe } from '@ngx-translate/core';
import { StatementDetailsComponent } from './statement-details/statement-details.component';

@Component({
  selector: 'app-account-statements',
  templateUrl: './account-statements.component.html',
  styleUrls: ['./account-statements.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    TranslatePipe,
    StatementDetailsComponent,
  ],
})
export class AccountStatementsComponent implements OnInit {
  accountId = '';

  userInfo;
  constructor() {
    this.userInfo = JSON.parse(<string>localStorage.getItem('accMgntObj'));
    this.accountId = this.userInfo.accountsId;
  }

  onAccountIdChange(value: string) {
    this.accountId = value;
  }

  ngOnInit(): void {
  }
}

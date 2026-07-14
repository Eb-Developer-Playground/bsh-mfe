import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
import { SaveAndInvestService } from 'src/app/core/services/save-and-invest/save-and-invest.service';
import { SaveAndInvest } from 'src/app/shared/models/save-and-invest/save-and-invest.model';
import { AccountsListSelectorModalComponent } from '../shared/accounts-list-selector-modal/accounts-list-selector-modal.component';
import { CdscAccountOpeningService } from 'src/app/core/services/cdsc-account-opening/cdsc-account-opening.service';
import { IBreadcrumbConfig } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';

@Component({
  selector: 'app-saving-types-menu',
  templateUrl: './saving-types-menu.component.html',
  styleUrls: ['./saving-types-menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    TranslatePipe,
  ],
})
export class SavingTypesMenuComponent implements OnInit, OnDestroy {
  public breadcrumbsConfig: Array<IBreadcrumbConfig> = [
    { label: 'Service portal', url: 'services', active: false },
    { label: 'Customer 360°', url: 'services/customer-360', active: false },
    {
      label: 'Save&Invest',
      url: 'services/customer-360/save-and-invest-profile',
      active: false,
    },
    { label: 'Accounts', active: true },
  ];

  selectedType!: string;
  savings: Array<any> = [
    {
      type: 'goal',
      headline: 'SAVE-INVEST.GOAL.HEADLINE',
      subheadline: 'SAVE-INVEST.GOAL.SUBHEADLINE',
    },
    {
      type: 'classic',
      headline: 'SAVE-INVEST.CLASSIC.HEADLINE',
      subheadline: 'SAVE-INVEST.CLASSIC.SUBHEADLINE',
    },
    {
      type: 'cdsc',
      headline: 'SAVE-INVEST.CDSC.HEADLINE',
      subheadline: 'SAVE-INVEST.CDSC.SUBHEADLINE',
    },
  ];
  deposits: Array<any> = [
    {
      type: 'call',
      headline: 'SAVE-INVEST.CALL-DEPOSIT.HEADLINE',
      subheadline: 'SAVE-INVEST.CALL-DEPOSIT.SUBHEADLINE',
    },
    {
      type: 'cdsc',
      headline: 'SAVE-INVEST.CDSC.HEADLINE',
      subheadline: 'SAVE-INVEST.CDSC.SUBHEADLINE',
    },
    {
      type: 'classic',
      headline: 'SAVE-INVEST.CLASSIC.HEADLINE',
      subheadline: 'SAVE-INVEST.CLASSIC.SUBHEADLINE',
    },
    {
      type: 'fixed',
      headline: 'SAVE-INVEST.FIXED-DEPOSIT.HEADLINE',
      subheadline: 'SAVE-INVEST.FIXED-DEPOSIT.SUBHEADLINE',
    },
    {
      type: 'goal',
      headline: 'SAVE-INVEST.GOAL.HEADLINE',
      subheadline: 'SAVE-INVEST.GOAL.SUBHEADLINE',
    },
  ];

  accounts!: Array<SaveAndInvest.CustomerAccountsResponseArray> /* this.accountManagementService.getCustomerAccounts()*/;
  private destroy$ = new Subject();

  constructor(
    private saveAndInvestService: SaveAndInvestService,
    private accountManagementService: AccountManagementService,
    private cdscAccountOpeningService: CdscAccountOpeningService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAccounts();
  }

  onSelectedType = (subtype: string) => (this.selectedType = subtype);

  openAccountsListSelectorModal(): void {
    if (this.selectedType === 'cdsc') {
      this.accountManagementService.setsaveAndInvestDetails(null);
      this.cdscAccountOpeningService.resetLocalStorage();
      this.router.navigateByUrl(
        'services/customer-360/save-and-invest/cdsc-account-opening'
      );
      return;
    }

    const dialogRef = this.dialog.open(AccountsListSelectorModalComponent, {
      width: '520px',
      data: { accounts: this.accounts, selectedType: this.selectedType },
    });
    dialogRef.afterClosed().subscribe(selectedAccount => {
      if (selectedAccount) {
        const account = this.accounts.find(
          account => account.accountNumber === selectedAccount
        );
        this.accountManagementService.setsaveAndInvestDetails({
          type: this.selectedType,
          accountNumber: selectedAccount,
          accountName: account?.accountName,
          accountCurrency: account?.accountCurreny,
          availableBalance: account?.availableBalance,
        });

        switch (this.selectedType) {
          case 'goal':
            // redirect to specific page for selected type
            break;
          case 'classic':
            // redirect to specific page for selected type
            break;
          case 'fixed':
            this.router.navigateByUrl(
              'services/customer-360/save-and-invest/fixed-deposit-savings'
            );
            break;
          case 'call':
            this.router.navigateByUrl(
              'services/customer-360/save-and-invest/call-deposit-savings'
            );
            break;

          default:
            break;
        }
      }
    });
  }

  navigate = (type: string) => {
    switch (type) {
      case 'quit':
      case 'back':
        this.router.navigate(['services/customer-360'], {
          queryParams: { tabIndex: 6 },
        });
        break;
      case 'next':
        this.openAccountsListSelectorModal();
        break;

      default:
        break;
    }
  };

  private getAccounts() {
    this.saveAndInvestService
      .getCustomerAccounts(
        this.accountManagementService.customer.cif,
        'FixedDepositFlow'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        const accounts = response.responseObject.filter(
          account => !['TD410', 'SB162'].includes(account.schemeCode)
        );
        this.accounts = accounts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { SaveAndInvestDataStoreService } from 'src/app/core/services/save-and-invest/save-and-invest-data-store.service';

export interface IReviewDetail {
  label: string;
  value: string;
}

@Component({
  selector: 'app-review-details',
  templateUrl: './review-details.component.html',
  styleUrls: ['./review-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
  ],
})
export class ReviewDetailsComponent implements OnInit {
  @Input() isRolloverState!: boolean;
  @Input() isWithdrawalState!: boolean;
  @Input() isBreakState!: boolean;

  public title!: string;
  public subtitle!: string;

  public mainLabel!: string;
  public details!: Array<IReviewDetail>;

  constructor(
    private saveAndInvestDataStoreService: SaveAndInvestDataStoreService
  ) {}

  ngOnInit(): void {
    this.initTitles();
    this.initContent();
  }

  initTitles = () => {
    if (this.isWithdrawalState) {
      this.title = 'Review Withdraw Details';
      this.subtitle =
        'The amount to be withdrawn will be credited to the selected account';
    }
    if (this.isRolloverState) {
      this.title = 'Review Rollover Details';
      this.subtitle =
        'The amount to be rolled over will be reinvested in a new savings account and the remaining balance after rollover will be credited to the chosen account.';
    }
    if (this.isBreakState) {
      this.title = 'Review Breaking Account Details';
      this.subtitle = 'Below are the details for this withdrawal.';
    }
  };

  initContent = () => {
    if (this.isWithdrawalState) {
      this.mainLabel = '';
      this.details = [
        {
          label: 'Rollover option',
          value: 'Rollover principal',
        },
        {
          label: 'Available balance',
          value: 'KES 45,000',
        },
        {
          label: 'Principal amount',
          value: 'KES 25,000',
        },
        {
          label: 'Interest earned',
          value: 'KES 25,000',
        },
        {
          label: 'Withholding tax',
          value: 'KES 1,000',
        },
        {
          label: 'Transaction charges',
          value: 'KES 0.00',
        },
        {
          label: 'Amount to be withdrawn',
          value: 'KES 19,000',
        },
      ];
    }
    if (this.isRolloverState) {
      this.mainLabel = 'Rollover details';
      this.details = [
        {
          label: 'Rollover option',
          value: 'Rollover principal',
        },
        {
          label: 'Available balance',
          value: 'KES 45,000',
        },
        {
          label: 'Principal amount',
          value: 'KES 25,000',
        },
        {
          label: 'Interest earned',
          value: 'KES 25,000',
        },
        {
          label: 'Amount to be rolled over',
          value: 'KES 25,000 (Principal amount)',
        },
        {
          label: 'Withholding tax',
          value: 'KES 1,000',
        },
        {
          label: 'Transaction charges',
          value: 'KES 0.00',
        },
        {
          label: 'Remaining balance after rollover',
          value: 'KES 19,000',
        },
      ];
    }
    if (this.isBreakState) {
      const selectedAccount =
        this.saveAndInvestDataStoreService.getSelectedDepositAccount();
      this.details = [
        {
          label: 'Account number',
          value: selectedAccount.accountNumber,
        },
        {
          label: 'Available balance',
          value: selectedAccount.availableBalance,
        },
      ];
    }
  };
}

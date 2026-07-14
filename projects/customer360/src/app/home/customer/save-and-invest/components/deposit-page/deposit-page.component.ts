import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
import { IBreadcrumbConfig } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { BreadcrumbNavigationComponent } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { TransferDetailsComponent } from '../shared/transfer-details/transfer-details.component';
import { InvestmentDetailsComponent } from '../shared/investment-details/investment-details.component';
import { InfoBoxComponent } from 'src/app/shared/components/info-box/info-box.component';
import { ReviewDetailsComponent } from '../shared/review-details/review-details.component';
import { RolloverAndWithdravalDetailsComponent } from '../shared/rollover-and-withdraval-details/rollover-and-withdraval-details.component';
import { TransactionDetailsComponent } from '../shared/transaction-details/transaction-details.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-deposit-page',
  templateUrl: './deposit-page.component.html',
  styleUrls: ['./deposit-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BreadcrumbNavigationComponent,
    TransferDetailsComponent,
    InvestmentDetailsComponent,
    InfoBoxComponent,
    ReviewDetailsComponent,
    RolloverAndWithdravalDetailsComponent,
    TransactionDetailsComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    TranslatePipe,
  ],
})
export class DepositPageComponent implements OnInit, OnDestroy {
  public title!: string;
  public infoMessageTitle!: string;
  public infoMessageDetail!: string;
  public transferDetailsMainLabel!: string;

  public depositTypeParam!: string;
  public selectedAccountNumber!: string;

  public routeParamsSubscription: any;
  public queryParamsSubscription: any;

  public breadcrumbsConfig!: Array<IBreadcrumbConfig>;

  public form!: UntypedFormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountManagementService: AccountManagementService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({});
    this.routeParamsSubscription = this.route.params.subscribe(
      params => (this.depositTypeParam = params['depositType'])
    );
    this.queryParamsSubscription = this.route.queryParamMap.subscribe(
      params =>
        (this.selectedAccountNumber = <string>(
          (params.get('accountNumber') || '')
        ))
    );
    this.initTitles();
    this.initBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.routeParamsSubscription.unsubscribe();
    this.queryParamsSubscription.unsubscribe();
  }

  get isWithdrawalState(): boolean {
    return this.depositTypeParam === 'withdraw';
  }

  get isRolloverState(): boolean {
    return this.depositTypeParam === 'rollover';
  }

  get isBreakState(): boolean {
    return this.depositTypeParam === 'break';
  }

  initTitles = () => {
    if (this.isWithdrawalState) {
      this.title = 'Withdraw';
      this.infoMessageTitle =
        'Information on withdrawing a fixed deposit savings account';
      this.infoMessageDetail =
        'The total account balance will be transfered to the credit account and this fixed deposit savings account will be closed.';
      this.transferDetailsMainLabel =
        'Review the transfer details for the withdrawal.';
    }
    if (this.isRolloverState) {
      this.title = 'Rollover Fixed Savings Account';
      this.infoMessageTitle = 'Information on rolling over the principal';
      this.infoMessageDetail =
        'The principal will be reinvested in this savings account account and the remaining balance will be transfered to the credit account.';
    }
    if (this.isBreakState) {
      this.title = 'Break Account';
      this.infoMessageTitle = 'Information on breaking a fixed deposit account';
      this.infoMessageDetail =
        'By breaking the account before maturity, you lose all the interest your savings have accrued to date. The remaining amount will be transfered to the debit account and the fixed deposit account closed.';
      this.transferDetailsMainLabel =
        'Review the transfer details for the withdrawal. The amount to be withdrawn will be credited to the account selected below.';
    }
  };

  initBreadcrumbs = () => {
    this.breadcrumbsConfig = [
      {
        label: 'Service portal',
        url: 'services',
        active: false,
      },
      {
        label: 'Customer 360°',
        url: 'services/customer-360',
        active: false,
      },
      {
        label: 'Save&Invest',
        url: 'services/customer-360/save-and-invest-profile',
        active: false,
      },
    ];
    if (this.isWithdrawalState)
      this.breadcrumbsConfig.push({
        label: 'Withdraw',
        active: true,
      });
    if (this.isRolloverState)
      this.breadcrumbsConfig.push({
        label: 'Rollover',
        active: true,
      });
    if (this.isBreakState)
      this.breadcrumbsConfig.push({
        label: 'Break',
        active: true,
      });
  };

  onSubmit = () => {
    this.accountManagementService.setsaveAndInvestDetails(
      this.form.getRawValue()
    );
    this.router.navigateByUrl(
      `/services/customer-360/save-and-invest/review/${this.depositTypeParam}?accountNumber=${this.selectedAccountNumber}`
    );
  };
}

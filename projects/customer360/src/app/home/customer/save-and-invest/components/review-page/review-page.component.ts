import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
// TODO move interface declaration of IReviewDetailsSection to separate file
import {
  CdscAccountOpeningService,
  IReviewDetailsSection,
} from 'src/app/core/services/cdsc-account-opening/cdsc-account-opening.service';
import { SaveAndInvestDataStoreService } from 'src/app/core/services/save-and-invest/save-and-invest-data-store.service';
import { AccountService } from 'src/app/core/services/account/account.service';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
import { IBreadcrumbConfig } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { BreadcrumbNavigationComponent } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { VerifyBioDialogComponent } from 'src/app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
// import { VerifySkipBioComponent } from 'src/app/shared/components/verify-skip-bio/verify-skip-bio.component'; // TODO: Component not available
import { ReviewDetailsComponent } from '../shared/review-details/review-details.component';
import { TransferDetailsComponent } from '../shared/transfer-details/transfer-details.component';
import { InvestmentDetailsComponent } from '../shared/investment-details/investment-details.component';
import { TransactionDetailsComponent } from '../shared/transaction-details/transaction-details.component';
import { RolloverAndWithdravalDetailsComponent } from '../shared/rollover-and-withdraval-details/rollover-and-withdraval-details.component';
import { PaymentDetailsComponent } from '../shared/payment-details/payment-details.component';
import { InvestmentReviewDetailsComponent } from '../shared/investment-review-details/investment-review-details.component';
import { PaymentReviewDetailsComponent } from '../shared/payment-review-details/payment-review-details.component';
import { RolloverAndWithdrawalReviewDetailsComponent } from '../shared/rollover-and-withdrawal-review-details/rollover-and-withdrawal-review-details.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';
import { v4 as uuid } from 'uuid';

export interface IReviewDetail {
  label: string;
  value: string;
}

@Component({
  selector: 'app-review-page',
  templateUrl: './review-page.component.html',
  styleUrls: ['./review-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    BreadcrumbNavigationComponent,
    ReviewDetailsComponent,
    TransferDetailsComponent,
    InvestmentDetailsComponent,
    TransactionDetailsComponent,
    RolloverAndWithdravalDetailsComponent,
    PaymentDetailsComponent,
    InvestmentReviewDetailsComponent,
    PaymentReviewDetailsComponent,
    RolloverAndWithdrawalReviewDetailsComponent,
    VerifyBioDialogComponent,
    // VerifySkipBioComponent, // TODO: Component not available
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    TranslatePipe,
  ],
})
export class ReviewPageComponent implements OnInit, OnDestroy {
  public breadcrumbsConfig: Array<IBreadcrumbConfig> = [
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
    {
      label: 'Accounts',
      active: true,
    },
  ];
  public depositTypeParam!: string;
  public routeParamsSubscription: any;

  public selectedAccountNumber!: string;
  public queryParamsSubscription: any;

  public title!: string;
  public subtitle!: string;
  public details!: Array<IReviewDetailsSection>;

  private skipBioFlag?: boolean;
  private verifyBioFlag?: boolean;
  private verifyBioData?: any;

  private ticketId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private accountManagementService: AccountManagementService,
    private accountService: AccountService,
    private toastService: ToastService,
    private cdscAccountOpeningService: CdscAccountOpeningService,
    private saveAndInvestDataStoreService: SaveAndInvestDataStoreService
  ) {}

  ngOnInit(): void {
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
    this.initContent();
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

  get isCDSCAccountOpeningState(): boolean {
    return this.depositTypeParam === 'cdsc-account-opening';
  }

  initTitles = () => {};

  initContent = () => {
    const details = this.accountManagementService.getsaveAndInvestDetails();
    if (this.isCDSCAccountOpeningState)
      this.details = this.cdscAccountOpeningService.mapReviewDetails(details);
    if (this.isBreakState) {
      const accountInfo =
        this.saveAndInvestDataStoreService.getSelectedDepositAccount();
      this.details = [
        {
          title: 'Account details',
          details: [
            {
              label: 'Account number',
              value: accountInfo.accountNumber,
            },
            {
              label: 'Available balance',
              value: accountInfo.availableBalance,
            },
          ],
        },
        {
          title: 'Transfer details',
          details: [
            {
              label: 'Credit account',
              value: details.creditAccount,
            },
            {
              label: 'Transfer amount',
              value: details.transferAmount,
            },
          ],
        },
      ];
    }
  };

  onSubmit = () => {
    this.openBioDialog();
  };

  openBioDialog = () => {
    const customer = this.accountManagementService.getCustomerDetails();
    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '40%',
      data: {
        accepted: false,
        user: customer,
        hideSkipBio: true,
        doNotRedirectOnSuccess: true,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.data === 'skipBio') this.skipBioFlag = true;
      else if (result.bioObj) {
        this.verifyBioFlag = true;
        this.verifyBioData = result.bioObj;
      } else if (result.rightFingerPrint) {
        this.verifyBioFlag = true;
        this.verifyBioData = result.rightFingerPrint;
      }

      if (this.isBreakState) {
        this.breakAccount();
        return;
      }
      if (this.isCDSCAccountOpeningState) {
        this.createCDSCAccountTicket();
        return;
      }
      this.next();
    });
  };

    breakAccount = () => {
        const customerDetails =
            this.accountManagementService.getCustomerDetails();
        const data = {
            associatedId: uuid(),
            customerId: customerDetails.cif,
            customerName: `${customerDetails.firstName} ${customerDetails.lastName}`,
            parentTicketId: '',
            taskData: {
                customerPresent: true,
                notificationDetails: {
                    sms: true,
                    email: true,
                },
                contactDetails: {
                    phoneNumber: customerDetails.phoneNumber1,
                    email: customerDetails.email,
                    firstName: customerDetails.firstName,
                },
                accountNumber: this.selectedAccountNumber,
            },
        };
        this.accountService.submitBreakDepositAccount(data).subscribe(
            (result) => {
                if (!result.successful) {
                    this.toastService.show(
                        result.statusMessage,
                        'Error',
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                    return;
                }
                this.ticketId = result.responseObject?.id?.toString();
                if (this.skipBioFlag) this.skipBio();
                if (this.verifyBioFlag) this.verifyBio();
            }
        );
    };

  createCDSCAccountTicket = () => {
    const customerDetails = this.accountManagementService.getCustomerDetails();
    this.cdscAccountOpeningService.createTicket(
      customerDetails,
      this.openCDSCAccount
    );
  };

  openCDSCAccount = () => {
    const data = this.accountManagementService.getsaveAndInvestDetails();
    this.cdscAccountOpeningService.submitAccountOpening(
      data,
      this.checkCDSCChildFlows
    );
  };

  checkCDSCChildFlows = () => {
    this.cdscAccountOpeningService.checkChildFlows(this.verifyCDSCAccountBio);
  };

  verifyCDSCAccountBio = () => {
    this.cdscAccountOpeningService.verifyBio(this.verifyBioData, this.next);
  };

    skipBio = () => {
        this.accountService.skipDepositBio(this.ticketId).subscribe(
            (result) => {
                if (!result.successful) {
                    this.toastService.show(
                        result.statusMessage,
                        'Error',
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                    return;
                }
                this.next();
            }
        );
    };

    verifyBio = () => {
        const customerDetails =
            this.accountManagementService.getCustomerDetails();
        const data = {
            Cif: customerDetails.cif,
            Fingerprints: [this.verifyBioData],
        };
        this.accountService
            .verifyDepositBio(data, this.ticketId)
            .subscribe(
                (result) => {
                    if (!result.successful) {
                        this.toastService.show(
                            result.statusMessage,
                            'Error',
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                        return;
                    }
                    this.next();
                }
            );
    };

  next = () => {
    if (this.isBreakState)
      this.router.navigateByUrl(
        `services/customer-360/save-and-invest/success/${this.depositTypeParam}`
      );
    else
      this.router.navigateByUrl(
        `services/customer-360/save-and-invest/documents-upload/${this.depositTypeParam}`
      );
  };

  back = () => {
    this.router.navigateByUrl(
      `services/customer-360/save-and-invest/${this.depositTypeParam}`
    );
  };
}

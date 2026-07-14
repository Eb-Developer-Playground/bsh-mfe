import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TicketsService } from 'src/app/core/services';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
import { AccountService } from 'src/app/core/services/account/account.service';
import { SaveAndInvestService } from 'src/app/core/services/save-and-invest/save-and-invest.service';
import { IBreadcrumbConfig } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { VerifyBioDialogComponent } from 'src/app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { InfoBoxComponent } from 'src/app/shared/components/info-box/info-box.component';
import { InvestmentReviewDetailsComponent } from '../shared/investment-review-details/investment-review-details.component';
import { PaymentReviewDetailsComponent } from '../shared/payment-review-details/payment-review-details.component';
import { RolloverAndWithdrawalReviewDetailsComponent } from '../shared/rollover-and-withdrawal-review-details/rollover-and-withdrawal-review-details.component';
import { CustomerDetail } from 'src/app/shared/models/common/cifinquiry.model';
import { SaveAndInvest } from 'src/app/shared/models/save-and-invest/save-and-invest.model';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
import { IUploadedDocument } from 'src/app/shared/modules/upload-docs';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-deposits-review-details',
  templateUrl: './deposits-review-details.component.html',
  styleUrls: ['./deposits-review-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InfoBoxComponent,
    InvestmentReviewDetailsComponent,
    PaymentReviewDetailsComponent,
    RolloverAndWithdrawalReviewDetailsComponent,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatCheckboxModule,
    MatButtonModule,
    TranslatePipe,
  ],
})
export class DepositsReviewDetailsComponent implements OnInit, OnDestroy {
  isCustomerPresent = false;
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

  paymentDetails: any;
  formData: any;
  public notificationsForm!: UntypedFormGroup;
  public creationType!: string | null;
  private interestEstimate!: SaveAndInvest.InterestEstimateResponseData;
  private documents!: IUploadedDocument[];
  private ticketId!: string;
  private parentTicketId!: number | null;
  private destroy$ = new Subject();

  constructor(
    private accountManagementService: AccountManagementService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private saveAndInvestService: SaveAndInvestService,
    private toastService: ToastService,
    private accountService: AccountService,
    private ticketService: TicketsService
  ) {}

  ngOnInit(): void {
    this.paymentDetails = this.accountManagementService.getsaveAndInvestDetails();
    this.formData = this.paymentDetails?.formData;
    this.notificationsForm = this.fb.group({
      Sms: true,
      Email: true,
    });
    this.creationType = this.route.snapshot.paramMap.get('transactionType');
    if (this.creationType !== 'call') this.getInterestPercentEstimate();
  }

  navigate = (type: string) => {
    switch (type) {
      case 'quit':
        this.router.navigate(['services/customer-360'], {
          queryParams: { tabIndex: 6 },
        });
        break;
      case 'back':
        this.backToDepositForm();
        break;
      case 'next':
        this.openBioDialog();
        break;

      default:
        break;
    }
  };

  backToDepositForm = () => {
    switch (this.creationType) {
      case 'fixed':
        this.router.navigate([
          `/services/customer-360/save-and-invest/fixed-deposit-savings/true`,
        ]);
        break;
      case 'call':
        this.router.navigate([
          `/services/customer-360/save-and-invest/call-deposit-savings/true`,
        ]);
        break;

      default:
        break;
    }
  };

    openBioDialog = async () => {
        const customer = JSON.parse(<string>localStorage.getItem('accMgntObj'));
        this.isCustomerPresent = customer?.isPresent;
        if (!this.isCustomerPresent) {
            this.accountManagementService.setCustomerIsPresent(
                this.isCustomerPresent
            );
            return await this.submitDeposit(this.isCustomerPresent);
        }
        const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
            width: '40%',
            data: {
                accepted: false,
                user: customer,
                hideSkipBio: true,
                inProcess: true,
                doNotRedirectOnSuccess: true,
                doNotOpenSkipModal: true,
                deposit: true,
            },
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (bioResult: any) => {
                if (bioResult?.data === true) {
                    this.isCustomerPresent = bioResult.bio ? true : false;
                    await this.submitDeposit(bioResult.bio);
                }

            });
    };

  submitDeposit = async (biodata: any) => {
    this.parentTicketId = +(<string>localStorage.getItem('ticketId')) || null;

        this.parentTicketId = +<string>localStorage.getItem('ticketId') || null;

        this.documents = this.paymentDetails.uploadedDocs

        const customer = this.accountManagementService.getCustomerCifData();
        const customerDetail =
            this.accountManagementService.getCustomerDetails();
        if (this.creationType == 'call') {


            this.formData = { ...this.formData, ParentTicketId: this.parentTicketId };

            const payload = this.saveAndInvestService.getCallDepositSaving(
                this.formData,
                this.notificationsForm.value,
                this.isCustomerPresent,
                customer as CustomerDetail.RootObject
            );

            this.saveAndInvestService
                .submitCallDeposit(payload)
                .subscribe(async (s) => {
                    this.ticketId = s.responseObject.id;
                    this.saveAndInvestService
                        .verfiyBio(
                            s.responseObject.id,
                            biodata,
                            this.isCustomerPresent,
                            customerDetail?.cif
                        )
                        .pipe(takeUntil(this.destroy$)
                            ,
                            switchMap((response) => {

                                //upload Documents
                                if (this.documents && this.documents.length !== 0) {
                                    return this.uploadDocumentsToNewgen().pipe(
                                        catchError((error: any) => {
                                            return EMPTY;
                                        })
                                    );
                                } else {
                                    return of('continue');
                                }
                            }),
                            switchMap(() => {
                                if (this.ticketId) {
                                    return this.saveAndInvestService
                                        .verfiyBio(
                                            this.ticketId,
                                            biodata,
                                            this.isCustomerPresent,
                                            customerDetail?.cif
                                        );
                                } else {
                                    return EMPTY;
                                }
                            }),
                            switchMap((bioData: any) => {
                                return this.ticketService
                                    .getTicket(`${this.ticketId}`)
                                    .pipe(
                                        map((ticketData: any) => {
                                            return { bioData, ticketTaskData: JSON.parse(ticketData?.taskData) }
                                        }
                                        ))
                            }),
                            takeUntil(this.destroy$)
                        )
                        .subscribe((s) => {

                            if (!this.isCustomerPresent) {
                                this.toastService.show(
                                    '',
                                    'Call deposit is successfully sent to checker',
                                    MessageBoxType.SUCCESS,
                                    5000, undefined, undefined, false
                                );
                                this.goToDashboard();
                                return;
                            }

              if (s?.bioData?.successful) {
                this.saveAndInvestService.setTicketResponse(s.ticketTaskData);

                                this.router.navigate([
                                    `/services/customer-360/save-and-invest/success/${this.creationType}`,
                                ]);
                            } else {
                                this.toastService.show(
                                    s?.bioData?.statusMessage,
                                    'Error',
                                    MessageBoxType.DANGER,
                                    5000, undefined, undefined, false
                                );
                            }
                        });


                });
        } else if (this.creationType === 'fixed') {



            const customerDetails = {
                ...this.accountManagementService.getCustomerDetails(),
                ParentTicketId: this.parentTicketId,
                customerPresent: this.isCustomerPresent
            };

      const payload = this.saveAndInvestService.getFixedDepositPayload(
        this.formData,
        this.notificationsForm.value,
        customerDetails
      );

            this.saveAndInvestService
                .submitFixedDeposit(payload)
                .pipe(
                    catchError((error) => {
                        return EMPTY;
                    }),
                    switchMap((response) => {
                        if (response?.responseObject) {
                            const _response = response?.responseObject;
                            this.ticketId = _response.id;
                        }
                        //upload Documents
                        if (this.documents && this.documents.length !== 0) {
                            return this.uploadDocumentsToNewgen().pipe(
                                catchError((error: any) => {
                                    return EMPTY;
                                })
                            );
                        } else {
                            return of('continue');
                        }
                    }),
                    switchMap(() => {
                        if (this.ticketId) {
                            return this.saveAndInvestService
                                .verfiyBio(
                                    this.ticketId,
                                    biodata,
                                    this.isCustomerPresent,
                                    customerDetail?.cif
                                )
                                .pipe(
                                    catchError((error: any) => {
                                        return EMPTY;
                                    })
                                );
                        } else {
                            return EMPTY;
                        }
                    }),
                    switchMap((bioData: any) => {
                        return this.ticketService
                            .getTicket(`${this.ticketId}`)
                            .pipe(
                                map((ticketData: any) => {
                                    return { bioData, ticketTaskData: JSON.parse(ticketData?.taskData) }
                                }
                                ))
                    }),
                    takeUntil(this.destroy$)
                )
                .subscribe((s) => {

                    if (!this.isCustomerPresent) {
                        this.toastService.show(
                            '',
                            'Fixed deposit is successfully sent to checker',
                            MessageBoxType.SUCCESS,
                            5000, undefined, undefined, false
                        );
                        this.goToDashboard();
                        return;
                    }


                    if (s?.bioData?.successful) {
                        localStorage.setItem(
                            'success_data',
                            JSON.stringify({ ...payload, ticketTaskData: s.ticketTaskData })
                        );
                        this.router.navigate([
                            `/services/customer-360/save-and-invest/success/${this.creationType}`,
                        ]);
                    } else {
                        this.toastService.show(
                            s?.bioData?.statusMessage,
                            'Error',
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                    }
                });
        }
    };

  private uploadDocumentsToNewgen(): Observable<any> {
    const _accMgntObj = localStorage.getItem('accMgntObj');
    const accMgntObj = JSON.parse(<string>_accMgntObj);

    const getUploads = this.documents.map((docs: IUploadedDocument) => ({
      ...docs.document,
      filename: docs.name,
    }));

    getUploads.forEach(docs => (docs.data = docs.data?.split(',')[1]));

    const data = {
      CIF: accMgntObj.cif,
      AccountNumber: accMgntObj.accountsId,
      Country: 'KE',
      ticketNumber: `${this.ticketId}`,
      idType: 'ID',
      idNumber: accMgntObj.idNumber,
      Service: 'NewGen',
      documents: getUploads,
    };
    return this.accountService.uploadTransactionDocuments(data);
  }
  goToDashboard = () => this.router.navigate(['/dashboard']);

  private getInterestPercentEstimate() {
    //get Interest
    this.saveAndInvestService
      .getInterestPercentEstimate(
        this.formData.initialAmount,
        this.formData.depositTerm,
        this.formData.debitAccountCurrency
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        const interestEstimate = response.responseObject;
        this.formData = {
          ...this.formData,
          interestPercent: interestEstimate.interestRateInPercent,
          investmentReturns: interestEstimate.investmentReturns,
        };
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { firstValueFrom, forkJoin, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';
import { AccountService } from '@app/core/services/account/account.service';
import { AuditService } from '@app/core/services/audit/audit.service';

import { SessionService } from '@app/shared/services';
import { StepperChildComponent, OnSave, ContextManager } from '@app/shared/modules/stepper';

import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { BioVerifyInput } from '@app/shared/modules/fingerprints';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { VerifySkipBioComponent } from '@app/shared/components/verify-skip-bio/verify-skip-bio.component';
import { ApiService } from '@app/shared/services';
import { ActionTicketsService } from '@app/shared/services/actionTickets/action-tickets.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { DocumentsComponent } from './documents-view/documents.component';

@Component({
  selector: 'app-change-mandate-preview',
  templateUrl: './change-mandate-preview.component.html',
  styleUrl: './change-mandate-preview.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    TranslatePipe,
    DatePipe,
    DocumentsComponent,
  ],
})
export class ChangeMandatePreviewComponent
  extends StepperChildComponent
  implements OnInit, OnSave
{
  @Input() documentsTicketId!: string;
  isBusiness: boolean;
  panelOpenState = false;
  kraPin: string = '';
  cifInquiryObj: any;
  customerDetails: any;
  fingerprintAccepted = false;
  private ticketId!: string;
  isPresent!: boolean;

  customer: any = JSON.parse(<string>localStorage.getItem('accMgntObj'));
  showBioCaptured = false;
  bankId: string;
  customerId: any;
  channels: Array<{ channel: string; status: string }> = [];
  filteredAccounts: any = [];
  selectedAccount: any;
  private destroy$ = new Subject();
  customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  selectedAccountData: any;

  selectedSignatory: any = [];
  effectiveDate: string | null = null;

  documents: any[] = [];

  constructor(
    public translateService: TranslateService,
    private accountManagementService: AccountManagementService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private auditService: AuditService,
    private sessionService: SessionService,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef,
    private api: ApiService,
    private actionTicketsService: ActionTicketsService,
    public ctxManager: ContextManager,
  ) {
    super();
    this.isBusiness = this.accountManagementService.getIsCustomerBusiness();
    this.customerDetails = this.accountManagementService.getCustomerDetails();
    this.bankId = this.sessionService.userBank;
  }

  onActive() {
    this.documentsTicketId = JSON.parse(
      <string>localStorage.getItem('runningTaskId')
    );
    const storedAccount = localStorage.getItem('selectedAccountNumber');

    if (storedAccount) {
      const selectedAccount = JSON.parse(storedAccount);

      if (selectedAccount) {
        this.searchCustomerByAccNo(selectedAccount);
      }
    }
    const storedSignatory = localStorage.getItem('selectedSignatory');
    if (storedSignatory) {
      this.selectedSignatory = JSON.parse(storedSignatory);
    }
    this.getDocuments();
  }
  ngOnInit(): void {
    const bioCaptured: any = localStorage.getItem('show-bio-captured');
    this.customerId = this.customer.cif;
    this.showBioCaptured = JSON.parse(bioCaptured);
    this.ticketId = JSON.parse(<string>localStorage.getItem('ticketId'));

    this.getMiddleName();
    this.getCifInquiry();

    this.isPresent = this.customer.isPresent;

    this.effectiveDate = new Date().toISOString().split('T')[0];
  }

  getDocuments(): void {
    const data = {
      ticketNumber: this.documentsTicketId.toString(),
      service: 'NewGen',
      Cif: '',
    };
    this.api
      .post<any>('/v2/documents/search', data)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: { responseObject: any; successful: boolean }) => {
        if (res.successful) {
          this.documents = res.responseObject;
          this.cdr.detectChanges();
        }
      });
  }

  getMiddleName() {
    const firstName = this.customerDetails?.firstName;
    const fullName =
      this.customerDetails?.fullName || this.customerDetails?.lastName;
    const lastName = this.customerDetails?.lastName;

    const fullNameArray = fullName.split(' ');
    if (lastName.indexOf(' ') > 0) {
      const lastNameArray = lastName.split(' ');
      const newLastName = lastNameArray.pop();
      const middleName = lastNameArray.join();
      this.customerDetails.middleName = middleName;
      this.customerDetails.lastName = newLastName;
      return;
    }
    const middleName = fullNameArray.filter(
      (name: string) => firstName !== name && lastName !== name
    );
    this.customerDetails.middleName = middleName.join();
  }

  getCifInquiry = () => {
    const payload = {
      bankId: this.customerDetails.bankID,
      customerId: this.customerDetails.cif,
    };
    this.logAudit(
      'SearchCustomerCIFInquiry',
      'Fetch personal details from CIF',
      JSON.stringify(payload)
    );
    this.accountService.cifInquiryV2(this.isBusiness, payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: res => {
        if (res.statusCode !== '00' || !res.responseObject) {
          this.logAudit(
            'SearchCustomerCIFInquiryFailed',
            'Fetch personal details from CIF',
            JSON.stringify(res)
          );
          return;
        }
        this.logAudit(
          'SearchCustomerCIFInquirySuccess',
          'Fetch personal details from CIF',
          JSON.stringify(res)
        );
        const cifInquiryObj: any = res.responseObject;
        this.kraPin = this.isBusiness
          ? cifInquiryObj.companyDetails.krapInNumber
          : cifInquiryObj.personalDetails.krapInNumber;
      },
      error: (err: any) => {
        this.logAudit(
          'SearchCustomerCIFInquiryFailed',
          'Fetch personal details from CIF',
          JSON.stringify(err)
        );
      }
  });
  };

  logAudit = (EventName: any, EventDescription: any, AuditData: any) => {
    const log = {
      EventName,
      EventDescription,
      AuditData,
    };
    this.auditService.auditLog(log, true)
    .pipe(takeUntil(this.destroy$))
    .subscribe({});
  };

  searchCustomerByAccNo(accountNumber: number) {
    const query = `?Id=${this.customerDetails.cif}&bankId=${this.customerDetails.bankID}&idType=customerid`;
    return this.accountService
      .getAccount(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.selectedAccount =
          res.responseObject.relatedAccounts.find(
            (v: any) =>
              v.accountStatus === 'A' && v.accountNumber === accountNumber
          ) ||
          res.responseObject.accounts.find(
            (v: any) =>
              v.accountStatus === 'A' && v.accountNumber === accountNumber
          );
        localStorage.setItem(
          'selectedAccountData',
          JSON.stringify(this.selectedAccount)
        );

        this.cdr.detectChanges();
      });
  }

  onSave() {
    const runningTaskId = localStorage.getItem('runningTaskId');
    const runningActionFlow = localStorage.getItem('runningActionFlow');
    const signatoryTicket = this.ctxManager.currentContextData.ticketId
    const signatoryFlow = this.ctxManager.currentContextData?.process


    if (runningTaskId && runningActionFlow && !this.isPresent) {
      const notPresentPayload = {
        skipBio: true,
      };
      this.actionTicketsService
        .sendNotPresentBio(runningTaskId, runningActionFlow, notPresentPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.successful) {
                const validateMandateBioVerify$ = this.actionTicketsService
                .validateMandateBioVerify(runningTaskId, runningActionFlow);

                let validateSignatoryBioVerify$ = of(null);
                if (this.ctxManager?.currentContextData?.mandate?.updateMandate) {
                validateSignatoryBioVerify$ = this.actionTicketsService
                  .validateMandateBioVerify(signatoryTicket, signatoryFlow);
                }
                forkJoin([validateMandateBioVerify$, validateSignatoryBioVerify$])
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: ([response, signatoryResponse]: [any, any]) => {
                  if (response.successful && (!this.ctxManager?.currentContextData?.mandate?.updateMandate || signatoryResponse?.successful)) {
                    this.clearAccountInquiryCache();
                    this.toastService.show(
                    'Success',
                    'Mandate submitted to approver successfully!',
                    MessageBoxType.SUCCESS,
                    5000,
                    undefined,
                    undefined,
                    false
                    );
                    this.gotoNext();
                  } else {
                    this.toastService.show(
                    'Error',
                    'Failed to validate mandate documents',
                    MessageBoxType.DANGER,
                    5000,
                    undefined,
                    undefined,
                    false
                    );
                  }
                  },
                  error :(error: any) => {
                  this.toastService.show(
                    'Error',
                    'An error occurred while validating mandate documents',
                    MessageBoxType.DANGER,
                    5000,
                    undefined,
                    undefined,
                    false
                  );
                  }
            });
            }
          },
         error: (error: any) => {
            this.toastService.show(
              'Error',
              'An error occurred while sending the not present bio',
              MessageBoxType.DANGER,
              5000,
              undefined,
              undefined,
              false
            );
          }
    });
    } else if (runningTaskId && runningActionFlow && this.isPresent) {
      this.launchBio();
    } else {
      this.toastService.show(
        'Error',
        'There was a problem validating Action, Please contact Admin',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
    }
  }

  openVerifyBioDialog(event?: any): void {
    const runningTaskId = localStorage.getItem('runningTaskId') || '';
    const runningActionFlow = localStorage.getItem('runningActionFlow') || '';
    const user = this.customerData;

    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '50%',
      data: {
        searchFlow: false,
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        changeOfMandate: true,
        ticketId: runningTaskId,
      },
    });

    dialogRef.afterClosed().
    pipe(takeUntil(this.destroy$))
    .subscribe(async result => {
      if (result) {
        try {
          await this.actionTicketsService.validateMandateDocuments(
            runningTaskId,
            runningActionFlow
          );

          this.fingerprintAccepted = result.data;
          this.clearAccountInquiryCache();
          this.gotoNext();
        } catch (error) {
          this.toastService.show(
            'Error',
            'Failed to validate mandate documents',
            MessageBoxType.DANGER
          );
        }
      }
    });
  }

  launchBio(): void {
    const result = 'canVerify';
    const ticket = JSON.parse(<string>localStorage.getItem('ticketId'));
    const selectedAccount = this.selectedAccount;
    const filteredAccount = this.filteredAccounts.filter(
      (account: any) => account.accountNumber === selectedAccount
    );
    this.customerData.accounts = [this.selectedAccount];

    const payload: BioVerifyInput = {
      account: filteredAccount[0],
      skipBio: true,
      inProcess: true,
      customerId: this.customer.customerId,
      customerType: 'Individual',
      fullName: `${this.customerData.firstName || ''} ${this.customerData.lastName || ''}`,
      bankId: this.customerData?.bankID,
    };

    if (filteredAccount[0]?.mandate !== 'SELF' || this.isBusiness) {
      this.openSignatoriesDialog(result);
    } else {
      this.openVerifyBioDialog();
    }
  }

  openSignatoriesDialog(data: any) {
    const user = this.customerData;

    const dialogRef = this.dialog.open(VerifySignatoryDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        searchFlow: false,
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        inProcess: true,
        changeOfMandate: true,
      },
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      if (data === 'canVerify' && result.data && result.status === data)
        return this.openVerifySignatoryBioDialog(result.data);
    });
  }

  openVerifySignatoryBioDialog(signatories: any) {
    const runningTaskId = localStorage.getItem('runningTaskId') || '';
    const runningActionFlow = localStorage.getItem('runningActionFlow') || '';
    const user = this.customerData;
    const signatoryTicket = this.ctxManager.currentContextData.ticketId
    const signatoryFlow = this.ctxManager.currentContextData?.process

    const dialogRef = this.dialog.open(VerifySignatoryBioDialogComponent, {
      data: {
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        signatories: signatories,
        changeOfMandate: true,
        inProcess: true,
      },
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe(async result => {
      if (result) {

        try {
          const mandateValidation$ = this.actionTicketsService.validateMandateBioVerify(runningTaskId, runningActionFlow);
          if (this.ctxManager.currentContextData.updateMandate) {
            const signatoryValidation$ = this.actionTicketsService.validateMandateBioVerify(signatoryTicket, signatoryFlow);
            await firstValueFrom(forkJoin([mandateValidation$, signatoryValidation$]));
          } else {
            await firstValueFrom(mandateValidation$);
          }

          this.fingerprintAccepted = result.data;
          this.toastService.show(
            this.translateService.instant('TOAST.ACTION-SUCCESSFULLY'), '', MessageBoxType.SUCCESS,
            5000, undefined, undefined, false
          );
          this.gotoNext();
        } catch (error) {
          this.toastService.show(
            'Error',
            'Failed to validate mandate documents',
            MessageBoxType.DANGER
          );
        }
      }
    });
  }

  openSkipBioDialog(event?: string) {
    const user = this.accountManagementService.getCustomerDetails();
    const dialogRef = this.dialog.open(VerifySkipBioComponent, {
      data: {
        user: event ? user : '',
        headerText: event ? 'Known agent verification' : 'Skip Biometric',
        subHeaderText: event
          ? 'Requirements for known agent verification'
          : 'Requirements for bio-override',
      },
    });
  }

  clearAccountInquiryCache() {
    localStorage.removeItem('ticketId');
    localStorage.removeItem('selectedSignatory');
    localStorage.removeItem('uploadedDocuments');
    localStorage.removeItem('accountType');
    this.accountService
      .clearAccountInquiryCache(
        `?Id=${this.customer.cif}&bankId=${this.customer.bankID}&idType=customerid`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((v: any) => {});
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

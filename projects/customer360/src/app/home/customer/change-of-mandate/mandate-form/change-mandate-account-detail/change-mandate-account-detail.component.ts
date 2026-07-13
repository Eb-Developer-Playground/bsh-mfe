import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';
import { AccountService } from '@app/core/services/account/account.service';
import { AuditService } from '@app/core/services/audit/audit.service';
import { ContextManager } from '@app/shared/modules/stepper';
import { SessionService } from '@app/shared/services';


@Component({
  selector: 'app-change-mandate-account-detail',
  templateUrl: './change-mandate-account-detail.component.html',
  styleUrls: ['./change-mandate-account-detail.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    TranslatePipe,
  ],
})
export class ChangeMandateAccountDetailComponent implements OnInit, OnDestroy {
  @Input() mandateForm!: UntypedFormGroup;
  private accountManagementService = inject(AccountManagementService);
  private sessionService = inject(SessionService);

  isBusiness: boolean = this.accountManagementService.getIsCustomerBusiness();
  panelOpenState = false;
  kraPin: any;
  cifInquiryObj: any;
  customerDetails: any = this.accountManagementService.getCustomerDetails();
  customer: any = JSON.parse(<string>localStorage.getItem('accMgntObj'));
  showBioCaptured: boolean = false;
  bankId: string = this.sessionService.userBank;
  customerId: any;
  channels: Array<{ channel: string; status: string }> = [];
  selectedAccount: any;
  private destroy$ = new Subject();
  private isActiveWithSelfMandate = (v: any) =>
    v.accountStatus === 'A' && v.mandate === 'SELF';

  constructor(
    public translateService: TranslateService,
    private auditService: AuditService,
    private accountService: AccountService,
    private ctxManager: ContextManager,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const data = this.ctxManager.currentContextData;
    this.mandateForm
      .get('account')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(acc => this.searchCustomerByAccNo(acc));
    if (data.selectedAccount?.accountNumber)
      this.searchCustomerByAccNo(data.selectedAccount?.accountNumber);
    const bioCaptured: any = localStorage.getItem('show-bio-captured');
    this.customerId = this.customer.cif;
    this.showBioCaptured = JSON.parse(bioCaptured);
    this.getMiddleName();
    this.getCifInquiry();
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
      BankId: this.customerDetails.bankID,
      CustomerID: this.customerDetails.cif,
    };
    this.logAudit(
      'SearchCustomerCIFInquiry',
      'Fetch personal details from CIF',
      JSON.stringify(payload)
    );
    this.accountService.cifInquiryV2(this.isBusiness, payload).subscribe(
      res => {
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
      (err: any) => {
        this.logAudit(
          'SearchCustomerCIFInquiryFailed',
          'Fetch personal details from CIF',
          JSON.stringify(err)
        );
      }
    );
  };

  logAudit = (EventName: any, EventDescription: any, AuditData: any) => {
    const log = {
      EventName,
      EventDescription,
      AuditData,
    };
    this.auditService.auditLog(log, true).subscribe({});
  };

  searchCustomerByAccNo(accountNumber: string) {
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

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

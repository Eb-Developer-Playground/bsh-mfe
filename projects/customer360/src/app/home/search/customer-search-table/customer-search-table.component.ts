import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountService } from '../../../core/services/account/account.service';
import { AccountManagementService } from '../../../core/services/account-management/account-management.service';
import { CashManagementService } from '../../../core/services/cash-management/cash-management.service';
import { VerifyBioDialogComponent } from '../../../shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySignatoryBioDialogComponent } from '../../../shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySignatoryDialogComponent } from '../../../shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySkipBioComponent } from '../../../shared/components/verify-skip-bio/verify-skip-bio.component';
import { ToastService } from '../../../shared/modules/toast/toast.service';
import { MessageBoxType } from '../../../shared/modules/toast/models';
import { PillsComponent } from '../../../shared/components/pills/pills.component';

interface Account {
  accountOpeningDate: string;
  accountStatus: string;
  schemeType: string;
  accountNumber: string;
  accountName: string;
  mandate: string;
}

@Component({
  selector: 'app-customer-search-table',
  templateUrl: './customer-search-table.component.html',
  styleUrls: ['./customer-search-table.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatRadioModule,
    MatButtonModule,
    PillsComponent,
    DatePipe,
    TranslatePipe,
  ],
})
export class CustomerSearchTableComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input() customerData: any;
  @Input() accounts: any;
  @Input() searchOption: any;
  @Input() highRiskCustomer = false;
  @Input() selectedRow: any;
  @Output() accountSelectEvent = new EventEmitter<any>();
  @Output() closedEvent = new EventEmitter<any>();

  private readonly cdRef = inject(ChangeDetectorRef);
  readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly accountService = inject(AccountService);
  private readonly accountManagementService = inject(AccountManagementService);
  private readonly cashManagementService = inject(CashManagementService);

  protected customerCanVerify = '';
  protected reasonForViewingProfile = '';
  protected fingerprintAccepted = false;

  protected displayedColumns: string[] = [
    'select',
    'accountHolder',
    'cif',
    'accountNumber',
    'profileType',
    'accountStatus',
    'openingDate',
  ];
  protected dataSource!: MatTableDataSource<Account>;
  protected selection = new SelectionModel<Account>(true, []);
  protected accountStatusMap: Record<string, string> = {
    A: 'COMMON.ACTIVE',
    D: 'COMMON.DORMANT',
    F: 'Flagged',
  };

  protected accountStatusColor: Record<string, string> = {
    A: 'green',
    D: 'orange',
    F: 'red',
  };

  protected pageSizeOptions = [3, 6, 9, 12];
  protected pageSize = 3;
  protected Signatories: any;
  protected mandatesArray: any[] = [];
  protected dormantAccountsArray: any[] = [];
  protected submissionAccountsArray: any[] = [];
  protected sb104ccountArray: any[] = [];
  protected isIndividualAccount = true;

  private destroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource<Account>(this.accounts || []);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.filterDormantAccounts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = new MatTableDataSource<Account>(this.accounts || []);
    this.dataSource.paginator = this.paginator;

    if (changes['selectedRow']?.currentValue) {
      this.selection.isSelected(changes['selectedRow'].currentValue);
      this.onSelectAccount(this.selectedRow);
      this.openLaunchCustomerDialog();
    }
  }

  private filterDormantAccounts(): void {
    this.isIndividualAccount = localStorage.getItem('isBusiness') === 'false';

    if (this.accounts?.length > 0) {
      this.dormantAccountsArray = this.accounts.filter(
        (account: any) =>
          account.accountStatus === 'D' &&
          account.schemeType === 'SBA' &&
          account.schemeCode !== 'SB199' &&
          account.mandate === 'SELF',
      );

      this.sb104ccountArray = this.accounts.filter(
        (account: any) => account.schemeCode === 'SB104' && account.mandate === 'SELF',
      );

      this.submissionAccountsArray = this.dormantAccountsArray.map(
        (account: any) => account.accountNumber,
      );

      if (this.dormantAccountsArray.length > 0) {
        localStorage.setItem('dormantAccounts', JSON.stringify(this.dormantAccountsArray));
        localStorage.setItem('dormantAccExists', JSON.stringify(true));
        localStorage.setItem('dormantAvailable', JSON.stringify(this.dormantAccountsArray));
        localStorage.setItem('submissionAccounts', JSON.stringify(this.submissionAccountsArray));
      }
    }
  }

  protected isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.data?.length || 0;
    return numSelected === numRows;
  }

  protected masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    }
    this.selection.select(...this.dataSource.data);
  }

  protected checkboxLabel(row?: Account): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.accountName + 1}`;
  }

  protected checkEmptyMandate(row: Account): boolean {
    return row?.mandate === '';
  }

  protected onSelectAccount(row: any): void {
    this.accountSelectEvent.emit(row);
  }

  protected closeDialog(): void {
    this.closedEvent.emit(true);
  }

  private getSignatories(accountNumber: string, bankID: string): void {
    const searchType = this.searchOption?.option;

    let nationalId: any = this.customerData[0]?.identifications
      ?.filter((x: any) => x.type === 'NationalID')
      ?.find((element: any) => element);
    let compRegNo: any = this.customerData[0]?.identifications
      ?.filter((x: any) => x.type === 'CompRegNo')
      ?.find((element: any) => element);
    let passportValue: any = this.customerData[0]?.identifications
      ?.filter((x: any) => x.type === 'PassportNo')
      ?.find((element: any) => element);

    let selectedRowData = this.selectedRow;

    const sigData = { AccountId: accountNumber, BankId: bankID };

    this.accountService
      .getAccountSignatories(sigData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.successful) {
          this.mandatesArray = res.responseObject?.mandates || [];
          const selfOrAll_And_OneMandate =
            this.mandatesArray?.length === 1 &&
            this.mandatesArray.some(
              (x: any) => x.operationMode === 'ALL' || x.operationMode === 'SELF',
            );
          const result = 'canVerify';
          const isRetail = this.customerData[0]?.retCorpFlg === 'Retail';

          if (searchType === 'Account Number' && selectedRowData?.mandate !== 'SELF') {
            this.openSignatoriesDialog(result);
          } else if (this.sb104ccountArray.length > 0) {
            this.openVerifyBioDialog(result);
          } else if (searchType === 'Account Number' && selectedRowData?.mandate === 'SELF' && this.mandatesArray.length > 1) {
            this.openSignatoriesDialog(result);
          } else if (
            (searchType === 'ID Number' || searchType === 'National ID' || searchType === 'Passport Number') &&
            (nationalId?.id !== '' || passportValue?.id !== '') &&
            !compRegNo?.id &&
            isRetail &&
            selfOrAll_And_OneMandate
          ) {
            this.openVerifyBioDialog(result);
          } else if (
            (searchType === 'ID Number' || searchType === 'National ID' || searchType === 'Passport Number') &&
            (nationalId?.id !== '' || passportValue?.id !== '') &&
            !compRegNo?.id &&
            isRetail &&
            !selfOrAll_And_OneMandate
          ) {
            this.openSignatoriesDialog(result);
          } else if (
            (searchType === 'CIF' || searchType === 'Account Number' ||
             searchType === "Voter's Card" || searchType === "Refugee's Id" ||
             searchType === 'Driver License' || searchType === 'Maisha Card' ||
             searchType === 'Military ID' || searchType === 'Police ID' ||
             searchType === 'Alien ID' || searchType === 'Permit ID' ||
             searchType === 'Other Document Number' || searchType === 'Phone Number' ||
             searchType === 'Mobile Number') &&
            isRetail &&
            !selfOrAll_And_OneMandate
          ) {
            this.openSignatoriesDialog(result);
          } else if (
            (searchType === 'CIF' || searchType === 'Account Number' ||
             searchType === "Voter's Card" || searchType === "Refugee's Id" ||
             searchType === 'Driver License' || searchType === 'Maisha Card' ||
             searchType === 'Military ID' || searchType === 'Police ID' ||
             searchType === 'Alien ID' || searchType === 'Permit ID' ||
             searchType === 'Other Document Number' || searchType === 'Phone Number' ||
             searchType === 'Mobile Number') &&
            isRetail &&
            selfOrAll_And_OneMandate
          ) {
            this.openVerifyBioDialog(result);
          } else if (
            (searchType === 'CIF' || searchType === 'Account Number' ||
             searchType === 'Phone Number' || searchType === 'Mobile Number') &&
            !selfOrAll_And_OneMandate &&
            !isRetail
          ) {
            this.openSignatoriesDialog(result);
          } else if (
            (searchType === 'CIF' || searchType === 'Account Number' ||
             searchType === 'Phone Number' || searchType === 'Mobile Number') &&
            selfOrAll_And_OneMandate &&
            !isRetail
          ) {
            this.openSignatoriesDialog(result);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected openLaunchCustomerDialog(): void {
    this.getSignatories(this.selectedRow.accountNumber, this.customerData[0].bankID);
  }

  private openSignatoriesDialog(data: string): void {
    const user = { ...this.customerData[0], accounts: [this.selectedRow] };

    const dialogRef = this.dialog.open(VerifySignatoryDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        searchFlow: true,
        accepted: this.fingerprintAccepted,
        user,
        inProcess: false,
        flow: 'customerSearch',
        hideSkipBio: true,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (data === 'canVerify' && result?.data && result.status === data) {
        this.openVerifySignatoryBioDialog(result.data);
      }
      if (data === 'canNotVerify' && result?.status === data) {
        this.openSkipBioDialog();
      }
      if (data === 'knownCannotVerify' && result?.status === data) {
        this.openSkipBioDialog(data);
      }
    });
  }

  private openVerifySignatoryBioDialog(signatories: any): void {
    const user = { ...this.customerData[0], accounts: [this.selectedRow] };

    const dialogRef = this.dialog.open(VerifySignatoryBioDialogComponent, {
      data: {
        accepted: this.fingerprintAccepted,
        user,
        hideSkipBio: true,
        signatories,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.onSelectAccount(this.selectedRow);
    });
  }

  private openSkipBioDialog(event?: string): void {
    const user = { ...this.customerData[0], accounts: [this.selectedRow] };

    const dialogRef = this.dialog.open(VerifySkipBioComponent, {
      data: {
        user: event ? user : '',
        headerText: event ? 'Known agent verification' : 'Skip Biometric',
        subHeaderText: event
          ? 'Requirements for known agent verification'
          : 'Requirements for bio-override',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.onSelectAccount(this.selectedRow);
    });
  }

  protected openVerifyBioDialog(event?: any): void {
    const user = { ...this.customerData[0], accounts: [this.selectedRow] };

    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '50%',
      data: {
        searchFlow: true,
        accepted: this.fingerprintAccepted,
        user,
        accountsSelected: this.selectedRow,
        mandates: this.mandatesArray,
        doNotRedirectOnSuccess: false,
        flow: 'customerSearch',
        hideSkipBio: true,
        dormantAccounts:
          this.submissionAccountsArray.length > 0 ? this.submissionAccountsArray : [],
      },
      disableClose: true,
    });

    dialogRef.componentInstance.verifyBioData.subscribe((fingerprint: any) => {
      if (fingerprint === 'Closed') {
        return;
      }
      const bioObj = {
        cif: user.cif,
        fingerprints: [fingerprint],
        CheckerOauth: {},
      };

      if (
        window.location.hostname === 'customer360-dev.equitybankgroup.com' ||
        window.location.hostname === 'branchservicehub-customer-360-dev.azurewebsites.net' ||
        window.location.hostname === 'localhost'
      ) {
        this.toastService.show('', 'COMMON.ACCOUNT-VERIFIED-SUCCESSFULLY', MessageBoxType.SUCCESS, 5000, undefined, undefined, true);
        localStorage.setItem('show-bio-captured', 'true');
        this.storeUser(true);

        if (this.dormantAccountsArray.length > 0) {
          this.activateDormantAccounts();
        } else {
          this.router.navigateByUrl('/customer360/services/customer-360');
        }
      } else {
        this.accountService.verifyAccount(bioObj).subscribe({
          next: (v: any) => {
            if (v.successful) {
              this.toastService.show('Success', v.statusMessage, MessageBoxType.SUCCESS, 50000, undefined, undefined, false);
              localStorage.setItem('show-bio-captured', 'true');
              dialogRef.afterClosed().subscribe(result => {
                if (result) {
                  this.fingerprintAccepted = result.data;
                  this.storeUser(true);
                  if (this.fingerprintAccepted) {
                    if (this.dormantAccountsArray.length > 0) {
                      this.activateDormantAccounts();
                    } else {
                      this.goToOverview();
                    }
                  }
                } else {
                  this.openLaunchCustomerDialog();
                }
              });
            } else {
              this.toastService.show('ERROR', v.statusMessage, MessageBoxType.DANGER, 50000, undefined, undefined, false);
            }
          },
          error: () => {},
        });
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.bioDialogClosed && result.data) {
        this.goToOverview();
        this.closeDialog();
      } else {
        this.closeDialog();
      }
    });
  }

  private goToOverview(): void {
    this.storeUser(true);
    this.router.navigateByUrl('/customer360/services/customer-360');
  }

  private activateDormantAccounts(): void {
    // Dormant account activation logic — placeholder
  }

  protected navigate(type: string): void {
    this.storeUser(false);

    switch (type) {
      case 'deposit':
        this.accountManagementService.setCustomer(this.customerData[0]);
        this.accountManagementService.setCustomerDetails(this.customerData[0]);
        this.accountManagementService.setCustomerSelectedAccountDetails(this.selectedRow);
        this.accountManagementService.setCustomerIsPresent(false);
        this.router.navigate(['/customer360/services/customer-360/cash-management/depositor-details']);
        break;
    }
  }

  private storeUser(customerPresent: boolean): void {
    const user = this.customerData[0];
    const objAcc = {
      cif: user.cif,
      bankID: user.bankID,
      idNumber: user.identifications?.[0]?.id,
      accountsId: this.selectedRow.accountNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      idType: user.identifications?.[0]?.type,
      isPresent: customerPresent,
    };
    localStorage.setItem('accMgntObj', JSON.stringify(objAcc));
  }
}

import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatRadioChange } from '@angular/material/radio';
import { SessionService } from '@app/shared/services';
import { Router } from '@angular/router';
import { AccountService } from '@app/core/services';
import { takeUntil, Subject, forkJoin, of } from 'rxjs';
import { ToastService, MessageBoxType } from '@app/shared/modules/toast';
import { environment as env } from '@env/environment';
import { SIGNATORY_OPTIONS } from '@app/shared/static';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-link-account',
  templateUrl: './link-account.component.html',
  styleUrls: ['./link-account.component.scss'],
  imports: [
    MatPaginatorModule,
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    RouterModule,
    TranslatePipe,
  ],
})
export class LinkAccountComponent implements AfterViewInit {
  unfilteredUnLinkedProfileAccounts = JSON.parse(
    <string>localStorage.getItem('unLinkedProfileAccounts')
  );
  unLinkedAccounts = this.unfilteredUnLinkedProfileAccounts?.filter(
    (x: any) => x.schemeType !== 'ODA' && x.schemeType !== 'LAA'
  );
  linkedCustomerDetails = JSON.parse(
    <string>localStorage.getItem('linkedCustomerDetails')
  );
  activeChannel: any = JSON.parse(
    <string>localStorage.getItem('activeChannel')
  );
  selectedAccounts: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatPaginator) selePaginator!: MatPaginator;
  displayedColumns: string[] = [
    'select',
    'accountName',
    'accountNumber',
    'accountType',
    'mandate',
    'role',
  ];
  seleColumns: string[] = ['account', 'view', 'viewandtransact'];
  view = '1';
  viewandtransact = '0';
  optionChangeEvent!: MatRadioChange;
  dataSource = new MatTableDataSource<any>(this.unLinkedAccounts);
  selectedSource = new MatTableDataSource<any>(this.selectedAccounts);
  selection = new SelectionModel<any>(true, []);
  stepCount = 1;
  accountMandates: any[] = [];
  destroy$: Subject<any> = new Subject<any>();
  isBusiness: any = JSON.parse(<string>localStorage.getItem('isBusiness'));
  signatoryOptions = SIGNATORY_OPTIONS;

  constructor(
    public session: SessionService,
    private router: Router,
    private accountService: AccountService,
    private toast: ToastService
  ) {}
  ngAfterViewInit() {
    this.setMandates();
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    }, 0);
  }
  getValue(type: string, account: any) {
    return `${type}-${account}`;
  }
  getRole(element: any) {
    let role = '-';
    if (element.mandate === 'SELF' && !element.isBusiness)
      role = 'Main signatory';
    else if (element.mandate && !element.isBusiness)
      role = 'Related/Joint signatory';
    else if (this.isBusiness) role = 'Known Agent';
    return role;
  }
  getMandate(mandate: any) {
    const found = this.signatoryOptions?.find(
      (el: any) => el.code.toLowerCase() === mandate.toLowerCase()
    );
    return found?.title ?? '-';
  }
  setMandates() {
    const newArr = this.unLinkedAccounts?.map((acc: any) => {
      const sigData: any = {
        AccountId: acc.accountNumber,
        BankId: this.linkedCustomerDetails.bankID,
      };
      const payload = {
        bankId: this.linkedCustomerDetails.bankID,
        customerId: this.linkedCustomerDetails.cif,
      };
      let mandates: any[] = [];
      forkJoin([
        this.accountService.getAccountSignatories(sigData),
        this.accountService.cifInquiryV2(this.isBusiness, payload),
      ]).subscribe(([mandatesRes, isEntityRes]) => {
        // Personal accounts will have 1 mandate
        if (mandatesRes?.responseObject?.mandates?.length === 1) {
          const x = mandatesRes.responseObject.mandates[0];
          mandates = [
            {
              name: x.signatoryName,
              cif: x.cif,
              deleted: x.isDeleted,
              signatoryType: x.signatoryType,
              current: false,
            },
          ];
        } else {
          // Just in case account mandate has changed
          // Differentiate between joint and Entity Accounts
          if (this.isBusiness) {
            mandates = mandatesRes.responseObject.mandates
              .filter(
                // De-activated and M (Main) should not be included for coop & group
                (m: any) => !m.isDeleted && m.signatoryType !== 'M'
              )
              .map((x: any) => {
                const obj = {
                  name: x.signatoryName,
                  cif: x.cif,
                  deleted: x.isDeleted,
                  signatoryType: x.signatoryType,
                  current: false,
                };
                return obj;
              });
          } else {
            mandates = mandatesRes.responseObject.mandates
              .filter((m: any) => !m.isDeleted)
              .map((x: any) => {
                const obj = {
                  name: x.signatoryName,
                  cif: x.cif,
                  deleted: x.isDeleted,
                  signatoryType: x.signatoryType,
                  current: false,
                };
                return obj;
              });
          }
        }
        acc['isBusiness'] = this.isBusiness;
        acc['mandates'] = mandates;
        if (isEntityRes.responseObject) {
          acc['accountType'] = this.isBusiness ? 'Entity' : 'Individual';
        } else if (!isEntityRes.responseObject && this.isBusiness) {
          acc['accountType'] = 'Joint';
        }
      });
      return acc;
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  logSelection() {
    this.selectedAccounts = this.selection.selected;
    this.selectedSource = new MatTableDataSource<any>(this.selectedAccounts);
    setTimeout(() => {
      this.selectedSource.paginator = this.selePaginator;
    }, 0);
    this.stepCount = 2;
  }

  radioChange(event: MatRadioChange) {
    const val = event.value.split('-')[1];
    const found = this.accountMandates.find((el: any) => el.includes(val));
    if (found !== -1)
      this.accountMandates = this.accountMandates.filter(
        (el: any) => !el.includes(val)
      );
    this.accountMandates.push(event.value);
  }

  canDisplayAddAnotherAccountButton = (): boolean =>
    this.session.hasFeatureRole('AccountOpening');

  onboardMinorAccount(): void {
    const data = JSON.parse(<string>localStorage.getItem('accMgntObj'));
    if (data?.cif) {
      const params = new URLSearchParams();
      const context = btoa(
        JSON.stringify({
          cif: { PersonalDetails: { CustomerId: data?.cif } },
          _parent: {
            id: null,
            name: 'Customer 360: Profile',
            title: null,
            returnUrl: `${window.location.href}`,
          },
        })
      );
      this.session.routeToUrl(
        `${
          env.customerOnboardingUrl
        }/services/onboarding/ke/individual/minor/?${params.toString()}`
      );
    }
  }
  quit() {
    this.router.navigateByUrl('/services/customer-360/channels');
  }

    submit() {
        const body = {
            customerId: this.linkedCustomerDetails?.cif ?? "",
            phoneNumber: this.linkedCustomerDetails?.phoneNumber ?? "",
            customerName: this.linkedCustomerDetails?.name ?? "",
            requestedBy: this.session.user?.username,
            comment: this.session.user?.username,
            accounts: this.accountMandates?.map((acc: any) => {
                const obj = {
                    accountNumber: acc.split("-")[1],
                    accountAuthorization: acc.split("-")[0],
                };
                return obj;
            }),
        };
        this.accountService
            .linkAccount(body)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
                if (res?.successful)
                    this.router
                        .navigateByUrl("/services/customer-360/channels")
                        .then((r: any) =>
                            this.toast.show(
                                "",
                                "Accounts linked",
                                MessageBoxType.SUCCESS,
                                5000, undefined, undefined, false
                            ),
                        );
                else
                    this.toast.show(
                        "",
                        "Accounts not linked",
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
            });
    }
}

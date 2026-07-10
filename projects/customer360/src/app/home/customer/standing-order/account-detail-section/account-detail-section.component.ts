import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ChequeRequestService } from 'src/app/core/services/cheque-book-request/cheque-request.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContextManager } from '@app/shared/modules/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-detail-section',
  templateUrl: './account-detail-section.component.html',
  styleUrls: ['./account-detail-section.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    TranslatePipe,
  ],
})
export class AccountDetailSectionComponent implements OnInit {
  @Input() mandates: string[] | null = null;
  @Input() canActivateAccount = true;
  combinedAccounts: any[] = [];
  forms!: UntypedFormGroup;
  odaAccountSchemeType = 'ODA';
  loanAcctSchemetype = 'LAA';
  filteredAccounts: any[] = [];
  private isInitialLoad = true;

  accounts: {
    accountNumber: string;
    accountCurrency: string;
    accountStatus: string;
    accountType: string;
    accountName: string;
    cif: string;
    availableBalance: string;
  }[] = [];

  selectedAccount: {
    accountNumber: string;
    accountCurrency: string;
    accountStatus: string;
    accountType: string;
    accountName: string;
    cif: string;
    availableBalance: string;
  } = {
    accountNumber: '',
    accountCurrency: '',
    accountStatus: '',
    accountType: '',
    accountName: '',
    cif: '',
    availableBalance: '',
  };

  accoutStatusTextMap: { [key: string]: string } = {
    D: 'Dormant',
    A: 'Active',
  };

  @Output() isActiveStatus = new EventEmitter<boolean>();
  @Output() selectedAccountChange = new EventEmitter<any>();

  constructor(
    private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    public chequeRequestService: ChequeRequestService,
    private ctxManager: ContextManager,
    private router: Router,
  ) {
    this.forms = new UntypedFormGroup({
      account: new UntypedFormControl(),
      accountName: new UntypedFormControl(),
      accountType: new UntypedFormControl(),
      accountStatus: new UntypedFormControl(),
      availableBalance: new UntypedFormControl(),
    });

    const accounts = JSON.parse(<string>localStorage.getItem('accounts'));
    const relAccounts = JSON.parse(
      <string>localStorage.getItem('relatedAccounts')
    );
    this.combinedAccounts = [...accounts, ...relAccounts];
  }

  ngOnInit(): void {
    if (this.mandates) {
      this.combinedAccounts = this.combinedAccounts.filter(x =>
        this.mandates?.includes(x.mandate)
      );
    }

    if (this.combinedAccounts) {
      this.forms = this.formBuilder.group({
        account: ['', [Validators.required]],
        accountName: [''],
        accountType: [''],
        accountStatus: [''],
        availableBalance: [''],
      });

      this.filteredAccounts = this.combinedAccounts
        .filter(
          x =>
            x.schemeType !== this.loanAcctSchemetype &&
            x.schemeType !== this.odaAccountSchemeType
        )
        .map(
          ({
            accountNumber = '',
            accountCurrency = '',
            accountStatus = '',
            schemeType = '',
            accountName = '',
            cif = '',
            availableBalance = '',
          }) => ({
            accountNumber,
            accountCurrency,
            accountStatus,
            accountType: schemeType,
            accountName,
            cif,
            availableBalance,
          })
        );
      const currentUrl = this.router.url;
      if (this.isInitialLoad && currentUrl.includes('/services/cheque-requests')) {
        const savedContextData = this.ctxManager.contextData;
        const savedAccount = savedContextData?.['chequebook_request']?.selectedAccount;
      
        if (savedAccount) {
          const matchingAccount = this.filteredAccounts.find(
            account => account.accountNumber === savedAccount.accountNumber
          );
      
          if (matchingAccount) {
            this.forms.get('account')?.setValue(matchingAccount);
            this.forms.patchValue({
              account: matchingAccount,
              accountName: matchingAccount.accountName,
              accountType: matchingAccount.accountType,
              accountStatus: matchingAccount.accountStatus,
              availableBalance: matchingAccount.availableBalance,
            });
            this.selectedAccount = matchingAccount;
            this.isActiveStatus.emit(this.selectedAccount.accountStatus === 'A');
            this.selectedAccountChange.emit(this.selectedAccount);
          }
        }
      
        this.isInitialLoad = false;
      }
      
    }
  }

  activateAccount(): void {}

  onSelectionChange(selected: any) {
    this.ctxManager.context = 'chequebook_request';
    this.ctxManager.patchCurrentContextData({
      selectedAccount: selected,
    });
    this.selectedAccount = selected;
    this.isActiveStatus.emit(this.selectedAccount.accountStatus === 'A');
    this.selectedAccountChange.emit(this.selectedAccount);
  }

  openAdditionalDetails() {
    // TODO: Import AccountDetailsComponent when accounts module is migrated
    // const account = this.combinedAccounts.filter(
    //   account => account.accountNumber == this.selectedAccount.accountNumber
    // );
    // const filteredAccount = account[0];
    // const dialogRef = this.dialog.open(AccountDetailsComponent, {
    //   data: filteredAccount,
    //   panelClass: 'account-detail-panel-class',
    // });
    // dialogRef.afterClosed().subscribe(result => {});
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { take } from 'rxjs/operators';
import { ChequeRequestService } from 'src/app/core/services/cheque-book-request/cheque-request.service';
import { AccountDetailsComponent } from 'src/app/home/customer/accounts/account-details/account-details.component';
import { MatDialog } from '@angular/material/dialog';
import { ContextManager } from '@app/shared/modules/stepper';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';

@Component({
  selector: 'app-account-detail-section',
  templateUrl: './account-detail-section.component.html',
  styleUrls: ['./account-detail-section.component.scss'],
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
    schemeCode?: string;
  }[] = [];

  selectedAccount: {
    accountNumber: string;
    accountCurrency: string;
    accountStatus: string;
    accountType: string;
    accountName: string;
    cif: string;
    availableBalance: string;
    schemeCode?: string;
  } = {
    accountNumber: '',
    accountCurrency: '',
    accountStatus: '',
    accountType: '',
    accountName: '',
    cif: '',
    availableBalance: '',
    schemeCode: '',
  };

  accoutStatusTextMap: { [key: string]: string } = {
    D: 'Dormant',
    A: 'Active',
  };

  @Output() isActiveStatus = new EventEmitter<boolean>();
  @Output() selectedAccountChange = new EventEmitter<any>();
  @Output() schemeCodeEligibilityChange = new EventEmitter<boolean>();

  private unsupportedSchemeCodeMessage = '';

  constructor(
    private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    public chequeRequestService: ChequeRequestService,
    private toastService: ToastService,
    private ctxManager: ContextManager,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.unsupportedSchemeCodeMessage = this.translateService.instant(
      'CUSTOMER.ACCOUNT-SERVICES.CHEQUE-REQUEST.UNSUPPORTED-SCHEME-MESSAGE'
    );
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

      // filter out loan accounts
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
            schemeCode = '',
          }) => ({
            accountNumber,
            accountCurrency,
            accountStatus,
            accountType: schemeType,
            accountName,
            cif,
            availableBalance,
            schemeCode,
          })
        );
      // Check if we're on the cheque-requests route and have a saved account
      const currentUrl = this.router.url;
      if (
        this.isInitialLoad &&
        currentUrl.includes('/services/cheque-requests')
      ) {
        const savedContextData = this.ctxManager.contextData;
        const savedAccount =
          savedContextData?.chequebook_request?.selectedAccount;

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
            this.isActiveStatus.emit(
              this.selectedAccount.accountStatus === 'A'
            );
            this.selectedAccountChange.emit(this.selectedAccount);
            this.validateChequeSchemeCode(matchingAccount);
          } else if (this.isChequeRequestsRoute()) {
            this.publishSchemeCodeEligibility({
              schemeCode: savedAccount?.schemeCode,
              supported: false,
              message: this.unsupportedSchemeCodeMessage,
            });
          }
        }

        // Prevent future auto-patching
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
    this.validateChequeSchemeCode(selected);
  }

  private isChequeRequestsRoute(): boolean {
    return this.router.url.includes('/services/cheque-requests');
  }

  openAdditionalDetails() {
    const account = this.combinedAccounts.filter(
      account => account.accountNumber == this.selectedAccount.accountNumber
    );
    const filteredAccount = account[0];
    const dialogRef = this.dialog.open(AccountDetailsComponent, {
      data: filteredAccount,
      panelClass: 'account-detail-panel-class',
    });
    dialogRef.afterClosed().subscribe(result => {});
  }

  private validateChequeSchemeCode(selected: any): void {
    if (!selected || !this.isChequeRequestsRoute()) {
      return;
    }

    const schemeCode = this.resolveSchemeCode(selected);

    if (!schemeCode) {
      this.publishSchemeCodeEligibility({
        schemeCode: undefined,
        supported: false,
        message: this.unsupportedSchemeCodeMessage,
      });
      return;
    }

    this.chequeRequestService
      .lookupSchemeCodeMessage(schemeCode)
      .pipe(take(1))
      .subscribe({
        next: response => {
          const isSuccessful = response?.successful;
          const extractedMessage = this.extractSchemeCodeMessage(response);
          const fallbackMessage =
            response?.statusMessage || 'Unable to validate cheque scheme code';
          const isSupported = this.isSchemeCodeSupported(response);
          const successMessage =
            extractedMessage || (isSupported ? response?.statusMessage : null);
          const unsupportedMessage =
            extractedMessage || this.unsupportedSchemeCodeMessage;

          if (!isSuccessful) {
            this.publishSchemeCodeEligibility({
              schemeCode,
              supported: false,
              message: fallbackMessage,
            });
            this.toastService.show(
              null,
              extractedMessage || fallbackMessage,
              MessageBoxType.DANGER,
              5000,
              undefined,
              undefined,
              false
            );
            return;
          }

          this.publishSchemeCodeEligibility({
            schemeCode,
            supported: isSupported,
            message: isSupported ? successMessage : unsupportedMessage,
          });

          if (!isSupported) {
            this.toastService.show(
              null,
              unsupportedMessage,
              MessageBoxType.DANGER,
              5000,
              undefined,
              undefined,
              false
            );
            return;
          }

          if (successMessage) {
            this.toastService.show(
              null,
              successMessage,
              MessageBoxType.INFO,
              5000,
              undefined,
              undefined,
              false
            );
          }
        },
        error: () => {
          this.toastService.show(
            null,
            'Unable to validate cheque scheme code',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        },
      });
  }

  private isSchemeCodeSupported(response: any): boolean {
    const responseObject = response?.responseObject;

    if (!responseObject) {
      return false;
    }

    if (Array.isArray(responseObject)) {
      return responseObject.length > 0;
    }

    if (typeof responseObject === 'object') {
      return Object.values(responseObject).some(value => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }

        if (value && typeof value === 'object') {
          return Object.keys(value as Record<string, unknown>).length > 0;
        }

        return !!value;
      });
    }

    return false;
  }

  private resolveSchemeCode(account: any): string | undefined {
    if (account?.schemeCode) {
      return account.schemeCode;
    }

    const accountNumber = account?.accountNumber;

    if (!accountNumber) {
      return undefined;
    }

    try {
      const customerDetailsRaw = localStorage.getItem('customerDetails');
      const customerDetails = customerDetailsRaw
        ? JSON.parse(customerDetailsRaw)
        : {};

      const matchingAccount = customerDetails?.accounts?.find(
        (acct: any) => acct.accountNumber === accountNumber
      );

      return matchingAccount?.schemeCode;
    } catch {
      return undefined;
    }
  }

  private extractSchemeCodeMessage(response: any): string | null {
    const responseObject = response?.responseObject;

    if (!responseObject) {
      return null;
    }

    if (Array.isArray(responseObject) && responseObject.length) {
      return this.resolveLookupEntryMessage(responseObject[0]);
    }

    if (typeof responseObject === 'object') {
      for (const key of Object.keys(responseObject)) {
        const value = (responseObject as Record<string, unknown>)[key];

        if (Array.isArray(value) && value.length) {
          const message = this.resolveLookupEntryMessage(value[0]);
          if (message) {
            return message;
          }
        } else if (typeof value === 'string') {
          return value;
        }
      }
    }

    return null;
  }

  private resolveLookupEntryMessage(entry: any): string | null {
    if (!entry) {
      return null;
    }

    if (typeof entry === 'string') {
      return entry;
    }

    if (typeof entry === 'object') {
      return (
        entry.message ??
        entry.Message ??
        entry.value ??
        entry.Value ??
        entry.description ??
        entry.Description ??
        null
      );
    }

    return null;
  }

  private publishSchemeCodeEligibility(result: {
    schemeCode?: string;
    supported: boolean;
    message?: string | null;
  }): void {
    this.schemeCodeEligibilityChange.emit(result.supported);
    this.ctxManager.context = 'chequebook_request';
    this.ctxManager.patchCurrentContextData({
      schemeCodeLookup: {
        schemeCode: result.schemeCode ?? null,
        supported: result.supported,
        message: result.message ?? null,
      },
    });
  }
}

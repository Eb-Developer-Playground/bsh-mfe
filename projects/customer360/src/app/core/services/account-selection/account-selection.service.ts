import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SelectedAccountInfo {
  accountNumber: string;
  cif: string;
  accountType?: string;
  schemeType?: string;
  branchId?: string;
  customerId?: string;
  idType?: string;
  idNumber?: string;
  bankId?: string;
  accountName?: string;
  accountStatus?: string;
  schemeCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountSelectionService {
  private selectedAccountSubject = new BehaviorSubject<SelectedAccountInfo | null>(null);
  public selectedAccount$ = this.selectedAccountSubject.asObservable();

  constructor() {
    this.selectedAccountSubject.next(this.getSelectedAccountWithFallbacks());
  }
/** * Set the selected account and persist it in localStorage
 * This method updates the current selected account in the service
 * and saves relevant details in localStorage for session persistence.
 */
  setSelectedAccount(account: SelectedAccountInfo): void {
    this.selectedAccountSubject.next(account);
    
    localStorage.setItem('currentSelectedAccount', JSON.stringify(account));
    localStorage.setItem('accMgntObj', JSON.stringify({
      accountsId: account.accountNumber,
      cif: account.cif,
      accountType: account.accountType,
      branchId: account.branchId,
      customerId: account.customerId,
      idType: account.idType,
      idNumber: account.idNumber,
      bankID: account.bankId,
      isPresent: true
    }));
    localStorage.setItem('selectedAccount', JSON.stringify({
      accountNumber: account.accountNumber,
      cif: account.cif,
      accountType: account.accountType,
      schemeType: account.schemeType
    }));

  }

  getSelectedAccount(): SelectedAccountInfo | null {
    return this.selectedAccountSubject.value;
  }

  getSelectedAccountWithFallbacks(): SelectedAccountInfo | null {
    const current = this.selectedAccountSubject.value;
    if (this.isValidAccount(current)) return current;

    const sources = [
      () => this.parseStorage('currentSelectedAccount'),
      () => this.parseAccMgntObj(),
      () => this.parseStorage('selectedAccount')
    ];

    for (const source of sources) {
      const account = source();
      if (this.isValidAccount(account)) {
        this.selectedAccountSubject.next(account);
        return account;
      }
    }

    return null;
  }

  requireSelectedAccount(): SelectedAccountInfo {
    const account = this.getSelectedAccountWithFallbacks();
    if (!this.isValidAccount(account)) {
      throw new Error('COMMON.NO_ACCOUNT_SELECTED');
    }
    return account!;
  }
/** * Clear selected account from service and localStorage
 * Use when user logs out or switches customers
 */
  clearSelectedAccount(): void {
    this.selectedAccountSubject.next(null);
    localStorage.removeItem('currentSelectedAccount');
  }

  /**
   * Comprehensive cleanup for session end - removes ALL account-related data
   * Should be called during logout to prevent data persistence across sessions
   */
  clearAllAccountData(): void {
    this.selectedAccountSubject.next(null);
    
    // Remove all account-related localStorage items
    const accountKeys = [
      'currentSelectedAccount',
      'selectedAccount', 
      'accMgntObj',
      'customerDetails',
      'customerCifData',
      'knownAgentDetails',
      'context',
      'ticketId'
    ];
    
    accountKeys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Clear account selection when switching customers
   * Keeps customer data but clears account-specific selections
   * Use when user navigates to a new customer who may not have accounts
   */
  clearAccountSelectionForCustomerSwitch(): void {
    this.selectedAccountSubject.next(null);
    
    // Clear account selection but keep customer data
    const accountSelectionKeys = [
      'currentSelectedAccount',
      'selectedAccount', 
      'accMgntObj'
    ];
    
    accountSelectionKeys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Clear signatory-related cache when switching accounts
   * This method should be called when switching between different accounts
   * to prevent stale signatory data from being displayed
   */
  clearSignatoryCache(): void {
    const signatoryKeys = [
      'signatoryData',
      'mandates',
      'signatoryPhotos',
      'currentSignatory',
      'signatoryInformation',
      'mandate_signatory_data'
    ];
    
    signatoryKeys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Check if cached account data belongs to a different customer
   * Returns true if account data should be cleared
   */
  isAccountDataStale(currentCustomerCif: string): boolean {
    const selectedAccount = this.getSelectedAccountWithFallbacks();
    return selectedAccount !== null && selectedAccount.cif !== currentCustomerCif;
  }

  hasSelectedAccount(): boolean {
    return this.isValidAccount(this.getSelectedAccountWithFallbacks());
  }

  isAccountSelected(accountNumber: string): boolean {
    return this.getSelectedAccount()?.accountNumber === accountNumber;
  }

  private isValidAccount(account: SelectedAccountInfo | null): boolean {
    return !!(account?.accountNumber && account?.cif);
  }

  private parseStorage(key: string): SelectedAccountInfo | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return this.isValidAccount(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
/**
 * Parse the 'accMgntObj' item in localStorage.
 * This function specifically checks for 'accountsId' and 'cif'.
 */
  private parseAccMgntObj(): SelectedAccountInfo | null {
    try {
      const stored = localStorage.getItem('accMgntObj');
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      if (!parsed.accountsId || !parsed.cif) return null;
      
      return {
        accountNumber: parsed.accountsId,
        cif: parsed.cif,
        accountType: parsed.accountType,
        branchId: parsed.branchId,
        customerId: parsed.customerId,
        idType: parsed.idType,
        idNumber: parsed.idNumber,
        bankId: parsed.bankID
      };
    } catch {
      return null;
    }
  }
}
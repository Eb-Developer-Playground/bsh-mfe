import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RemoteAuthStateService } from 'equity-auth';

// Stub for @shared/services — Phase 2 will replace with real implementation
// At runtime the shell provides the real SessionService via Module Federation shared scope
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly remoteAuthState = inject(RemoteAuthStateService);

  get userCountryCode(): string {
    return BANK_ID_TO_COUNTRY_CODE[this.user.bankId] || 'KE';
  }

  get user(): {
    bankId: string;
    username: string;
    displayName: string;
    roles: string[];
    sub: string;
  } {
    const state = this.remoteAuthState.authState();

    return {
      bankId: state.user?.bankId || state.bankId || '',
      username: state.user?.username || '',
      displayName: state.user?.displayName || '',
      roles: state.user?.roles || [],
      sub: state.user?.sub || '',
    };
  }

  get token(): string {
    return this.remoteAuthState.accessToken || '';
  }

  get isLoggedIn(): boolean {
    return this.remoteAuthState.isAuthenticated();
  }
}

const BANK_ID_TO_COUNTRY_CODE: Record<string, string> = {
  '54': 'KE',
  '56': 'UG',
  '55': 'TZ',
  '11': 'SS',
  '50': 'RW',
  '43': 'CD',
};

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private http: HttpClient) {}
  getAccounts(): Observable<any> { return of([]); }
  cifInquiryV2(params: any, extra?: any): Observable<any> { return of([]); }
  getAccount(uriString: string): Observable<any> { return of({}); }
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}
  get(endpoint: string, options?: any): Observable<any> { return this.http.get(endpoint, options); }
  post(endpoint: string, data: any, options?: any): Observable<any> { return this.http.post(endpoint, data, options); }
  put(endpoint: string, data: any, options?: any): Observable<any> { return this.http.put(endpoint, data, options); }
  delete(endpoint: string, options?: any): Observable<any> { return this.http.delete(endpoint, options); }
}

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  ticket: any = {};
  contextData: any = {};

  constructor(private http: HttpClient) {}

  getDropdownData(params: any): Observable<any> { return of([]); }
  getDenominationsData(countryCode?: any, transactionType?: any): Observable<any> { return of([]); }
  getBeneficiaryBankCode2(params: any): Observable<any> { return of([]); }
  getDRCDropdownData(params: any): Observable<any> { return of([]); }
  getDRCIbanNumberByAccount(accountNumber: string, bankId: string): Observable<any> { return of({}); }
  getCharges(..._args: any[]): Observable<any> { return of({}); }
  getTicketDocsV2(data: any): Observable<any> { return of([]); }
  submitTicket(ticketId: any, formValue?: any, type?: string): Observable<any> { return of({}); }
  submitTicketToNewGen(payload: any): Observable<any> { return of({}); }
  getTicketDocs(data: any): Observable<any> { return of([]); }
  setActiveTicket(ticket: any): void { this.ticket = ticket; }
  cleanUpDocuments(payload?: any, ticketId?: string): Observable<any> { return of({}); }
  clearContextData(ticketId?: string): void { this.contextData = {}; }
  patchContextData(data: any): void { Object.assign(this.contextData, data); }
  updateRemitterAddress(ticketId: string, data: any): Observable<any> { return of({}); }
  getBeneficiaryBranchCode(bankId: string, bankCode: string): Observable<any> { return of([]); }
  getCreditName(creditAccountNumber: string, bankId: string): Observable<any> { return of({}); }
  updateRequiredTransactionDocs(docData: any, docInfo: any, docArray: any, docValidators: any): any[] { return []; }
  updateTicketData(ticketId: string, data: any): Observable<any> { return of({}); }
  uploadDocuments(files: any): Observable<any> { return of([]); }
  uploadDocumentsV3(payload: any): Observable<any> { return of([]); }
  getPurposeCode(countryCode: string, region?: string): Observable<any> { return of([]); }
  getLicenseCategoriesList(categoryValue: string): Observable<any> { return of([]); }
  getExchangeRates(params: any): Observable<any> { return of({}); }
  getSpecialExchangeRates(params: any): Observable<any> { return of({}); }
}

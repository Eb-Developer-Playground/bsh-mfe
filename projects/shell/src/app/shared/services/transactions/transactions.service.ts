import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, SessionService } from '@app/shared/services';
import { Transactions } from '../../models/transactions/transaction.model';

@Injectable()
export class TransactionsService {
  constructor(
    private apiService: ApiService,
    private sessionService: SessionService
  ) {}

  public getTransactions(values: any): Observable<Transactions.Response> {
    return this.apiService.post('/v1/account/statement', values);
  }

  public getTransactionHistory(
    values: any
  ): Observable<Transactions.TransactionHistoryResponse> {
    return this.apiService.post('/v1/adminportal/auditpagination', values);
  }

  public searchLocalBanks(value: string): Observable<any> {
    // const transactionsUrl_Old = `/v1/datalookup/bankV2?query=${value}&country=KE&skip=0&fetch=200`
    // const transactionsUrl_New = `/v1/backoffice/Lookup/banksList/${bankId}`
    const bankId = this.sessionService.userBank;
    const transactionsUrl = `/v1/backoffice/Lookup/banksList/${bankId}`;
    return this.apiService.get<any>(transactionsUrl, {
      headers: { skipLoadingInterceptor: 'true' },
    });
  }

  public searchTransactionValue(): Observable<any> {
    const transactionsUrl = `/v1/backoffice/lookup?names=transactionvalue`;
    return this.apiService.get<any>(transactionsUrl, {
      headers: { skipLoadingInterceptor: 'true' },
    });
  }

  public searchLocalCities(
    bankId: string = this.sessionService.userBank
  ): Observable<any> {
    const url = `/v1/StandingOrder/cities?bankId=${bankId}`;
    return this.apiService.get<any>(url, {
      headers: { skipLoadingInterceptor: 'true' },
    });
  }

  public searchBranchCode(
    cityCode: string,
    bankCode: string,
    bankId: string = this.sessionService.userBank
  ): Observable<any> {
    // const url_old = `/v1/StandingOrder/bank-branch-code?cityCode=${cityCode}&bankCode=${bankCode}&bankId=${bankId}`;
    // const url_new = `/v1/backoffice/lookup/branchCodeList/${bankId}/${bankCode}`;
    const url = `/v1/backoffice/lookup/branchCodeList/${bankId}/${bankCode}`;
    return this.apiService.get<any>(url, {
      headers: { skipLoadingInterceptor: 'true' },
    });
  }

  public searchBICs(query: string, countryCode?: string): Observable<any> {
    const transactionsUrl = `/v1/transactions/bics?search=${query}&country=${
      countryCode === 'SS' ? '' : countryCode
    }&onlyhqs=true&skip=0&fetch=200`;
    return this.apiService.get<any>(transactionsUrl, {
      headers: { skipLoadingInterceptor: 'true' },
    });
  }
}

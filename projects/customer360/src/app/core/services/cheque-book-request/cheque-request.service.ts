import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  BranchLookupResponse,
  ChequeBookMisc,
  ChequeBookMiscDetail,
} from '@app/shared/models/chequebook/chequebook-misc.model';
import { ApiService, SessionService } from '@app/shared/services';

@Injectable({
  providedIn: 'root',
})
export class ChequeRequestService {
  private api = inject(ApiService);
  private sessionService = inject(SessionService);

  public chequeSuccessData: any;
  chequebookMisc = 'chequebookMisc';
  bankId = this.sessionService.userBank;

  public setChequeSuccessData(data: any) {
    if (!data) {
      localStorage.removeItem('ChequeSuccessData');
      return;
    }
    this.chequeSuccessData = data;
    localStorage.setItem(
      'ChequeSuccessData',
      JSON.stringify(this.chequeSuccessData)
    );
  }

  public getChequeSuccessData(): any {
    return JSON.parse(<string>localStorage.getItem('ChequeSuccessData'));
  }
  public getChargeMethod(): any {
    return JSON.parse(<string>localStorage.getItem('ChequeChargeMethod'));
  }
  public getChargeRemark(): any {
    return JSON.parse(<string>localStorage.getItem('ChequeChargeRemark'));
  }
  public setChargeMethod(type: boolean) {
    localStorage.setItem('ChequeChargeRemark', JSON.stringify(''));
    localStorage.setItem('ChequeChargeMethod', JSON.stringify(type));
  }
  public setChargeRemark(remark: any) {
    localStorage.setItem('ChequeChargeRemark', JSON.stringify(remark));
  }
  public removeChequeSuccessData(): any {
    return localStorage.removeItem('ChequeSuccessData');
  }

  public createChequeBookRequest(payload: any): Observable<any> {
    return this.api.post<any>(
      '/v1/backoffice/chequebookticket/create',
      payload
    );
  }

  public getPendingIssuanceCheques(bankId: string, accountNumber: string): Observable<any> {
    const url = `/v2/backoffice/chequebook/account/pending-issuance?BankId=${bankId}&AccountNumber=${accountNumber}`;
    return this.api.get<any>(url).pipe(
      map((response: any) => response.responseObject),
      catchError((error: HttpErrorResponse) =>
        of({
          statusCode: error.status,
          statusMessage: error.message,
          successful: false,
          responseObject: null,
        })
      )
    );
  }
  public getIssuedCheques(bankId: string, accountNumber: string): Observable<any> {
    const url = `/v2/backoffice/chequebook/get-cheques?BankId=${bankId}&AccountNumber=${accountNumber}`;
    return this.api.get<any>(url).pipe(
      map((response: any) => response.responseObject),
      catchError((error: HttpErrorResponse) =>
        of({
          statusCode: error.status,
          statusMessage: error.message,
          successful: false,
          responseObject: null,
        })
      )
    );
  }

  public submitChequeBookRequestToFinacleV2(
    runningTaskId: string,
    runningActionFlow: string
  ): Observable<any> {
    const url = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/SubmitChequeBookRequestToFinacleV2/invoke`;
    return this.api.post<any>(url, {});
  }

  public createBankersChequeRequest(payload: any): Observable<any> {
    return this.api.post<any>(
      '/v1/backoffice/bankerschequebookticket/create',
      payload
    );
  }

  public createForeignDraftRequest(payload: any): Observable<any> {
    return this.api.post<any>('/v1/backoffice/foreigndraft/create', payload);
  }
  // private checkBookRequest$: BehaviorSubject<any> = new BehaviorSubject([]);

  // public getChequeBookRequestObs() {
  //     return this.checkBookRequest$.asObservable();
  // }

  // public updateChequeBookRequest(data: any[]) {
  //     return this.checkBookRequest$.next(data);
  // }

  public fetchAllChequeBookRequest(acctNumber: string) {
    // return this.api.get(`/v2/tickets/paged?page=${pageIndex}&take=${pageSize}`).pipe(
    return this.api
      .post(`/chequebook/api/report/requests`, {
        searchQuery: '',
        accountNumber: acctNumber,
      })
      .pipe(
        map((res: any) => {
          return res.responseObject;
        })
      );
  }

  public bioVerifyBankerChequeRequest(
    cif: string,
    ticketId: string,
    fingerPrints: any[]
  ): Observable<any> {
    const payload = {
      cif: cif,
      fingerprints: [fingerPrints],
    };

    return this.api.post<any>(
      `/v1/backoffice/BankersChequeBookTicket/${ticketId}/verify-bio`,
      payload
    );
  }

  public bioVerifyForeignDraftRequest(
    cif: string,
    ticketId: string,
    fingerPrints: any[]
  ): Observable<any> {
    const payload = {
      cif: cif,
      fingerprints: [fingerPrints],
    };

    return this.api.post<any>(
      `/v1/backoffice/foreigndraft/${ticketId}/verify-bio`,
      payload
    );
  }
  public bioVerifyNewChequeRequest(
    cif: string,
    ticketId: string,
    fingerPrints: any[]
  ): Observable<any> {
    const payload = {
      cif: cif,
      fingerprints: [fingerPrints],
    };

    return this.api.post<any>(
      `/v1/backoffice/chequebookticket/${ticketId}/verify-bio`,
      payload
    );
  }

  public bioVerifyBankersChequeRequest(
    cif: string,
    ticketId: string,
    fingerPrints: any[]
  ): Observable<any> {
    const payload = {
      cif: cif,
      fingerprints: [fingerPrints],
    };

    return this.api.post<any>(
      `/v1/backoffice/bankerschequebookticket/${ticketId}/verify-bio`,
      payload
    );
  }

  public stopChequeRequest(
    chequeId: string,
    date: any,
    chequeType: string
  ): Observable<any> {
    let url, payload;
    if (chequeType === 'Cheque Book') {
      url = `/chequebook/api/chequebooks/stop`;
      payload = { dateStopped: date, chequeRequestIDs: [chequeId] };
    } else {
      url = `/chequebook/api/bankers-cheque/stop`;
      payload = { bankersChequeId: chequeId, date: date };
    }
    return this.api.post<any>(url, payload);
  }

  public updateChequeStatus(
    payload: any,
    isPhysicalCheque: boolean
  ): Observable<any> {
    let url;
    if (isPhysicalCheque) {
      url = `/chequebook/api/chequebooks/update/${payload.id}`;
      return this.api.post<any>(url, payload);
    } else {
      url = `/chequebook/api/bankercheque/${payload.status}`;
      return this.api.post<any>(url, { Id: payload.id });
    }
  }

  // public getBankersCharge(payload: any): Observable<any> {
  //     return this.api.post<any>(
  //         `/chequebook/api/bankercheque/charge`,
  //         payload
  //     );
  // }
  public getCurrency(): Observable<any> {
    return this.api.get<any>(`/chequebook/api/chequebooks/currency`);
  }
  // public getChequeBookCharge(payload: any): Observable<any> {
  //     return this.api.post<any>(
  //         `/chequebook/api/chequebooks/chequebookcharge`,
  //         payload
  //     );
  // }

  public validateChequeBookRequest(payload: {
    accountNumber: string;
    applicationBranchId: string;
    collectionBranchId: string;
    bankId: string;
    bookletSize: string;
  }): Observable<any> {
    return this.api.post<any>(
      `/chequebook/api/chequebooks/validatechequebookrequest`,
      payload
    );
  }

  public validateAccountBalance(payload: {
    accountNum: string;
    amount: Number;
    bankId: string;
    currencyCode: string;
  }): Observable<any> {
    return this.api.post<any>(
      `/chequebook/api/chequebooks/validateaccountbalance`,
      payload
    );
  }

  public fetchMisc(): Observable<any> {
    return this.fetchFormField().pipe(
      switchMap((x: ChequeBookMisc) => {
        localStorage.setItem(
          this.chequebookMisc,
          JSON.stringify(x.responseObject)
        );

        return of(x.responseObject);
      })
    );
  }

  public get chequeMisc() {
    return JSON.parse(<string>localStorage.getItem(this.chequebookMisc));
  }
  public get NumberOfLeaves() {
    return (
      JSON.parse(
        <string>localStorage.getItem(this.chequebookMisc)
      ) as ChequeBookMiscDetail
    )?.numberOfLeaves;
  }
  public get branches() {
    const branches = JSON.parse(
      <string>localStorage.getItem(this.chequebookMisc)
    ) as any;
    return branches?.branches;
  }
  public fetchBranch(): Observable<any> {
    return this.api.get<any>(`/v1/backoffice/misc/branches`).pipe(
      map((response: any) => response.responseObject)
    );
  }

  public fetchBranchesV2(bankId: string): Observable<any> {
    const url = `/v1/backoffice/misc/branches?bankId=${bankId}`;
    return this.api.get<any>(url).pipe(
      map((response: any) => response.responseObject),
      catchError((error: HttpErrorResponse) =>
        of({
          statusCode: error.status,
          statusMessage: error.message,
          successful: false,
          responseObject: null,
        })
      )
    );
  }

  public verifyBio(
    runningTaskId: string,
    runningActionFlow: string,
  ): Observable<any> {
    const url = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/verifyBio`;
    return this.api.post<any>(url, {});
  }

  public fetchFormField(): Observable<ChequeBookMisc | any> {
    const httpOptions = {
      headers: { skipToast: 'true', skipLoadingInterceptor: 'true' },
    };

    return this.api
      .get(`/chequebook/api/chequebooks/formfields/${this.bankId}`, httpOptions)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          of({
            statusCode: error.status,
            statusMessage: error.message,
            successful: false,
            responseObject: null,
          })
        )
      );
  }

  public customerAbsentChequeRequest(ticketId: number): Observable<any> {
    return this.api.post<any>(
      `/v1/backoffice/chequebookticket/${ticketId}/submit-ticket`,
      {}
    );
  }
  public uploadTransactionDocuments(data: any): Observable<any> {
    if (
      window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
      window.location.hostname ===
        'servicehub-customer-360-uat.equitygroupholdings.com'
    ) {
      return this.api.post<any>(`/v2/documents/submit`, data);
    }
    return this.api.post<any>(`/v2/documents/submit`, data);
  }
  public getAccountDetails(
    accountNumber: string,
    bankId: any
  ): Observable<any> {
    return this.api.get<any>(
      `/v1/account/details/${accountNumber}?bankId=${bankId}`
    );
  }

  get customer(): any {
    return JSON.parse(<string>localStorage.getItem('accMgntObj'));
  }

  get isCustomerPresent(): boolean {
    return this.customer?.isPresent;
  }

  public getChequebookDetails(id: string) {
    return this.api.post<any>(`/chequebook/api/chequebooks/checkstatus`, {
      chequeRequestID: id,
    });
  }

  public getChequeCharges(
    bankId: string,
    accountNumber: string,
    numberOfChequeBooks: number,
    numberOfChequeLeaves: number
  ): Observable<any> {
    const url = `/v2/backoffice/chequebook/order/charges-with-balance-check?BankId=${bankId}&AccountNumber=${accountNumber}&NumberOfChequeBooks=${numberOfChequeBooks}&NumberOfChequeLeaves=${numberOfChequeLeaves}`;
    return this.api.get<any>(url);
  }
  public getChequeDetails(id: string) {
    return this.api.get<any>(`/chequebook/api/bankercheque/record/${id}`);
  }
  public skipBioNewChequeRequest(ticketId: number) {
    return this.api.post<any>(
      `/v1/backoffice/chequebookticket/${ticketId}/skipbio`,
      {}
    );
  }
  public skipBioBankersChequeRequest(ticketId: number) {
    return this.api.post<any>(
      `/v1/backoffice/BankersChequeBookTicket/${ticketId}/skipbio`,
      {}
    );
  }
  public submitBankerDocuments(id: any, data: any): Observable<any> {
    return this.api.post<any>(
      `/v1/backoffice/BankersChequeBookTicket/${id}/submit-documents`,
      data
    );
  }
  public printStarted(id: any): Observable<any> {
    return this.api.post<any>(`/chequebook/api/bankercheque/printstarted`, {
      Id: id,
    });
  }
  public printCompleted(id: any): Observable<any> {
    return this.api.post<any>(`/chequebook/api/bankercheque/printcompleted`, {
      Id: id,
    });
  }

  public cancel(payload: any): Observable<any> {
    return this.api.post<any>(`/chequebook/api/bankercheque/cancel`, payload);
  }

  public reject(payload: any): Observable<any> {
    return this.api.post<any>(`/chequebook/api/bankercheque/reject`, payload);
  }
  public modify(data: any, isForiegnDraft = false): Observable<any> {
    if (isForiegnDraft) {
      return this.api.post<any>(`/v1/backoffice/foreigndraft/modify`, data);
    }
    return this.api.post<any>(
      `/v1/backoffice/bankerschequebookticket/modify`,
      data
    );
  }
  public issue(payload: any): Observable<any> {
    return this.api.post<any>(`/chequebook/api/bankercheque/collect`, payload);
  }
  public getSpecialExchangeRates(data: any): Observable<any> {
    return this.api.post<any>(`/v1/account/specialrate`, data);
  }
  public getExchangeRates(data: any): Observable<any> {
    return this.api.post<any>(`/v1/account/exchangeRate`, data);
  }

  public getBranchLookup(branchId: string): Observable<{
    statusMessage: string;
    statusCode: string;
    successful: boolean;
    responseObject: BranchLookupResponse[];
  }> {
    return this.api.get(
      `/v1/backoffice/branchlookup/branches?branchId=${branchId}`
    );
  }
}

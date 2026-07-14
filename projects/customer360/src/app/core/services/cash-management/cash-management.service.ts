import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../shared/services';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CashManagementService {
  isBack!: boolean;
  cashManagementData: any;

  private http = inject(HttpClient);
  private apiService = inject(ApiService);

  isPressedBack = (isBack: boolean) => (this.isBack = isBack);

  getIsPressedBack = () => this.isBack;

  setCashManagementData = (data: any) => (this.cashManagementData = data);

  getCashManagementData = () => this.cashManagementData;

  public getCurrencies(): Observable<any> {
    const url = '/v1/backoffice/tellerbalance/currencies';
    return this.apiService
      .get<any>(url)
      .pipe(map(response => response.responseObject.currencies));
  }

  public getDenominations(
    currencyCode: string,
    transactionType: string
  ): Observable<any> {
    const url = `/v1/backoffice/tellerbalance/denominations?currencyCode=${currencyCode}&transactionType=${transactionType}`;
    return this.apiService
      .get<any>(url)
      .pipe(map(response => response.responseObject.denomination));
  }

  public getCharges(
    transactionType: string,
    currencyCode: string,
    sourceAccount: string,
    amount: string,
    denominations: any = [],
    instrumentNumber?: string
  ): Observable<any> {
    const url = `/v1/backoffice/customertransactions/form-data?actionFlow=${transactionType}&currency=${currencyCode}&sourceAccount=${sourceAccount}&amount=${amount}&instrumentNumber=${instrumentNumber}`;
    return this.apiService
      .post<any>(url, denominations)
      .pipe(map(response => response.responseObject));
  }

  public validateInstrumentNumber(data: any): Observable<any> {
    const url = `/v1/account/chequestatus`;
    return this.apiService.post<any>(url, data);
  }

  public getSpecialExchangeRates(data: any): Observable<any> {
    const url = `/v1/account/specialrate`;
    return this.apiService.post<any>(url, data);
  }

  public submitCashManagement(
    transactionType: string,
    data: any
  ): Observable<any> {
    const url = `/v1/backoffice/customertransactions/${transactionType}`;
    return this.apiService.post<any>(url, data);
  }

  public uploadCashManagementDocuments(data: any): Observable<any> {
    if (
      window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
      window.location.hostname ===
        'servicehub-customer-360-uat.equitygroupholdings.com'
    ) {
      return this.apiService.post<any>(`/v2/documents/submit`, data);
    }
    return this.apiService.post<any>(`/v2/documents/submit`, data);
  }

  public submitCashManagementDocuments(ticketId: string): Observable<any> {
    const url = `/v1/backoffice/customertransactions/${ticketId}/submit-documents`;
    return this.apiService.post<any>(url, null);
  }

  public verifyCustomerBio(ticketId: string, data: any): Observable<any> {
    const url = `/v1/backoffice/customertransactions/${ticketId}/verify-bio`;
    return this.apiService.post<any>(url, data);
  }

  public skipCustomerBio(ticketId: string): Observable<any> {
    const url = `/v1/backoffice/customertransactions/${ticketId}/skip-bio`;
    return this.apiService.post<any>(url, null);
  }

  public getTicketDocs(data: any): Observable<any> {
    return this.apiService.post<any>(`/v2/documents/search`, data);
  }

  public getTicketDoc(data: any): Observable<any> {
    return this.http.post<any>(
      environment.apiUrl + '/v2/documents/download',
      data,
      { responseType: 'blob' as 'json' }
    );
  }

  public storeTicketTaskData(id: any, data: any): Observable<any> {
    const url = environment.apiUrl + `/v1/tickets/${id}/data`;
    return this.http.post<any>(url, data);
  }

  public updateTicketStatus(data: any) {
    return this.apiService.post(`/v1/backoffice/update`, data);
  }

  public confirmCashManagementTicket(ticketId: string): Observable<any> {
    const url = `/v1/backoffice/customertransactions/${ticketId}/confirm`;
    return this.apiService.post<any>(url, {});
  }

  public rejectCashManagementTicket(ticketId: string): Observable<any> {
    const url = `/v1/backoffice/customertransactions/${ticketId}/reject`;
    return this.apiService.post<any>(url, {});
  }
}

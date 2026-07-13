import { inject, Injectable } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '@app/shared/services';
import { AddTransaction, UploadDoc, CreateTicketPayload, GetTransactionsResponse,BulkCharges, TicketTransactionsResponse } from './model/bulk.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class BulkPaymentService {
    private api = inject(ApiService);
    private http = inject(HttpClient);

    public createTicket(payload: CreateTicketPayload) {
        return this.api.post<any>(
            '/v1/backoffice/bulksalary/create-ticket',
            payload
        );
    }

    public getPaymentOptions() {
        return this.api.get<any>('/v1/backoffice/bulksalary/paymentoptions');
    }

    public getTransactions(ticketId: String): Observable<GetTransactionsResponse> {
        return this.api.get<GetTransactionsResponse>(
            `/v1/backoffice/bulksalary/${ticketId}/get-transactions`
        );
    }


    public getCharges(payload:BulkCharges){
        return this.api.post<any>(
            '/v1/backoffice/bulksalary/charge',
            payload
        );
    }

    public getTotalAmounts(ticketId: String){
        return this.api.get<any>(
            `/v1/backoffice/bulksalary/${ticketId}/get-totalamounts`
        )
    }
    public uploadDocuments(data: UploadDoc, ticketId: String){
      return this.api.post<any>(
        `/v1/backoffice/BulkSalary/${ticketId}/add-salarytemplate`,
        data
    );

    }

    public submitSupportingDoc(ticketId: String){
        return this.api.post<any>(
            `/v1/backoffice/BulkSalary/${ticketId}/upload-documents`,null
        );
    }

    public submitTransaction( ticketId: String){
      return this.api.post<any>(
        `/v1/backoffice/BulkSalary/${ticketId}/submit`,null
    );
    }

    public addTransaction(data: AddTransaction, ticketId: String): Observable<any> {
        return this.api.post<any>(
            `/v1/backoffice/BulkSalary/${ticketId}/add-transaction`,
            data
        );
    }

    public getExRates(data: any): Observable<any> {
        return this.api.get<any>(
            `/v1/util/getfx?ToCurrency=${data.toCurrency}&FromCurrency=${data.fromCurrency}&AccountNumber=${data.accountNumber}&fromAmount=${data.amount}`
        );
    }

    public updateTransaction(data: AddTransaction, ticketId: String): Observable<any> {
        return this.api.post<any>(
            `/v1/backoffice/BulkSalary/${ticketId}/update-transaction`,
            data
        );
    }

    public removeTransaction(
        accountNumber: String,
        ticketId: String
    ): Observable<any> {
        return this.api.post<any>(
            `/v1/backoffice/BulkSalary/${ticketId}/remove-transaction/${accountNumber}`,
            null
        );
    }

    public clearTransactions(ticketId: string){
        return this.api.post<any>(
            `/v1/backoffice/bulksalary/${ticketId}/clear-transaction`,
            null
        );
    }

      public searchBICs(query: string, countryCode?: string): Observable<any> {
        const transactionsUrl = `/v1/transactions/bics?search=${query}&country=${countryCode === 'SS' ? '' : countryCode}&onlyhqs=true&skip=0&fetch=200`;
        return this.api.get<any>(transactionsUrl, {headers: {skipLoadingInterceptor: "true"}});
    }

    public getSuspenseAccount(): Observable<any> {
      return this.api.get<any>(`/v1/backoffice/bulksalary/getSuspenseAccount/777/KES/54`);
    }

    public getTicketTransaction(ticketId: string): Observable<TicketTransactionsResponse> {
        return this.http.get<TicketTransactionsResponse>(
            `${environment.apiUrl}/finaclebridgeservice-v1/api/BulkSalaryPayment/TicketTransactions/${ticketId}`
        );
        }

}

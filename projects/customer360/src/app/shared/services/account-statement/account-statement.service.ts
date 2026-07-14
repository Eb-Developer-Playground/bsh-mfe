import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import {
  Bio,
  Balance,
  AccountBalanceResponse,
  ChargeAccountStatementPayload,
  ChargeAccountStatementResponse,
  StatementRequestPayload,
  StatementRequestResponse,
  AccountStatementV2,
} from '@app/home/customer/account-statements/models/account-statement';

@Injectable({
  providedIn: 'root'
})
export class AccountStatementService {

  constructor(private api: ApiService) { }

 inProcessVerifyBio = (ticketid: any, data: any) => {
      return this.api.post<any>(`/v2/backoffice/individualaccount/${ticketid}/verify-bio`, data);
 }

 invokeActions(actionType: 'GetAccountStatementPageCount' | 'GetAccountStatementCharge' | 'GetAccountBalance' | 'GeneratePdf',   ticket: number, version: 'V3' | 'V2' = 'V3') {
  return this.api.post<any>(`/${version}/backoffice/tickets/${ticket}/RequestAccountStatementFlowV2/${actionType}/invoke`, null);
}

  public submitIndividual(data: AccountStatementV2): Observable<any> {
     return this.api.post<any>(`/v2/backoffice/accountstatement/submit`, data);
  }

  public verifyBio(data: Bio,taskId:string, customerNotPresent = false): Observable<any> {
    const url = `/v3/backoffice/tickets/${taskId}/RequestAccountStatementFlowV2/verifyBio`
    return this.api.post<any>(url, {
      CustomerNotPresent: customerNotPresent,
      ...data
    });
  }

  public getAccountBalance(data:Balance): Observable<AccountBalanceResponse>{
    return this.api.post<any>('/v1/backoffice/AccountStatement/Accountbalance', data);
  }

  public calculateChargeV2(data: { accountId: string; bankId: string; SchemeCode: string }): Observable<any> {
    return this.api.post<any>('/v2/backoffice/AccountStatement/CalculateCharge', data);
  }

  public chargeAccountStatement(data: ChargeAccountStatementPayload, taskId: string | number): Observable<ChargeAccountStatementResponse> {
    return this.api.post<any>(`/v1/backoffice/AccountStatement/${taskId}/ChargeAccountStatement`, data);
  }

  public getStatementRequest(data: StatementRequestPayload): Observable<StatementRequestResponse> {
    return this.api.post<any>('/v1/backoffice/AccountStatement/statement-request', data);
  }

  public getAccountStatementFile(taskId: number): Observable<any> {
    return this.api.get<any>(`/v1/backoffice/AccountStatement/${taskId}/Print`);
  }

  public updateData(data: AccountStatementV2, taskId: string | number): Observable<any> {
    return this.api.post<any>(`/v1/backoffice/AccountStatement/${taskId}/update-data`, data);
  }
}

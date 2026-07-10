import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICreateChangeMandateTicketPayload } from '@app/home/customer/change-of-mandate/models/change-madate.model';

import { ApiService } from '@app/shared/services';

@Injectable({
  providedIn: 'root',
})
export class ChangeMandateService {
  private api = inject(ApiService);

  public getChangeMandateAccounts(data: any): Observable<any> {
    return this.api.post<any>(`/v1/account/mandate-signatory-inquiry`, data);
  }

  public setChangeMandateTicket(
    data: ICreateChangeMandateTicketPayload
  ): Observable<any> {
    return this.api.post<any>(`/v1/backoffice/mandate/submit-change`, data);
  }

  public getChangeMandateDocuments(actionFlow: string, bankId: string): Observable<any> {
    const url = `/v1/backoffice/documents?ActionFlow=${actionFlow}&bankId=${bankId}`;
    return this.api.get<any>(url);
  }

  public uploadTransactionDocuments(data: any): Observable<any> {
    if (
      window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
      window.location.hostname ===
        'servicehub-customer-360-uat.equitygroupholdings.com'
    ) {
      return this.api.post<any>(`/v3/documents/submit`, data);
    }
    return this.api.post<any>(`/v3/documents/submit`, data);
  }
  public uploadTransactionDocumentsV3(data: any): Observable<any> {
    return this.api.post<any>(`/v3/documents/submit`, data);
  }

  public bioVerify(cif: string, ticketId: string, bioModels?: any) {
    const payload = {
      bioModels,
    };
    return this.api.post<any>(
      `/v1/backoffice/mandate/${ticketId}/bio-verify`,
      payload
    );
  }
  public bioVerifyV2(
    ticketId: string,
    actionFlow: string | null,
    bioModels?: any
  ) {
    const payload = {
      bioModels,
    };
    return this.api.post<any>(
      `/v3/backoffice/tickets/${ticketId}/${actionFlow}/verifyBio`,
      payload
    );
  }

  /*public submitTransactionDocuments(id: any, data: any): Observable<any> {
    return this.api.post<any>(`/v1/backoffice/MoveMoney/${id}/submit-documents`, data);
  }*/

  public getAccountSignatories(account: number) {
    return this.api.get<any>(`/v1/account/${account}/signatories`);
  }

  /**
   *
   * @param countryCode
   * @returns
   */
  public useChangeMandateFlowV2(countryCode: 'CD' | 'UG' |  'RW' | 'SS' | 'KE' | string): boolean {
    return ['CD', 'UG', 'RW', 'SS'].includes(countryCode);
  }

  public getActionFlowName(countryCode: string): string {
    const isBusiness = localStorage.getItem('isBusiness') === 'true';
    const selectedAccount = JSON.parse(localStorage.getItem('selectedAccount') || '{}');
    const accountType = isBusiness ? 'entity' : (selectedAccount.mandate !== 'SELF' ? 'joint' : 'individual');
    if (this.useChangeMandateFlowV2(countryCode) && accountType !== 'individual') {
      if (countryCode === 'RW') {
        return 'ChangeModeOfOperationFlow';
      }
      return 'ChangeMandateFlowV2';
    }
    return 'ChangeMandateFlow';
  }
}

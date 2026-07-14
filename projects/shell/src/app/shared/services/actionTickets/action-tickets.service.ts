import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@app/shared/services/api.service';
import { SessionService } from '@app/shared/services/session/session.service';
import { actionTicket } from '@app/shared/models/common/actionTicket.model';
import { ActionTicketResponse } from '@app/shared/models/action-tickets.model';

@Injectable({
  providedIn: 'root',
})
export class ActionTicketsService {
  constructor(
    private apiService: ApiService,
    private sessionService: SessionService
  ) { }

  public createActionTicket(
    payload: actionTicket.createTicket
  ): Observable<any> {
    return this.apiService.post('/v3/backoffice/tickets/create', payload);
  }

  public createActionTicketWithDetails(
    runningTaskId: string,
    runningActionFlow: string,
    payload: any
  ): Observable<actionTicket.MandatePayload> {
    const endpoint = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/setData`;
    return this.apiService.post(endpoint, payload);
  }
  public getListOfDocumentsPartial(
    runningTaskId: string,
    runningActionFlow: string
  ): Observable<any> {
    const endpoint = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/GetListOfDocumentsPartial/invoke`;
    return this.apiService.post(endpoint, []);
  }

  public getListOfDocumentsPartialV2(ticketId: string) {
    const url = `/v3/backoffice/tickets/${ticketId}/AddKnownAgentFlowV2/GetListOfDocumentsPartial/invoke`;
    return this.apiService.post(url, {});
  }

  public getListOfDocumentsPartialV3(ticketId: string) {
    const url = `/v3/backoffice/tickets/${ticketId}/RemoveKnownAgentFlowV2/GetListOfDocumentsPartial/invoke`;
    return this.apiService.post(url, {});
  }
  public ValidateLeafStatus(
    runningTaskId: string,
    runningActionFlow: string
  ): Observable<any> {
    const endpoint = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/ValidateLeafStatus/invoke`;
    return this.apiService.post(endpoint, []);
  }

  public validateMandateTicket(
    runningTaskId: string,
    runningActionFlow: string
  ): Observable<any> {
    const endpoint = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/ValidateAccountDetailsData/invoke`;
    return this.apiService.post(endpoint, []);
  }
  public ChequeOrderStatusValidation(
    runningTaskId: string,
    runningActionFlow: string
  ): Observable<any> {
    const endpoint = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/ChequeOrderStatusValidation/invoke`;
    return this.apiService.post(endpoint, []);
  }
  public ValidatePan(
    runningTaskId: string,
    runningActionFlow: string
  ): Observable<any> {
    const endpoint = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/ValidatePan/invoke`;
    return this.apiService.post(endpoint, []);
  }
  public validateMandateDocuments(
    runningTaskId: string,
    runningActionFlow: string
  ): Observable<any> {
    const endpoint = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/ConfirmUploadedDocumentsPartial/invoke`;
    return this.apiService.post(endpoint, []);
  }

  public sendNotPresentBio(
    runningTaskId: string,
    runningActionFlow: string,
    payload: any
  ): Observable<ActionTicketResponse> {
    const endpoint = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/verifyBio`;
    return this.apiService.post(endpoint, payload);
  }
  public validateMandateBioVerify(
    runningTaskId: string,
    runningActionFlow: string
  ): Observable<any> {
    const endpoint = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/VerifyBio/invoke`;
    return this.apiService.post(endpoint, []);
  }

  public setPartialData(
    runningTaskId: string,
    runningActionFlow: string,
    Artifacts: any,
    Payload: any
  ): Observable<any> {
    const endpoint = `/v3/backoffice/tickets/${runningTaskId}/${runningActionFlow}/${Artifacts}/setPartialData`;
    return this.apiService.post(endpoint, Payload);
  }
}

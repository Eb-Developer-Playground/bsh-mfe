import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService, SessionService } from '../../../shared/services';
import { TicketStatus } from './models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private session = inject(SessionService);

  private tickets$ = new BehaviorSubject<any[]>([]);
  private parentTicketId = new BehaviorSubject<string>('');
  parentTicketId$ = this.parentTicketId.asObservable();

  setParentTicketId(id: string) {
    this.parentTicketId.next(id);
  }

  public getTicketsObs() {
    return this.tickets$.asObservable();
  }

  public updateTickets(data: any[]) {
    return this.tickets$.next(data);
  }

  public getTicketStatus() {
    return this.api
      .get('/v1/tickets/count', {
        queryParams: { bankId: this.session.subsidiary.bankId },
      })
      .pipe(
        map((res: any) => {
          if (res.statusCode === '00') {
            return res.responseObject;
          } else {
            return of([]);
          }
        }),
        catchError(err => throwError(err))
      );
  }

  public getTicket(id: string) {
    return this.api
      .get(`/v1/tickets/${id}`, {
        queryParams: { bankId: this.session.subsidiary.bankId },
      })
      .pipe(map((res: any) => res.responseObject));
  }

  public fetchAllTickets(pageIndex: number, pageSize: number, filters: any) {
    let params = new HttpParams();
    let filterKeys = Object.keys(filters);
    filterKeys.forEach(key => {
      if (!filters[key] || (key === 'status' && filters[key] === 'All')) return;
      params = params.set(key, filters[key]);
    });

    return this.api
      .get(
        `/v2/tickets/paged/?page=${pageIndex}&take=${pageSize}&` +
          params.toString(),
        {
          queryParams: { bankId: this.session.userBank },
        }
      )
      .pipe(
        map((res: any) => {
          if (res.statusCode === '00') {
            const items = res.responseObject.items.map(
              (ticket: any, ind: any) => {
                let subject = ticket.subject;
                let status = ticket.status;
                let cssStatusClass = 'pending';
                let actionCssClass = '';
                
                // Set subject for skip bio tickets
                if (ticket.actionFlowName === 'SkipBio') {
                  subject = 'Access Profile for a Customer who has Skipped Bio Verification';
                }
                
                let isCNP =
                  subject == 'Access profile of a cutomer who is not present';
                let isSkipBio = 
                  subject == 'Access Profile for a Customer who has Skipped Bio Verification' || 
                  ticket.actionFlowName === 'SkipBio';
                if (status === 'Submitted' && (isCNP || isSkipBio)) {
                  actionCssClass = 'hover-underline cursor-pointer';
                }
                if (
                  ![
                    'Completed',
                    'New',
                    'Rejected',
                    'Request Declined',
                  ].includes(status) ||
                  (status === 'Completed' && (isCNP || isSkipBio)) ||
                  ticket.actionFlowName === 'UnblockCard'
                ) {
                  actionCssClass = 'hover-underline cursor-pointer';
                }
                if (status == 'New') {
                  cssStatusClass = 'new';
                }
                if (['Aborted', 'Error', 'Rejected'].includes(status)) {
                  cssStatusClass = 'error';
                }
                if (['Completed', 'Submitted'].includes(status)) {
                  cssStatusClass = 'completed';
                }
                return {
                  statusText: ticket.status.endsWith('NewGen')
                    ? ticket.status
                    : this.titleToPhrase(ticket.status),
                  actionCssClass,
                  cssStatusClass,
                  ...ticket,
                  subject, // Override the subject with our updated value
                };
              }
            );
            return { items, itemsCount: res.responseObject.itemsCount };
          } else {
            return of([]);
          }
        })
      );
  }

  // get subject and created by dropdown values
  public getTicketsDropdown(): Observable<any> {
    return this.api
      .get<any>('/v1/tickets/dropdowns', {
        queryParams: { bankId: this.session.subsidiary.bankId },
      })
      .pipe(
        map((res: any) => {
          if (res.statusCode === '00') {
            return res.responseObject;
          } else {
            return of([]);
          }
        })
      );
  }

  updateTicketStatus(payload: TicketStatus) {
    return this.api.post(`/v1/backoffice/update`, payload);
  }

  addTicketNote(id: string, data: any) {
    return this.api.post<any>(`/v1/tickets/${id}/note`, data);
  }

  abortTicket(id: string, data: any) {
    return this.api.post(`/v1/tickets/${id}/abort`, data);
  }

  public getTicketDocs(data: any, version = 'v1'): Observable<any> {
    return this.api.post<any>(`/${version}/documents/search`, data);
  }

  public getTicketDoc(data: any, version = 'v1'): Observable<any> {
    const url = environment.apiUrl + `/${version}/documents/download`;
    return this.http.post<any>(url, data, {
      responseType: 'blob' as 'json',
    });
  }

  public storeTicketTaskData(
    ticketid: any,
    data: { actionData: string; notes: string }
  ): Observable<any> {
    //const url = `/v1/tickets/${ticketid}/data/${status}/status`;
    const url = `${environment.apiUrl}/v1/tickets/${ticketid}/invokeWithData`;
    return this.http.post<any>(url, data);
  }

  private titleToPhrase(word: string) {
    let chars = word.split('');
    let spaced = chars.map((char, index) => {
      if (char === char.toUpperCase() && index > 0) {
        return ' ' + char;
      } else {
        return char;
      }
    });
    return spaced.join('');
  }

  public updateTicketData(
    ticketId: string,
    actionFlowname: string,
    objectUpdate: string,
    data: any
  ): Observable<any> {
    const url = `${environment.apiUrl}/v3/backoffice/tickets/${ticketId}/${actionFlowname}/${objectUpdate}/setPartialData`;
    return this.http.post<any>(url, data);
  }
}

import { Injectable } from '@angular/core';
import { forkJoin, Observable, take } from 'rxjs';
import { ApiService } from '../api.service';
import { SessionService } from '../session/session.service';

const MAX_DOCUMENTS_PER_CALL = 5;

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  constructor(
    private apiService: ApiService,
    private session: SessionService
  ) {}

  public upload(data: { documents: any }): Observable<any> {
    const url = '/v2/documents/submit';
    // TODO: Return this check when get list of documents partial is implemented
    const urlDrc = `/v3/documents/submit`;

    // create deep copy of documents array to prevent messing up
    // documents lists in components and ui
    const documents = JSON.parse(JSON.stringify(data.documents));
    const calls = [];

    if (documents.length <= MAX_DOCUMENTS_PER_CALL) {
      const apiUrl =
        this.session.subsidiary.countryCode === 'CD' ? urlDrc : url;
      calls.push(this.apiService.post<any>(apiUrl, data));
      return forkJoin(calls);
    }
    for (let i = 0; i < documents.length; i += MAX_DOCUMENTS_PER_CALL) {
      const chunk = documents.slice(i, i + MAX_DOCUMENTS_PER_CALL);

      const dataCopy = JSON.parse(JSON.stringify(data));
      dataCopy.documents = chunk;

      calls.push(this.apiService.post<any>(url, dataCopy));
    }

    return forkJoin(calls);
  }

  public uploadV3(data: { documents: any }): Observable<any> {
    const url = '/v3/documents/submit';
    const documents = JSON.parse(JSON.stringify(data.documents));
    const calls = [];

    if (documents.length <= MAX_DOCUMENTS_PER_CALL) {
      calls.push(this.apiService.post<any>(url, data).pipe(take(1)));
    } else {
      for (let i = 0; i < documents.length; i += MAX_DOCUMENTS_PER_CALL) {
        const chunk = documents.slice(i, i + MAX_DOCUMENTS_PER_CALL);
        const dataCopy = JSON.parse(JSON.stringify(data));
        dataCopy.documents = chunk;
        calls.push(this.apiService.post<any>(url, dataCopy).pipe(take(1)));
      }
    }

    return forkJoin(calls);
  }

  public postEddForm(ticketid: string | null, data: any): Observable<any> {
    const url = '/v1/backoffice/individualaccount/' + ticketid + '/eddform';
    return this.apiService.post<any>(url, data);
  }

  public uploadTransactionDocumentsV3(data: any): Observable<any> {
    return this.apiService.post<any>(`/v3/documents/submit`, data);
  }
}

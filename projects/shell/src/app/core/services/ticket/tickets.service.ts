import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketService {
  [key: string]: any;
  addTicketNote(ticketId: string, note: any): Observable<any> {
    return of(null);
  }
  getTicket(ticketId: string): Observable<any> {
    return of(null);
  }
}

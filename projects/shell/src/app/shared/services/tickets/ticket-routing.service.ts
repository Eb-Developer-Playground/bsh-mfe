import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { routesConfig } from './ticket-routing';

@Injectable({
  providedIn: 'root',
})
export class TicketRoutingService {
  private _ticket: any;

  constructor(
    private router: Router,
    private api: ApiService
  ) {}

  set ticket(data: any) {
    if (!data) {
      this.remove('ticket');
      return;
    }
    this._ticket = data;
    localStorage.setItem('ticket', JSON.stringify(this._ticket));
  }

  get ticket(): any {
    return this.retrieve('ticket');
  }

  private remove(k: string): void {
    localStorage.removeItem(k);
  }

  private retrieve(k: string, _default?: any): any {
    return localStorage.getItem(k)
      ? JSON.parse(<string>localStorage.getItem(k))
      : _default || null;
  }

  openTicket(id: { toString: () => any }) {
    this.api
      .get<any>('/v1/tickets/' + id.toString())
      .subscribe((result: { successful: any; responseObject: any }) => {
        if (!result.successful) return;
        this.ticket = result.responseObject;
        this.routeToTicket({
          id: result.responseObject.id,
          actionFlowName: result.responseObject.actionFlow.name,
          status: result.responseObject.status,
        });
      });
  }

  canBeRouted(ticket: { id: any; actionFlowName: string; status: string }) {
    const normalizedStatus = ticket.status ? ticket.status.replace(/\s/g, '') : '';
    return routesConfig.some(
      el =>
        el.actionFlow.includes(ticket.actionFlowName) &&
        el.statuses.includes(normalizedStatus)
    );
  }

  routeToTicket(ticket: { id: any; actionFlowName: string; status: string }) {
    const normalizedStatus = ticket.status ? ticket.status.replace(/\s/g, '') : '';
    const route = routesConfig.find(
      el =>
        el.actionFlow.includes(ticket.actionFlowName) &&
        el.statuses.includes(normalizedStatus)
    );
    if (route) {
      if (!route.host) {
        this.router.navigate([`${route.path}/${ticket.id}`]).then(r => {});
      } else {
        const url = new URL(route.host);
        url.pathname = `${route.path}/${ticket.id}`;
        window.location.href = url.toString();
      }
    }
  }
}

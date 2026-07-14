import { inject, Injectable } from '@angular/core';
import { SessionService } from '@app/shared/services';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class OwnTicketPermissionService {
  private sessionService = inject(SessionService);

  public isOwnTicket = (ticket: any): boolean => {
    const user = this.sessionService.user;
    return user.username === ticket?.createdBy;
  };

  public canApproveOwnTicket = (): boolean => {
    if (environment.production) return false;
    return this.sessionService.hasFeatureRole('OwnTicket.Checker');
  };
}

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from "@app/shared/services";

@Injectable({
    providedIn: 'root'
})
export class AuditService {
  private api = inject(ApiService);

  public eventAuditLog = (
    EventName: any,
    EventDescription: any,
    AuditData: any
  ) => {
    const log = {
      EventName,
      EventDescription,
      AuditData,
    };
    // console.log('--------eventAuditLog-------');
    return this.auditLog(log, true);
  };

  public auditLog(
    data: any,
    skipLoadingInterceptor?: boolean
  ): Observable<any> {
    return this.api.post<any>('/v1/backoffice/audit', data, {
      headers: { skipLoadingInterceptor: String(skipLoadingInterceptor) },
    });
  }
}

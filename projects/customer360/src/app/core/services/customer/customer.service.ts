import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@app/shared/services';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private api = inject(ApiService);

  sendCustomerRegistrationRequest(payload: any) {
    return this.api.post<any>(
      '/v1/backoffice/adminPortal/customer-registration',
      payload
    );
  }

  updateCustomerProfile = (data: any): Observable<any> => {
    return this.api.post<any>(
      `/v1/backoffice/AdminPortal/customer-profile`,
      data
    );
  };
}

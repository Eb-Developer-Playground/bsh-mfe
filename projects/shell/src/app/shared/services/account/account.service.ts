import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(
    private apiService: ApiService,
    private session: SessionService
  ) {}

  public cifInquiryV2(customerId: string, isEntity: boolean): Observable<any> {
    const url = `${
      isEntity ? '/v1/account/business/cif/inquiry' : '/v2/account/cifinquiry'
    }`;
    return this.apiService.post<any>(url, {
      BankId: this.session.user.bankId,
      CustomerID: customerId,
    });
  }

  public getAccount(values: string): Observable<any> {
    const url = '/v1/account' + values;
    return this.apiService.get<any>(url);
  }

  public fetchPhoto(data: any): Observable<any> {
    return this.apiService.post<any>('/v1/account/photo', data);
  }
}

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TermsAndConditionsService {
  constructor(private apiService: ApiService) {}

  public sendIndividualAccountTermsAndConditions(
    payload: any,
    subsidiary: any
  ): Observable<any> {
    const vs = subsidiary?.countryCode === 'CD' ? 'v4' : 'v2';
    return this.apiService.post(
      `/${vs}/backoffice/individualaccount/terms-and-conditions`,
      payload
    );
  }
}

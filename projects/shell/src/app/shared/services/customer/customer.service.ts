import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { ApiService } from 'src/app/shared/services';
import { Customer } from '../../models/customer/customer.model';

@Injectable()
export class CustomerService {
  private _chequerequest: any;
  constructor(private apiService: ApiService) {}

  public setChequeRequest(data: any) {
    if (!data) {
      localStorage.removeItem('ChequeRequest');
      return;
    }
    this._chequerequest = data;
    localStorage.setItem('ChequeRequest', JSON.stringify(this._chequerequest));
  }

  public getChequeRequest(): any {
    return JSON.parse(<string>localStorage.getItem('ChequeRequest'));
  }

  public removeChequeRequest() {
    localStorage.removeItem('ChequeRequest');
  }

  public getCustomerStatus(
    value: any
  ): Observable<Customer.CustomerStatusResponse> {
    return this.apiService.post<Customer.CustomerStatusResponse>(
      '/v1/adminportal/isprofileactive',
      value
    );
  }
}

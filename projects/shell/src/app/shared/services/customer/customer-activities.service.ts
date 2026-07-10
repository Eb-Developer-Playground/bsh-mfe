import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerActivity } from '../../models/customer/customer-activities.model';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerActivitiesService {
  constructor(private apiService: ApiService) {}

  public getLastTenActivites(
    values: any
  ): Observable<CustomerActivity.CustomerActivityResponse> {
    return this.apiService.post('/v1/adminportal/auditpagination', values);
  }
}

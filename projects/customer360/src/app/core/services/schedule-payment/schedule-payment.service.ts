import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { ApiService } from '@app/shared/services';

@Injectable({
  providedIn: 'root',
})
export class SchedulePaymentService {
  private api = inject(ApiService);

  private schedules$ = new BehaviorSubject<any[]>([]);

  public getSchedulesObs() {
    return this.schedules$.asObservable();
  }

  public fetchSchedules(
    pageIndex: number,
    pageSize: number,
    sortDirection: string,
    filters: any
  ): Observable<any> {
    let scheduleTypePath = filters.scheduleType;

    let params = new HttpParams();

    const filterKeys = Object.keys(filters);

    filterKeys.forEach(key => {
      if (
        filters[key] &&
        filters[key] !== null &&
        filters[key] !== undefined &&
        key !== 'scheduleType'
      ) {
        params = params.set(key, filters[key]);
      }
    });
    let url =
      `/v1/omnischedulerservice/api/back-office/schedule/${scheduleTypePath}?pageIndex=${pageIndex + 1}&pageSize=${pageSize}&` +
      params.toString();

    return this.api.get(url).pipe(
      map((res: any) => {
        if (res.statusCode === '00') {
          return res.responseObject;
        } else {
          return of([]);
        }
      })
    );
  }

  public updateSchedules(data: any[]) {
    return this.schedules$.next(data);
  }

  public getSchedules() {
    return this.schedules$.getValue();
  }

  getSchedulePayment(filters?: any) {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        params = params.append(key, filters[key]);
      });
    }
    let url =
      `/v1/omnischedulerservice/api/back-office/schedule/list?` +
      params.toString();

    return this.api.get(url).pipe(
      map((res: any) => {
        if (res.statusCode === '00') {
          return res.responseObject;
        } else {
          return of([]);
        }
      })
    );
  }

  getSchedulePaymentList(filters?: any) {
    let scheduleTypePath = filters.scheduleType;

    let params = new HttpParams();

    const filterKeys = Object.keys(filters);

    filterKeys.forEach(key => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        key !== 'scheduleType'
      ) {
        params = params.set(key, filters[key]);
      }
    });
    let url =
      `/v1/omnischedulerservice/api/back-office/schedule/${scheduleTypePath}?` +
      params.toString();

    return this.api.get(url).pipe(
      map((res: any) => {
        if (res.statusCode === '00') {
          return res.responseObject;
        } else {
          return of([]);
        }
      })
    );
  }

  cancelSchedulePayment(data: any) {
    let url = `/v1/backoffice/profilebackoffice/cancelscheduledpayment`;
    return this.api.post(url, data);
  }

  updateSchedulePayment(data: any) {
    let url = `/v1/backoffice/profilebackoffice/updatescheduledpayment`;
    return this.api.post(url, data);
  }

  fetchPaymentByID(scheduleID: string) {
    let url = `/v1/omnischedulerservice/api/back-office/schedule/fetch/${scheduleID}`;
    return this.api.get(url);
  }

  fetchReminders() {
    let url = `/v1/omnischedulerservice/api/lookup/reminder`;
    return this.api.get(url);
  }

  fetchFrequency() {
    let url = `/v1/omnischedulerservice/api/lookup/frequency`;
    return this.api.get(url);
  }
}

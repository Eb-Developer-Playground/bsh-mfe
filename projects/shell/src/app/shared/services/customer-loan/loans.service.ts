import { Injectable } from '@angular/core';
import { Loans } from './model/loans.model';
import { ApiService } from '@app/shared/services/api.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { any } from '@amcharts/amcharts5/.internal/core/util/Array';

@Injectable({
  providedIn: 'root',
})
export class LoansService {
  constructor(private apiService: ApiService) {}

  public getLoans(
    id: string,
    idType: string,
    bankID: string
  ): Observable<Loans[]> {
    return this.apiService
      .get(
        `/v1/account?Id=${id}&bankId=${bankID}&idType=${idType}&reloadFromCache=false`
      )
      .pipe(
        map(data => {
          let accountLoans;
          return (accountLoans = (data as any).responseObject.accounts.filter(
            function getRecent(res: any) {
              if (res.schemeType == 'LAA') return res;
            }
          ));
        })
      );
  }
}

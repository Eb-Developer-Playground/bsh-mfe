import { Injectable } from '@angular/core';
import { catchError, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { guid } from '../../utils';
import { ApiService } from '@app/shared/services/api.service';
import { ID_TYPES } from './types';

@Injectable({
  providedIn: 'root',
})
export class KraPinService {
  constructor(private api: ApiService) {}

  validatePersonalKRA(
    countryCode: string,
    documentType: ID_TYPES,
    documentNumber: string,
    countryOfResidence: string | null = null,
    requestId?: string
  ) {
    let taxPayerType!: string;
    if (documentType === ID_TYPES.NationalId) {
      taxPayerType = 'KE';
    } else if (documentType === ID_TYPES.ForeignId) {
      taxPayerType = 'NKE';
    } else {
      taxPayerType = 'NKENR'; // Foreigners
    }
    return this.api
      .post(`/v1/krap-v1/api/KRAPIN/details`, {
        requestId: requestId || guid(),
        typeOfTaxpayer: taxPayerType,
        taxpayerId: documentNumber,
      })
      .pipe(
        catchError(() => {
          return of({ successful: false, responseObject: { pin: null } });
        }),
        mergeMap((resp: any) => {
          return of({
            successful: resp.status === 'OK',
            responseObject: resp,
          });
        })
      );
  }

  validateCompanyKRA(documentNumber: string, requestId?: string) {
    return this.api
      .post(`/v1/krap-v1/api/KRAPIN/details`, {
        requestId: requestId || guid(),
        typeOfTaxpayer: 'COMP',
        taxpayerId: documentNumber,
      })
      .pipe(
        catchError(() => {
          return of({ successful: false, responseObject: null });
        }),
        mergeMap((resp: any) => {
          return of({
            successful: resp.status === 'OK',
            responseObject: resp,
          });
        })
      );
  }
}

import { Injectable } from '@angular/core';
import { ApiService } from '@app/shared/services/api.service';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { ID_TYPES } from './types';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  constructor(private api: ApiService) {}

  validateIdentity(
    countryCode: string,
    documentType: ID_TYPES,
    documentNumber: string,
    countryOfResidence: string | null = null,
    requestId?: string
  ): Observable<any> {
    let apiCall: Observable<any>;
    switch (documentType) {
      case ID_TYPES.NationalId:
        apiCall = this.validateKenyanId(countryCode, documentNumber);
        break;
      case ID_TYPES.ForeignId:
        apiCall = this.validateForeignId(countryCode, documentNumber);
        break;
      case ID_TYPES.KenyanPassport:
      case ID_TYPES.ForeignPassport:
        apiCall = this.validatePassport(countryCode, documentNumber);
        break;
      default:
        apiCall = this.api.post('/v1/validate/v3/identitylookup', {
          countryCode,
          documentNumber,
          documentType,
          requestId,
        });
        break;
    }
    return apiCall.pipe(
      catchError(() => {
        return of({ successful: false, responseObject: null });
      }),
      mergeMap((resp: any) => {
        return of({
          successful: resp?.statusMessage === 'Successful',
          responseObject: resp?.responseObject,
        });
      })
    );
  }

  validateKenyanId(
    countryCode: string,
    documentNumber: string,
    requestId?: string
  ) {
    return this.api.post('/v1/validate/v3/identitylookup', {
      countryCode,
      documentNumber,
      documentType: 'NationalId',
      requestId,
    });
  }

  validateForeignId(
    countryCode: string,
    documentNumber: string,
    requestId?: string
  ) {
    return this.api.post('/v1/validate/v3/identitylookup', {
      countryCode,
      documentNumber,
      documentType: 'Foreign',
      requestId,
    });
  }

  validatePassport(
    countryCode: string,
    documentNumber: string,
    requestId?: string
  ) {
    return this.api.post('/v1/validate/v3/identitylookup', {
      countryCode,
      documentNumber,
      documentType: 'Passport',
      requestId,
    });
  }

  validateIPRS(
    countryCode: string,
    documentType: ID_TYPES,
    documentNumber: string,
    requestId?: string
  ) {
    return this.api.post('/v1/backoffice/customeridentity/IPRS-Search', {
      countryCode,
      documentType: this.mapIdType(documentType),
      documentNumber,
      requestId,
    });
  }

  validateNIRA(data: any) {
    return this.api.post('/v1/backoffice/customeridentity/NIRA-Search', data);
  }

  checkNIRAStatus(requestId: string) {
    return this.api.get(
      `/v1/backoffice/customeridentity/NIRA-Status/${requestId}`
    );
  }
  // checkCrbStatus(data: Crb.CrbPayload): Observable<Crb.CrbResponse> {
  //   return this.api.post<any>(
  //     `/v1/backoffice/customeridentity/crb-individual/`,
  //     data
  //   );
  // }

  private mapIdType(type: string): string {
    switch (type.toLowerCase()) {
      case 'nationalid':
        return 'ID';
      default:
        return type;
    }
  }
}

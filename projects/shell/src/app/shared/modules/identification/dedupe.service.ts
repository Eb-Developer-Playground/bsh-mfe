import { Injectable } from '@angular/core';
import { Observable, of, retry, Subject, switchMap, throwError } from 'rxjs';
import { ApiService } from '@app/shared/services/api.service';
import { SessionService } from '@app/shared/services/session/session.service';
import { IHttpOptions } from '../../services/api.service';
import { IdDocumentService } from './id-document.service';
import { ID_TYPES, IdTypeDescription } from './types';
import CONST from '@app/shared/utils/constants';
import { format } from 'date-fns';
import { queryParams } from '@app/shared/utils/utils';

export interface ICIFItem {
  cifId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  suspendedFlg: 'Y' | 'N';
  isSuspended: boolean;
}
export interface IDedupeResult {
  formValues: {
    refNum: string;
    idType: string;
    nationality: string;
    countryOfResidence: string;
  };
  result: Array<any>;
}

const { DEDUPE_BIRTH_DATE_FORMAT } = CONST;

interface IDedupeResponse {
  success: boolean;
  message: string;
  param: ID_TYPES;
  details: [
    {
      cifId: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      suspendedFlg: string;
      isSuspended: boolean;
    },
  ];
}

interface IDedupeResponseV1 {
  cifId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  suspendedFlg: string;
  isSuspended: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DedupeService {
  constructor(
    private apiService: ApiService,
    private session: SessionService,
    private idTypesService: IdDocumentService
  ) {}

  private doDedupe$ = new Subject<boolean>();

  public getDoDedupeObs() {
    return this.doDedupe$.asObservable();
  }

  performDRCDedupeCheck(payload: any, options?: IHttpOptions): Observable<any> {
    const url = `/v2/accounts/Onboarding/dedupe-drc`;
    return this.apiService.post<any>(url, payload, options);
  }

  public getDedupeCheck(
    values: string,
    options?: IHttpOptions
  ): Observable<any> {
    const url = `/v2/account/cif/dupecheck-custom` + values;
    return this.apiService.get<any>(url, options);
  }

  public setDoDedupeObs(dodedupe: boolean) {
    return this.doDedupe$.next(dodedupe);
  }

  // Dedupe check for DRC ONLY
  performDRCDedupe(
    idType: ID_TYPES,
    refNum: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    emailAddress: string,
    birthDate: string,
    birthPlace: string,
    options?: IHttpOptions
  ): Observable<any> {
    const bankId = this.session.subsidiary.bankId;
    const config = this.idTypesService.allIdTypeDescriptions.find(
      it => it.value === idType
    );

    if (!config) {
      return throwError(() => new Error('Invalid ID Type configuration'));
    }

    const payload = {
      docCode: config.dedupeParam,
      idNumber: refNum,
      firstName,
      lastName,
      phoneNumber: `${phoneNumber}`,
      ...(emailAddress && { emailAddress }), // Only include email address if it exists, truthy value
      dob: format(new Date(birthDate), DEDUPE_BIRTH_DATE_FORMAT),
      birthPlace,
      bankId,
    };

    return this.performDRCDedupeCheck(payload, options).pipe(
      retry(1),
      switchMap(
        (res: {
          responseObject: IDedupeResponseV1[];
          successful: boolean;
          statusMessage: string;
        }) => {
          if (!res.successful)
            return throwError(() => new Error(res?.statusMessage));
          const matches: any[] = [];
          res.responseObject.forEach(p => {
            matches.push({
              idType: config.name || idType,
              refNum: refNum,
              fullName: `${p.firstName} ${p.lastName}`,
              ...p,
            });
          });
          return of({
            successful: res.successful,
            statusMessage: res.statusMessage,
            responseObject: matches,
          });
        }
      )
    );
  }

  public performDedupe(
    type: ID_TYPES,
    refNum: string,
    options?: IHttpOptions
  ): Observable<any> {
    const bankId = this.session.user.bankId;
    const config = this.idTypesService.allIdTypeDescriptions.find(
      it => it.value === type
    );
    if (!config) {
      return throwError(() => new Error('Invalid ID Type configuration'));
    }
    return this.apiService.get<IDedupeResult>(
      `/v2/account/dedupe/?Id=${refNum}&bankId=${bankId}&idType=${config.dedupeParam}`,
      options
    );
  }

  // General dedupe check of other subsidiaries other than DRC
  performDedupeDRC(
    type: ID_TYPES,
    refNum: string,
    options?: IHttpOptions
  ): Observable<any> {
    const bankId = this.session.subsidiary.bankId;
    const config = this.idTypesService.allIdTypeDescriptions.find(
      it => it.value === type
    );
    if (!config) {
      return throwError(() => new Error('Invalid ID Type configuration'));
    }
    const urlParams = queryParams('/v2/account/dedupe/', {
      idType: config.dedupeParam,
      Id: refNum,
      options,
      bankId,
    });
    return this.getDedupeCheck(urlParams, options).pipe(
      retry(1),
      switchMap(
        (res: {
          responseObject: IDedupeResponseV1[];
          successful: boolean;
          statusMessage: string;
        }) => {
          if (!res.successful)
            return throwError(() => new Error(res?.statusMessage));
          const matches: any[] = [];
          res.responseObject.forEach(p => {
            matches.push({
              idType: config.name || type,
              refNum: refNum,
              fullName: `${p.firstName} ${p.lastName}`,
              ...p,
            });
          });
          return of({
            successful: res.successful,
            statusMessage: res.statusMessage,
            responseObject: matches,
          });
        }
      )
    );
  }

  performDedupeV2(
    type: ID_TYPES,
    refNum: string,
    contacts?: { phone?: string; email?: string },
    options?: IHttpOptions
  ): Observable<any> {
    const bankId = this.session.subsidiary.bankId;
    const config = <IdTypeDescription>(
      this.idTypesService.allIdTypeDescriptions.find(it => it.value === type)
    );
    const params: Array<{ type: string; value: string }> = [
      { type: config?.dedupeParam || '', value: refNum },
    ];
    if (contacts?.email) params.push({ type: 'email', value: contacts.email });
    if (contacts?.phone) params.push({ type: 'phone', value: contacts.phone });
    return this.apiService
      .post<any>(
        '/v2/accounts/Onboarding/dedupe',
        { bank: bankId, params },
        options
      )
      .pipe(
        retry(1),
        switchMap(
          (res: {
            responseObject: IDedupeResponse[];
            successful: boolean;
            statusMessage: string;
          }) => {
            if (!res.successful)
              return throwError(() => new Error(res?.statusMessage));
            const matches: any[] = [];
            res.responseObject
              .filter(r => r.success)
              .forEach(p => {
                p.details.forEach(detail => {
                  const idTypeName =
                    this.idTypesService.allIdTypeDescriptions.find(
                      id => id.dedupeParam === p.param
                    )?.name || p.param;
                  matches.push({
                    idType: idTypeName,
                    refNum:
                      params.find(param => param.type === p.param)?.value || '',
                    fullName: `${detail.firstName} ${detail.lastName}`,
                    ...detail,
                  });
                });
              });
            return of({
              successful: res.successful,
              statusMessage: res.statusMessage,
              responseObject: matches,
            });
          }
        )
      );
  }
}

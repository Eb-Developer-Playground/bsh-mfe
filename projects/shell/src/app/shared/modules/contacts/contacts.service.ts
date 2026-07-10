import { inject, Injectable } from '@angular/core';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, SessionService } from '../../services';
import { EmailType, PhoneType } from './models';

const otpAPIs: {
  v1: { generate: string; validate: string; regenerate: string };
  v2: { generate: string; validate: string; regenerate: string };
} = {
  v1: {
    generate: '/v1/otp',
    validate: '/v1/otp/verify',
    regenerate: '/v1/otp/v2/regenerate', // Old "/v1/otp/v2/regenerate"
  },
  v2: {
    generate: '/v1/backoffice/otp/generate/',
    validate: '/v1/backoffice/otp/verify/',
    regenerate: '/v1/backoffice/otp/resend/',
  },
};

const DEFAULT_PHONE_TYPES: PhoneType[] = [
  {
    value: 'HOMEPH1',
    localetext: 'Home Phone 1',
  },
  {
    value: 'HOMEPH2',
    localetext: 'Home Phone 2',
  },
  {
    value: 'WORKPH1',
    localetext: 'Work Phone 1',
  },
  {
    value: 'WORKPH2',
    localetext: 'Work Phone 2',
  },
  {
    value: 'COMMPH1',
    localetext: 'Communication Phone 1',
  },
  {
    value: 'COMMPH2',
    localetext: 'Equitel Phone No',
  },
  {
    value: 'TELEX',
    localetext: 'Telex',
  },
  {
    value: 'FAX1',
    localetext: 'Fax 1',
  },
  {
    value: 'FAX2',
    localetext: 'Fax 2',
  },
  {
    value: 'PAGER',
    localetext: 'Pager',
  },
  {
    value: 'REGPH1',
    localetext: 'Registered Phone 1',
  },
  {
    value: 'REGPH2',
    localetext: 'Registered Phone 2',
  },
  {
    value: 'CELLPH',
    localetext: 'Cell Phone',
  },
  {
    value: 'NREPHONE',
    localetext: 'NRE Phone',
  },
  {
    value: 'HOMETELEX',
    localetext: 'Home Telex',
  },
  {
    value: 'COMMTELEX',
    localetext: 'Communication Telex',
  },
  {
    value: 'CAT200001',
    localetext: 'Cell Phone 3',
  },
  {
    value: 'CAT200009',
    localetext: 'Communication Phone 3',
  },
];

const DEFAULT_EMAIL_TYPES: EmailType[] = [
  {
    value: 'HOMEEML',
    localetext: 'Home',
  },
  {
    value: 'WORKEML',
    localetext: 'Work',
  },
  {
    value: 'COMMEML',
    localetext: 'Communication',
  },
  {
    value: 'REGEML',
    localetext: 'Registered',
  },
  {
    value: 'PALMEML',
    localetext: 'Palm',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  readonly _session = inject(SessionService);

  constructor(private api: ApiService) {}

  getPhoneTypes(subsidiary?: ISubsidiary): Observable<Array<PhoneType>> {
    let phoneTypes: PhoneType[] = DEFAULT_PHONE_TYPES;
    if (subsidiary?.countryCode === 'UG') {
      phoneTypes = [
        { value: 'HOMETELEX', localetext: 'Home Telex' },
        { value: 'COMMPH1', localetext: 'Communication Phone 1' },
        { value: 'COMMPH2', localetext: 'Communication Phone 2' },
        { value: 'REGPH1', localetext: 'Registered Phone 1' },
        { value: 'TELEX', localetext: 'Telex' },
        { value: 'FAX2', localetext: 'Fax 2' },
        { value: 'PAGER', localetext: 'Pager' },
        { value: 'COMMTELEX', localetext: 'Communication Telex' },
        { value: 'HOMEPH1', localetext: 'Home Phone 1' },
        { value: 'FAX1', localetext: 'Fax 1' },
        { value: 'HOMEPH2', localetext: 'Home Phone 2' },
        { value: 'WORKPH2', localetext: 'Work Phone 2' },
        { value: 'WORKPH1', localetext: 'Work Phone 1' },
        { value: 'CELLPH', localetext: 'Cell Phone' },
        { value: 'WORKTELEX', localetext: 'Work Telex' },
        { value: 'REGPH2', localetext: 'Registered Phone 2' },
      ];
    }
    if (subsidiary?.countryCode === 'SS') {
      phoneTypes = [
        { value: 'COMMPH1', localetext: 'Communication Phone 1' },
        { value: 'TELEX', localetext: 'Telex' },
        { value: 'FAX1', localetext: 'Fax 1' },
        { value: 'PAGER', localetext: 'Pager' },
        { value: 'REGPH2', localetext: 'Registered Phone 2' },
        { value: 'CELLPH', localetext: 'Cell Phone' },
        { value: 'HOMEPH1', localetext: 'Home Phone 1' },
        { value: 'WORKPH2', localetext: 'Work Phone 2' },
        { value: 'WORKPH1', localetext: 'Work Phone 1' },
        { value: 'FAX2', localetext: 'Fax 2' },
        { value: 'HOMEPH2', localetext: 'Home Phone 2' },
        { value: 'REGPH1', localetext: 'Registered Phone 1' },
        { value: 'COMMTELEX', localetext: 'Communication Telex' },
        { value: 'COMMPH2', localetext: 'Communication Phone 2' },
        { value: 'WORKTELEX', localetext: 'Work Telex' },
        { value: 'HOMETELEX', localetext: 'Home Telex' },
      ];
    }
    return of(
      phoneTypes.sort((a, b) => a.localetext.localeCompare(b.localetext))
    );
  }

  getEmailTypes(_subsidiary?: ISubsidiary): Observable<Array<EmailType>> {
    const emailTypes = DEFAULT_EMAIL_TYPES;
    return of(
      emailTypes.sort((a, b) => a.localetext.localeCompare(b.localetext))
    );
  }

  public generateOTP(data: any, ticketId?: string): Observable<any> {
    let url = otpAPIs['v1'].generate;
    if (ticketId) url = otpAPIs['v2'].generate + ticketId;
    return this.api.post<any>(url, data);
  }

  public validateOTP(data: any, ticketId?: string): Observable<any> {
    let url = otpAPIs['v1'].validate;
    if (ticketId) url = otpAPIs['v2'].validate + ticketId;
    return this.api.post<any>(url, data);
  }

  public regenerateOTP(data: any, ticketId?: string): Observable<any> {
    let url = otpAPIs['v1'].regenerate;
    if (ticketId) url = otpAPIs['v2'].regenerate + ticketId;
    return this.api.post<any>(url, data);
  }

  public performPhoneNumberDedupe(phone: string): Observable<any> {
    return this.api
      .post<any>(
        '/v2/accounts/Onboarding/dedupe',
        {
          bank: this._session.subsidiary.bankId,
          params: [{ type: 'phone', value: phone }],
        },
        { headers: { skipLoadingInterceptor: '1' } }
      )
      .pipe(map((res: any) => res.responseObject?.[0]?.details || []));
  }

  public performEmailDedupe(email: string): Observable<any> {
    return this.api
      .post<any>(
        '/v2/accounts/Onboarding/dedupe',
        {
          bank: this._session.subsidiary.bankId,
          params: [{ type: 'email', value: email }],
        },
        { headers: { skipLoadingInterceptor: '1' } }
      )
      .pipe(map((res: any) => res.responseObject?.[0]?.details || []));
  }
}

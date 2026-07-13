import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Channel,
  LinkedProfileAccount,
} from '@app/home/customer/channels/channels.model';
import {
  IKnownAgent,
  IKnownAgentFunctions,
} from '@app/home/customer/known-agent/models/known-agent.models';
import { AgentUploadDocumentPayload } from '@app/shared/models/agent.model';
import {
  ICifInquiryResponse,
  MandateInqResponse,
  SegmentationResponse,
} from '@app/shared/models/common';
import { AccountMgt } from '@app/shared/models/common/account.model';
import { ApprovalStatus } from '@app/shared/models/common/ticket.model';
import { IHttpOptions } from '@app/shared/services/api.service';
import { environment } from '@env/environment';
import { BehaviorSubject, map, Observable, of, catchError } from 'rxjs';
import { ApiService, SessionService } from '@app/shared/services';
import { DatePipe } from '@angular/common';
import { shareReplay, timeout } from 'rxjs/operators';
import { ICountryInfo } from '@app/shared/models/country-info';
import { GeneralResponse } from '@app/shared/components/table-data/models/menu-button-action.models';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  public ADDITIONAL_ACCOUNT_CACHE_KEY: string = 'cifValues';
  public TICKET_CACHE_KEY: string = 'ticketId';
  public ACCOUNT_KEY = 'accounts';
  countriesInfoData$!: Observable<ICountryInfo[]>;
  private baseUrl = environment.apiUrl;

  bankId: string = '54';
  private customerImagesSubject = new BehaviorSubject<any | null>(null);
  customerImagesSubject$ = this.customerImagesSubject.asObservable();

  constructor(
    private api: ApiService,
    private http: HttpClient,
    private datePipe: DatePipe,
    private sessionService: SessionService
  ) {}

  setCustomerImages(images: any) {
    this.customerImagesSubject.next(images);
  }

  public getAccount(
    values: string,
    skipLoadingInterceptor = false
  ): Observable<any> {
    return this.api.get<any>('/v1/account' + values, {
      headers: { skipLoadingInterceptor: String(skipLoadingInterceptor) },
    });
  }

  public verifyAccount(value: any): Observable<any> {
    return this.api.post<any>('/v1/backoffice/account/verify', value);
  }

  public cifInquiryV2(isBusiness: boolean, values: any): Observable<any> {
    const cache = JSON.parse(<string>localStorage.getItem('globalCache'));
    if (
      cache &&
      cache?.inquiry &&
      cache?.inquiry?.localCif === values.customerId &&
      cache?.inquiry?.localBankId === values.bankId
    ) {
      //console.log('returning cache', cache.inquiry);
      return of(cache.inquiry);
    }

    const url = `${
      isBusiness ? '/v2/account/business/cif/inquiry' : '/v2/account/cifinquiry'
    }`;
    return this.api.post<any>(url, values);
  }

  public fetchPhoto(
    cif: { customerId: string; accountid?: string },
    version: 'v1' | 'v2' = 'v1',
    options?: IHttpOptions
  ): Observable<any> {
    return version === 'v1'
      ? this.api.post<any>(`/v1/account/photo`, cif, options)
      : this.api.post<any>(
          `/v2/account/photo`,
          {
            customerId: cif.customerId,
            AccountId: cif.accountid,
          },
          options
        );
  }

  public fetchPhotoAdditionalAcc(payload: any): Observable<any> {
    return this.api.post<any>(`/v1/account/photo`, payload);
  }

  activateDormantAccount(accountNumber: string, parentTicketId?: string) {
    const payload = parentTicketId
      ? { Accounts: [accountNumber], parentTicketId: parentTicketId }
      : { Accounts: [accountNumber] };

    return this.api.post<any>('/v1/backoffice/account/activate', payload);
  }

  /**
   * Activate Dormant Accounts
   * @param accountsArray
   * @returns postObservable
   * 1. This method accepts an array of string account values to allow activation of multiple dormant accounts.
   * 2. Submits it to an activation endpoint
   *
   */

  activateDormantAccounts(accountsArray: any, cif: string) {
    return this.api.post<any>('/v2/backoffice/account/activate', {
      Cif: cif,
      ActivateAll: true,
      Accounts: accountsArray,
      AssociatedId: '',
    });
  }

  public sendNotification(payload: any): Observable<any> {
    return this.api.post<any>(`/v1/notification`, payload);
  }

  public getAccDetails(
    CustomerId: string,
    AccountNumber: string,
    PhoneNumber: string,
    skipLoadingInterceptor?: boolean
  ): Observable<any> {
    const data: any = { CustomerId, AccountNumber, PhoneNumber };
    return this.api.post<any>('/v1/adminportal/profiledetails', data, {
      headers: { skipLoadingInterceptor: String(skipLoadingInterceptor) },
    });
  }

  public getTicketDocs(data: any, version = 'v3'): Observable<any> {
    return this.api.post<any>(`/${version}/documents/search`, data);
  }

  public getTicketDoc(data: any, version = 'v1'): Observable<any> {
    //TODO check ApiService because only accept JSON request on the headers
    // application/octet-stream are needed
    return this.http.post<any>(
      environment.apiUrl + `/${version}/documents/download`,
      data,
      { responseType: 'blob' as 'json' }
    );
    //return this.api.post<any>('/v1/documents/download', data);
  }

  public postCreateAccount(id: any): Observable<any> {
    const options = { headers: { 'Content-Type': 'application/json' } };
    return this.api.post<any>(
      `/v3/backoffice/individualaccount/${id}/create-account`,
      ' ',
      options
    );
  }

  // public schemeCodeData(): Observable<any> {
  //     const url = urlList.dataLookup.getSchemeCodeData;
  //     return this.http.get<any>(url);
  //   }

  getCountriesInfo(): Observable<ICountryInfo[]> {
    if (!this.countriesInfoData$)
      // Use /v1/datalookup/countryInfo - for subsidiaries only
      this.countriesInfoData$ = this.api
        .get<ICountryInfo[]>('/v1/datalookup/countries')
        .pipe(shareReplay<any>(), timeout(15000));
    return this.countriesInfoData$;
  }

  public getAccountSignatories(data: {
    AccountId: string;
    BankId: string;
  }): Observable<MandateInqResponse> {
    return this.api.post<any>('/v1/account/mandate-signatory-inquiry', data);
  }
  public getPrevSignatories(data: {
    AccountId: string;
    BankId: string;
  }): Observable<MandateInqResponse> {
    return this.api.post<any>(
      '/v1/account/mandate-signatory-inquiry-unfiltered',
      data
    );
  }

  public createTicketAdditionalAccount(data: any): Observable<any> {
    return this.api.post<any>(
      '/v2/backoffice/individualaccount/additional-account-create-ticket',
      data
    );
  }

  public getAllMISCodes(): Observable<any[]> {
    return this.api.get<{responseObject: any[]}>('/v1/backoffice/onboarding/freeCodes')
      .pipe(
        map(response => response.responseObject || [])
      );
  }

  public getMISCodesByType(type: 'FREE_CODE_3' | 'FREE_CODE_5' | 'FREE_CODE_7' | 'FREE_CODE_8'): Observable<any[]> {
    return this.api.get<{responseObject: any[]}>(`/v1/backoffice/onboarding/freeCodesByType/${type}`)
      .pipe(
        map(response => response.responseObject || [])
      );
  }

  // get list of dropdown valxues on static data update form
  public getDropdown(skipLoadingInterceptor?: boolean): Observable<any> {
    return this.api.get<any>(
      '/v1/backoffice/StaticDataUpdatePersonal/populate-dropdown',
      {
        headers: {
          skipLoadingInterceptor: String(skipLoadingInterceptor),
        },
      }
    );
  }

  public getCountryInfo(): Observable<any> {
    return this.api.get<any>('/v1/datalookup/countryInfo');
  }

  public postSignDocument(id: string, values: {}): Observable<any> {
    const url =
      environment.apiUrl +
      '/v1/backoffice/individualaccount/' +
      id +
      '/sign-document';
    return this.http.post<any>(url, values);
  }

  public postSignatorySignDocument(
    ticketId: string,
    values: {}
  ): Observable<any> {
    const url =
      environment.apiUrl +
      '/v1/backoffice/signatory/' +
      ticketId +
      '/upload-documents';
    return this.http.post<any>(url, values);
  }

  public postPassportAndSignature(data: any): Observable<any> {
    // console.log(data);
    return this.api.post<any>('/v1/account/uploadphoto', data);
  }

  public enrollBio(url: string, values: any): Observable<any> {
    return this.api.post<any>(url, values);
  }

  getCustomerStatistics(
    customerCif: string,
    skipLoadingInterceptor?: boolean
  ): Observable<any> {
    let url = '/v1/taskservice/adminportal/statistics/actionName';
    if (
      window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
      window.location.hostname ===
        'servicehub-customer-360-uat.equitygroupholdings.com' ||
      window.location.hostname === 'localhost'
    ) {
      url = '/v1/taskservice-v1/adminportal/statistics/actionName';
    }
    return this.api.post<any>(
      url,
      {
        CustomerId: customerCif,
        ActionName: 'BlockProfile',
      },
      {
        headers: {
          skipLoadingInterceptor: String(skipLoadingInterceptor),
        },
      }
    );
  }

  public createChequeBookRequest(payload: any): Observable<any> {
    return this.api.post<any>(
      '/v1/backoffice/chequebookticket/create',
      payload
    );
  }
  public getDedupeCheck(values: any): Observable<any> {
    const url = '/v2/account/cif/dupecheck' + values;
    return this.api.get<any>(url);
  }

  // validate with IPRS
  public postValidatePersonalDetails(data: any): Observable<any> {
    return this.api.post<any>(`/v1/validate/identity`, data);
  }

  public verifyKRA(value: any): Observable<any> {
    // return this.http.post(`${environment.apiUrl}/v1/kra/details`, value ) ;
    return this.api.post<any>(`/v1/kra/details`, value);
  }

  public createTicketKnownAgent(value: any): Observable<any> {
    return this.api.post<any>(`/v1/backoffice/KnownAgent/create`, value);
  }

  public submitTransactionDocuments(id: any, data: any): Observable<any> {
    return this.api.post<any>(
      `/v1/backoffice/KnownAgent/${id}/submit-documents`,
      {}
    );
  }

  public submitTransactionDocumentsV2(
    ticketId: string,
    options?: { documentIds?: string[] }
  ): Observable<any> {
    const payload = options || {};
    return this.api.post<any>(
      `/v3/backoffice/tickets/${ticketId}/AddKnownAgentFlowV2/ConfirmUploadedDocumentsPartial/invoke`,
      payload
    );
  }

  public submitTransactionDocumentsV3(ticketId: string): Observable<any> {
    return this.api.post<any>(
      `/v3/backoffice/tickets/${ticketId}/RemoveKnownAgentFlowV2/ConfirmUploadedDocumentsPartial/invoke`,
      {}
    );
  }

  public getKnownAgents(accountNumber: string): Observable<{
    responseObject: IKnownAgent[];
    statusCode: string;
    statusMessage: string;
    successful: boolean;
  }> {
    return this.api.get<any>(
      `/v1/knownagentservice-v1/api/agents/GetAgentsByAccount/${accountNumber}`,
      {
        headers: { skipToast: 'true', skipLoadingInterceptor: 'true' }
      }
    ).pipe(
      catchError(error => {
        console.error('Error fetching known agents:', error);
        return of({
          responseObject: [],
          statusCode: '500',
          statusMessage: 'Failed to load known agents',
          successful: false
        });
      })
    );
  }

  public getKnownAgentsByCif(
    accountNumber: string,
    agentCif: number
  ): Observable<IKnownAgent[]> {
    return this.api
      .get<{
        responseObject: IKnownAgent[];
        statusCode: string;
        statusMessage: string;
        successful: boolean;
      }>(
        `/v1/knownagentservice-v1/api/agents/GetAgentsByAccount/${accountNumber}`,
        {
          headers: { skipToast: 'true', skipLoadingInterceptor: 'true' }
        }
      )
      .pipe(
        map(data => {
          return data.responseObject.filter(
            agent => +agent.custId === agentCif && agent.deleted === 'N'
          );
        }),
        catchError(error => {
          console.error('Error fetching known agents by CIF:', error);
          return of([]);
        })
      );
  }

  public getKnownAgentsFunctions(): Observable<{
    responseObject: IKnownAgentFunctions[];
    statusCode: string;
    statusMessage: string;
    successful: boolean;
  }> {
    return this.api.get<any>(
      `/v1/knownagentservice-v1/api/agents/GetKnownAgentFunctions`
    );
  }

  public verifyCustomerBio(
    id: string,
    data: any,
    skipBio = false
  ): Observable<any> {
    const endpoint = skipBio ? 'verify-bio' : 'skipbio';
    return this.api.post<any>(
      `/v1/backoffice/KnownAgent/${id}/${endpoint}`,
      data
    );
  }

  public submitStatusKnownAgents(
    ticketId: string,
    data: any,
    status: ApprovalStatus = ApprovalStatus.APPROVE
  ) {
    switch (status) {
      // case ApprovalStatus.APPROVE:
      //     return this.api.post<any>(
      //         `/v1/backoffice/knownagent/${ticketId}/approve`,
      //         data
      //     );
      //return this.api.post<any>(`/v1/backoffice/profilerequest/${ticketId}/approve`, data);
      default:
        return this.api.post<any>(`/v1/backoffice/update`, data);
    }
  }

  public getCustomerNotPresentActions(): Observable<any> {
    return this.api.get<any>(`/v1/backoffice/profilerequest/actions`);
  }

  public submitCustomerNotPresentViewProfileTicket(
    id: string
  ): Observable<any> {
    return this.api.post<any>(
      `/v1/backoffice/profilerequest/${id}/submit`,
      null
    );
  }

  public createCustomerNotPresentViewProfileTicket(data: any): Observable<any> {
    return this.api.post<any>(`/v1/backoffice/profilerequest/create`, data);
  }

  public getProfileRequestApprove(
    ticketId: string,
    data: any,
    status: ApprovalStatus = ApprovalStatus.APPROVE
  ): Observable<any> {
    switch (status) {
      case ApprovalStatus.APPROVE || ApprovalStatus.REJECT:
        return this.api.post<any>(
          `/v1/backoffice/profilerequest/${ticketId}/approve`,
          data
        );
      default:
        return this.api.post<any>(`/v1/backoffice/update`, data);
    }
  }

  public updateProfileAccessTicket(
    ticketId: string,
    data: any
  ): Observable<any> {
    return this.api.post<any>(
      `/v1/backoffice/profilerequest/${ticketId}/approve`,
      data
    );
  }

  public submitStatus(
    ticketId: string,
    data: any,
    status: ApprovalStatus = ApprovalStatus.APPROVE
  ): Observable<any> {
    return this.api.post<any>(`/v1/backoffice/update`, data);
    // switch (status) {
    //     case ApprovalStatus.APPROVE:
    //         return this.api.post<any>(`/v1/backoffice/profilerequest/${ticketId}/approve`, data);
    //     default:
    //         return this.api.post<any>(`/v1/backoffice/update`, data);
    // }
  }

  public getStakeHolders(
    accountNumber: string,
    bankId: string
  ): Observable<any> {
    return this.api.get<any>(
      `/v1/account/stakeholders?accountNumber=${accountNumber}&bankId=${bankId}`
    );
  }

  public getProfileActions(): Observable<any> {
    const url = 'assets/data/profileactions.json';
    return this.http.get<any>(url);
  }
  public verifyDormantAcc(ticketId: string, value: any): Observable<any> {
    const url =
      environment.apiUrl + '/v1/backoffice/account/' + ticketId + '/verify-bio';
    return this.http.post<any>(url, value);
  }

  public clearAccountInquiryCache(values?: string): Observable<any> {
    return this.api.get<any>('/v1/account/reload' + values);
  }

  public clearAccountCache(): Observable<any> {
    return this.http.get(environment.apiUrl + '/v1/account/reload');
  }

  public getCustomerDepositAccounts(customerCif: string): Observable<any> {
    // return this.http.get(`${environment.apiUrl}/${this.saveDepositPath()}/${customerCif}/accounts?actionFlow=FixedDepositFlow&currencyCode=KES`);
    return this.http.get(
      `${
        environment.apiUrl
      }/${this.saveDepositPath()}/${customerCif}/depositaccounts`
    );
  }

  public submitBreakDepositAccount(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/${this.saveDepositPath()}/submit-break`,
      data
    );
  }

  public skipDepositBio(ticketId: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/${this.saveDepositPath()}/${ticketId}/skip-bio`,
      null
    );
  }

  public verifyDepositBio(data: any, ticketId: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/${this.saveDepositPath()}/${ticketId}/verify-bio`,
      data
    );
  }

  public uploadAgentDocuments(data: AgentUploadDocumentPayload) {
    return this.api.post<any>(
      `/v1/knownagentservice-v1/api/agents/uploaddocuments`,
      data
    );
  }

  public uploadTransactionDocumentsV3(
    data: any,
    action?: string
  ): Observable<any> {
    switch (action) {
      //custom upload endpoint depending on the action
      case 'RequestAccountBalance':
        return this.http.post(
          `${environment.apiUrl}/v1/backoffice/BalanceRequest/upload-document`,
          data
        );
      case 'knownAgent':
        return this.api.post<any>(`/v3/documents/submit`, data);
    }

    if (
      window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
      window.location.hostname ===
        'servicehub-customer-360-uat.equitygroupholdings.com'
    ) {
      return this.api.post<any>(`/v3/documents/submit`, data);
    }
    return this.api.post<any>(`/v3/documents/submit`, data);
  }

  updateTicketStatus(
    ticketId: string | number,
    status: string
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/KnownAgent/${ticketId}/status`, {
      status,
    });
  }

  public uploadTransactionDocuments(
    data: any,
    action?: string
  ): Observable<any> {
    switch (action) {
      //custom upload endpoint depending on the action
      case 'RequestAccountBalance':
        return this.http.post(
          `${environment.apiUrl}/v1/backoffice/BalanceRequest/upload-document`,
          data
        );
      //force to always use v2
      case 'knownAgent':
        return this.api.post<any>(`/v2/documents/submit`, data);
    }

    if (
      window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
      window.location.hostname ===
        'servicehub-customer-360-uat.equitygroupholdings.com'
    ) {
      return this.api.post<any>(`/v2/documents/submit`, data);
    }
    return this.api.post<any>(`/v2/documents/submit`, data);
  }

  public getCurrentAccounts(): AccountMgt.Account[] {
    return JSON.parse(<string>localStorage.getItem(this.ACCOUNT_KEY));
  }

  private saveDepositPath(): string {
    const isDevEnv =
      environment.apiUrl === 'https:api-omnichannel-dev.azure-api.net' ||
      environment.apiUrl === 'http:localhost:4200' ||
      environment.apiUrl === 'https://api-dev.equitygroupholdings.com';

    return isDevEnv ? '/v1/backoffice/deposits' : '/term-deposit';
  }

  public getLinkedProfileAccounts(
    customerCif: string,
    skipLoadingInterceptor?: boolean
  ) {
    return this.http.get<LinkedProfileAccount>(
      `${environment.apiUrl}/v1/adminportal/getprofileaccounts?cif=${customerCif}`,
      {
        headers: {
          skipLoadingInterceptor: String(skipLoadingInterceptor),
          skipToast: 'true'
        },
      }
    ).pipe(
      catchError(error => {
        console.error('Error fetching linked profile accounts:', error);
        return of({
          responseObject: [],
          statusCode: error.status?.toString() || '400',
          statusMessage: 'Failed to load profile accounts',
          successful: false
        } as LinkedProfileAccount);
      })
    );
  }
  public getPayPalAccounts(customerCif: string) {
    return this.http.get<any>(
      `${environment.apiUrl}/v1/backoffice/profilebackoffice/paypal-profile/${customerCif}`
    );
  }

  public getCustomerAccounts(customerCif: string) {
    return this.http.get<any>(
      `${environment.apiUrl}/v1/account?Id=${customerCif}&bankId=${this.bankId}&idType=customerid&reloadFromCache=false`
    );
  }

  public getRefreshCacheCustomerAccounts(customerCif: string) {
    this.bankId = this.sessionService.userBank;

    return this.http.get<any>(
      `${environment.apiUrl}/v1/account?Id=${customerCif}&idType=customerid&bankId=${this.bankId}&reloadFromCache=false`
    );
  }

  public getSpecialForexRates(
    cif: string,
    rateStatus: string,
    pageIndex: number,
    pageSize: number,
    filters?: any
  ) {
    let params = new HttpParams();
    const filterKeys = Object.keys(filters);

    filterKeys.forEach(key => {
      if (!filters[key] || (key === 'status' && filters[key] === 'All')) return;
      params = params.set(key, filters[key]);
    });

    return this.api
      .get(
        `/v1/backofficesupport/special-rate-transactions?cif=${cif}&rateStatus=${rateStatus}&pageSize=${pageSize}&page=${pageIndex}&` +
          params.toString()
      )
      .pipe(
        map((res: any) => {
          if (res.statusCode === '00') {
            return res.responseObject;
          } else {
            return of([]);
          }
        })
      );
  }

  private specialRates$: BehaviorSubject<any> = new BehaviorSubject([]);

  public getSpecialRatesObs() {
    return this.specialRates$.asObservable();
  }

  public updateSpecialRates(data: any[]) {
    return this.specialRates$.next(data);
  }

  get localDateTime(): string {
    return <string>(
      this.datePipe.transform(`${new Date()} UTC`, 'yyyy-MM-ddThh:mm:ss')
    );
  }

  getBusinessInquiry(
    customerID: number,
    bankId: string = this.sessionService.userBank
  ): Observable<ICifInquiryResponse> {
    return this.api.post<any>(`/v1/bsh/v1/account/business/cif/inquiry`, {
      BankId: bankId,
      CustomerID: customerID,
    });
  }

  getSegmentation(customerID: number): Observable<{
    statusMessage: string;
    statusCode: string;
    successful: boolean;
    responseObject: SegmentationResponse;
  }> {
    return this.api.get(`/v1/customer/segmentation/${customerID}`);
  }

  delinkAccount(payload: any): Observable<ICifInquiryResponse> {
    return this.api.post<any>(
      `/v1/backoffice/profilebackoffice/delinkaccount`,
      payload
    );
  }

  delinkPayPalAccount(payload: any): Observable<ICifInquiryResponse> {
    return this.api.post<any>(
      `/v1/backoffice/profilebackoffice/delinkPayPalAccount`,
      payload
    );
  }

  linkAccount(payload: any): Observable<ICifInquiryResponse> {
    return this.api.post<any>(
      `/v1/backoffice/profilebackoffice/restoreaccount`,
      payload
    );
  }

  public getlookup(values: string[]): Observable<any> {
    let params = '';
    values.forEach(value => {
      params += `names=${value}&`;
    });
    const url = `/v1/backoffice/lookup?${params}`;
    return this.api
      .get<GeneralResponse>(url)
      .pipe(map(response => response.responseObject));
  }

  public getLookupWithSearch(
    lookupName: string,
    searchTerm?: string
  ): Observable<any> {
    const url = `/v1/backoffice/lookup?names=${lookupName}${searchTerm ? `&searchTerm=${searchTerm}` : ''}`;
    return this.api.get<GeneralResponse>(url).pipe(
      map(response => {
        const lookupData = response.responseObject[lookupName];
        // Return just the text value from the first matching result
        return lookupData[0]?.text || '';
      })
    );
  }

  public saveTaskData(ticketId: string, actionFlow: string): Observable<any> {
    return this.api.post(
      `/v3/backoffice/tickets/${ticketId}/${actionFlow}/SaveTaskData/invoke`,
      {}
    );
  }
  public reConfirmDocumentsUpload(
    ticketId: string,
    actionFlow: string
  ): Observable<any> {
    return this.api.post(
      `/v3/backoffice/tickets/${ticketId}/${actionFlow}/ReConfirmUploadedDocumentsPartial/invoke`,
      {}
    );
  }

  public updateTicketTaskData(
    ticketId: string,
    actionFlow: string,
    data: any
  ): Observable<any> {
    return this.api.post(
      `/v3/backoffice/tickets/${ticketId}/${actionFlow}/setData`,
      data
    );
  }

  public invokeSkipBioCheckerApproval(ticketId: string): Observable<any> {
    return this.api.post(
      `/v3/backoffice/tickets/${ticketId}/SkipBio/CheckerApproval/invoke`,
      {}
    );
  }
}

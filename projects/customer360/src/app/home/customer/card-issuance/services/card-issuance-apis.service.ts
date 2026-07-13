import { Injectable } from '@angular/core';
import { ApiService } from '@shared/services';
import { Observable, of } from 'rxjs';
import {
  CardIssuanceDocCodeResponseT,
  CardIssuanceDocsPayloadT,
  CardProductTypesResponse,
  CreateIssuanceTicketPayloadT,
  DocumentsUploadResponseT,
  InstantCardIssuanceDataSubmitPayloadT,
  InstantIssuanceDocsPayloadDataT,
  PanValidationPayloadT,
  PremiumCardIssuanceDataSubmitPayloadT,
  StaffInventoryResponseT,
} from '@app/home/customer/card-issuance/card-issuance.models';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CardIssuanceApisService {
  constructor(private api: ApiService) {}
  public getProductTypes(
    queryParams: { countryCode: string },
    skipLoadingInterceptor?: boolean
  ): Observable<CardProductTypesResponse> {
    return this.api
      .get<CardProductTypesResponse>(`/v1/card-service/producttypes`, {
        queryParams,
        headers: {
          skipLoadingInterceptor: String(skipLoadingInterceptor),
        },
      })
      .pipe(
        map(response => {
          return {
            responseObject: [
              ...response.responseObject,
              ...this.mockProductTypes,
            ],
            statusCode: '200',
            statusMessage: 'success',
            successful: true,
          };
        })
      );
  }

  public fetchBranches(bankId: string): Observable<any> {
    const url = `/v1/backoffice/misc/branches?bankId=${bankId}`;
    return this.api
      .get<any>(url, {
        headers: {
          skipLoadingInterceptor: String(true),
        },
      })
      .pipe(
        map((response: any) => response.responseObject),
        catchError((error: HttpErrorResponse) =>
          of({
            statusCode: error.status,
            statusMessage: error.message,
            successful: false,
            responseObject: null,
          })
        )
      );
  }

  mockProductTypes: any = [
    {
      categoryId: '5',
      categoryName: 'A',
      code: 'MMS_068',
      countryCode: 'KE',
      fullName: 'Premium card 1',
      group: 'PREMIUM',
      id: 200,
      name: 'Premium card 1',
    },
    {
      categoryId: '5',
      categoryName: 'A',
      code: 'MMS_068',
      countryCode: 'KE',
      fullName: 'Prepaid card 1',
      group: 'PREPAID',
      id: 201,
      name: 'Prepaid card 1',
    },
  ];

  createInstantCardIssuanceTicket(data: CreateIssuanceTicketPayloadT) {
    return this.api.post<any>('/v3/backoffice/tickets/create', {
      data,
      headers: {
        skipLoadingInterceptor: String(true),
      },
    });
  }

  getCardTypeCharges(queryParams: { productTypeId: string }) {
    return this.api.get<any>(`/v1/card-service/charges`, {
      queryParams,
      headers: {
        skipLoadingInterceptor: String(true),
      },
    });
  }

  validatePan(data: PanValidationPayloadT) {
    return this.api.post<any>(`/v1/card/validatePan`, data, {
      headers: {
        skipLoadingInterceptor: String(true),
      },
    });
  }
  validatePanV2(data: { Pan: string }) {
    return this.api.post<any>(`/v1/card-service/issuance/validate`, data, {
      headers: {
        skipLoadingInterceptor: String(true),
      },
    });
  }

  getDocCodes(
    ticketID: string,
    actionFlowName: string
  ): Observable<CardIssuanceDocCodeResponseT> {
    return this.api.post<any>(
      `/v3/backoffice/tickets/${ticketID}/${actionFlowName}/GetListOfDocumentsPartial/invoke?returnTaskData=True`,
      '',
      {
        headers: {
          skipLoadingInterceptor: String(true),
        },
      }
    );
  }

  confirmDocumentUpload(
    ticketID: string,
    actionFlowName: string,
    data: { documentIds?: string[] } = {}
  ): Observable<CardIssuanceDocCodeResponseT> {
    return this.api.post<any>(
      `/v3/backoffice/tickets/${ticketID}/${actionFlowName}/ConfirmUploadedDocumentsPartial/invoke`,
      data,
      {
        headers: {
          skipLoadingInterceptor: String(true),
        },
      }
    );
  }

  submitInstantCardIssuanceData(data: InstantCardIssuanceDataSubmitPayloadT) {
    // return of(this.issuanceResponseMock());
    return this.api.post<any>(`/v1/card-service/issuance/instant`, data);
  }

  submitPremiumCardIssuanceData(data: PremiumCardIssuanceDataSubmitPayloadT) {
    return this.api.post<any>(`/v1/card-service/issuance/premium`, data);
  }
  getStaffInventory(
    queryParams: { userId: string },
    skipLoadingInterceptor?: boolean
  ): Observable<StaffInventoryResponseT> {
    return this.api.get<any>(`/v1/card-service/staffinventory`, {
      queryParams,
      headers: { skipLoadingInterceptor: String(skipLoadingInterceptor) },
    });
  }

  uploadIssuanceDocs(
    data: CardIssuanceDocsPayloadT
  ): Observable<DocumentsUploadResponseT> {
    return this.api.post<any>(`/v3/documents/submit`, data);
  }

  public submitTransactionDocumentsV3(
    ticketId: string,
    actionFlow: string,
    options: { documentIds?: string[] }
  ): Observable<any> {
    return this.api.post<any>(
      `/v3/backoffice/tickets/${ticketId}/${actionFlow}/ConfirmUploadedDocumentsPartial/invoke`,
      options
    );
  }

  issuanceResponseMock() {
    return {
      responseObject: {
        ticketId: 89642,
        requestModel: {
          accountDetails: {
            accountNumber: '0350185780679',
            accountName: 'JACKSON TEKENTAI',
            accountCurrency: 'KES',
            firstName: 'J',
            lastName: 'TEKENTAI',
            regNumber: '8659268',
            regNumberType: null,
            phoneNumber: '254721480230',
            cif: '54307924578',
            bankId: null,
            branchId: null,
          },
          cardDetails: {
            cardType: 'VISA CLASSIC CREDIT',
            cardCurrency: 'KES',
            embossingName: 'JACKSON TEKENTAI',
            dailyCashWithdrawalLimit: 0.0,
            dailyEcommerceTransactionLimit: 0.0,
            pan: '1000000068071198',
            productTypeId: 21,
            productCode: null,
            productTypeName: null,
            productCategoryName: null,
          },
          charges: {
            accountToDebit: '0350185780679',
            currency: 'KES',
            chargeAmount: 486.48,
            taxAmount: 97.3,
            waiveCharges: true,
          },
          info: {
            city: null,
            postalCode: null,
            addressLine1: null,
            birthName: null,
            birthDate: null,
            shortName: null,
            country: null,
            gender: null,
            language: null,
            maritalStatus: null,
          },
        },
      },
      statusCode: '00',
      statusMessage: 'Ticket created successfully',
      successful: true,
    };
  }
}

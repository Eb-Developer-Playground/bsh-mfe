import { inject, Injectable } from '@angular/core';
import {ApiService} from "@app/shared/services";
import {HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Channel} from "@app/home/customer/channels/channels.model";

@Injectable({
  providedIn: 'root'
})
export class TransactionLimitsService {
  private readonly api = inject(ApiService);

    getLimitsChannels(): Observable<any> {
        return this.api.get(
            `/v2/transactionlimits/limit-manager/channels?Order=0`
        );
    }


    getLimitTransactionTypes(): Observable<any> {
        return this.api.get(
            `/v2/transactionlimits/limit-manager/transactiontypes?Order=0`
        );
    }

    getSubsidiaries(
    ): Observable<any> {
        return this.api.get(
            `/v2/transactionlimits/limit-manager/subsidiaries?Order=0`
        );
    }

    getCustomerChannels(searchValue: string, searchParameter: string): Observable<Channel[]> {
        return this.api.get(`/v1/adminportal/getChannelAccounts?SearchValue=${searchValue}&SearchParameter=${searchParameter}`)
    }


    fetchPersonalizedLimits(
        pageSize: number,
        pageNumber: number,
        order: number,
        sortColumn: string | undefined,
        cif: string,
        accountNumber: string,
        SubsidiaryId: string,
        filters: any,
    ): Observable<any> {

        let params = new HttpParams();
        let filterKeys = Object.keys(filters);

        filterKeys.forEach((key) => {
            if (filters[key] && key !== 'description') {
                params = params.append(key, filters[key]);
            }
        });
        return this.api.get<any>(
            `/v1/transactionlimits/back-office/personalizedlimits?PageSize=${pageSize}&PageNumber=${pageNumber}&Order=${order}&SortColumn=${sortColumn}&Cif=${cif}&AccountNumber=${accountNumber}&SubsidiaryId=${SubsidiaryId}&` + params.toString()
        )
    }


    amendLimitPersonalisationSettings(data: any): Observable<any> {
        return this.api.post(
            '/v1/backoffice/profilebackoffice/limitPersonalization',
            data
        );
    }

    fetchTransactionLimitTypes = (filters: any): Observable<any> => {
        let params = new HttpParams();
        let filterKeys = Object.keys(filters);
        filterKeys.forEach(key => {
            if (filters[key] && key !== 'description') {
                params = params.append(key, filters[key]);
            }
        });
        return this.api.get(
            `/v1/transactionlimits/back-office?` +
            params.toString()
        );
    };

    public uploadTransactionLimitDocuments(data: any): Observable<any> {
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

    getSources(
    ): Observable<any> {
        return this.api.get(
            `/v2/transactionlimits/limit-manager/sources?Order=0`
        );
    }

    getCurrencies(): Observable<any> {
        return this.api.get(
            `/v1/datalookup/currency`
        )
    }
}

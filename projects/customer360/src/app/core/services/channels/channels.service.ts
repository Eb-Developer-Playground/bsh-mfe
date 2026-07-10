import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Channel,
  ChannelsResponse,
} from '@app/home/customer/channels/channels.model';
import { ApiService } from '@app/shared/services';
import { AccountManagementService } from '@app/core/services';

@Injectable({
  providedIn: 'root',
})
export class ChannelsService {
  private api = inject(ApiService);
  private accMgtService = inject(AccountManagementService);

  private customerStatus = new BehaviorSubject('');
  public customerStatusObs = this.customerStatus.asObservable();
  isBusiness: boolean = this.accMgtService.getIsCustomerBusiness();

    storeChannels() {
        let channelList: Channel[] = [
            {
                channel: "Web",
                status: "InActive",
                createdDate: "",
                blockReason: "",
                subChannel: "",
                level: -1,
                id: "web",
            },
            {
                channel: "Mobile",
                status: "InActive",
                createdDate: "",
                blockReason: "",
                subChannel: "iOS",
                level: -1,
                id: "mobile-iOS",
            },
            {
                channel: "Mobile",
                status: "InActive",
                createdDate: "",
                blockReason: "",
                subChannel: "Android",
                level: -1,
                id: "mobile-Android",
            },
            {
                channel: "USSD",
                status: "InActive",
                createdDate: "",
                blockReason: "",
                subChannel: "",
                level: -1,
                id: "USSD",
            },
            {
                channel: "Chatbot",
                status: "InActive",
                createdDate: "",
                blockReason: "",
                subChannel: "",
                level: -1,
                id: "chatbot",
            },
        ];
        localStorage.setItem("channels", JSON.stringify(channelList));
        localStorage.setItem("displayChannels", JSON.stringify(channelList));
    }

    getCustomerChannels(
        bankId: string,
        customerId: string,
        skipLoadingInterceptor?: boolean
    ): Observable<ChannelsResponse> {
        return this.api.get(`/v1/adminportal/${customerId}?bankid=${bankId}`,{
            headers: { skipLoadingInterceptor: String(skipLoadingInterceptor) },
        });
    }

    getChannels(searchValue: string, searchParamater: string): Observable<Channel[]> {
        return this.api.get(`/v1/adminportal/getChannelAccounts?SearchValue=${searchValue}&SearchParameter=${searchParamater}`)
    }

  updateCustomerStatus(value: any) {
    this.customerStatus.next(value);
  }

  private transActivities$ = new BehaviorSubject<any[]>([]);

  public getTransActivitiesObs() {
    return this.transActivities$.asObservable();
  }

  public updateTransActivities(data: any[]) {
    return this.transActivities$.next(data);
  }

    public fetchTransActivities(
        skipLoadingInterceptor: boolean,
        pageIndex: number,
        pageSize: number,
        filters?: any
    ) {
        let params = new HttpParams();
        const filterKeys = Object.keys(filters);
        filterKeys.forEach(key => {
            if (
                filters[key] !== null &&
                filters[key] !== undefined
            ) {
                params = params.set(key, filters[key]);
            }
        });
            let url = `/v1/transactionstore/v1/transactions/search?pageSize=${pageSize}&pageNumber=${pageIndex + 1}&` +
            params.toString();
        return this.api.get(url, {
            headers: { skipLoadingInterceptor: String(skipLoadingInterceptor) }
        });
    };

  fetchTransactionTypes(): Observable<any>{
     return  this.api.get(``);
  };
  fetchSources(): Observable<any> {
      return this.api.get(``);
  };

  getJointAccSignatories(reference: string) {
    return this.api.get(
      `/v1/multiapproval/BackOfficeSupport/transactions/${reference}`
    );
  }

  restrictChannelAccount(data: any) {
    return this.api.post(
      `/v1/backoffice/profilebackoffice/restrictAccount`,
      data
    );
  }

  openBSS() {
    return this.api.post(`/v1/backoffice/bss/open`, {});
  }

  closeBSS(sessionId: string) {
    return this.api.post(`/v1/backoffice/bss/close/${sessionId}`, {});
  }
}

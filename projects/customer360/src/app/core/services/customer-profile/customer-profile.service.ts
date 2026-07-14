import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, map, of } from "rxjs";
import { ApiService } from "@app/shared/services";
import { environment } from "@env/environment";

@Injectable({
    providedIn: "root",
})
export class CustomerProfileService {
    private api = inject(ApiService);
    private http = inject(HttpClient);

    updateCustomerProfile = (data: any): Observable<any> => {
        return this.api.post<any>(
            `/v1/backoffice/AdminPortal/customer-profile`,
            data
        );
    };

    softDeleteProfile = (data: any) => {
        return this.http.post<any>(
            `${environment.apiUrl}/v1/backoffice/profilebackoffice/softDelete`,
            data
        );
    };

    public uploadSoftDeleteDocuments(data: any): Observable<any> {
        if (
            window.location.hostname ===
                "branchservicehub-customer-360-dev.azurewebsites.net" ||
            window.location.hostname ===
                "servicehub-customer-360-uat.equitygroupholdings.com"
        ) {
            return this.api.post<any>(`/v2/documents/submit`, data);
        }
        return this.api.post<any>(`/v2/documents/submit`, data);
    }

    getLinkedProfiles(profileId: string) {
        return this.api.get(
            `/v1/adminportal/getProfiles?profileId=${profileId}`
        );
    }

    fetchCustomerProfile = (data: any): Observable<any> => {

        const { cif, phone, email } = data;

        const url = `/v1/adminportal/getprofiles?phone=${phone}&email=${email}&cif=${cif}`;

        return this.api
            .get(url)
            .pipe(
                map((res: any) => {
                    if (res.statusCode === "00") {
                        return res.responseObject
                    } else {
                        return of([]);
                    }
                })
            );
    }


}

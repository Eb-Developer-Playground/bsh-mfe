import { inject, Injectable } from '@angular/core';
import { ApiService } from '@app/shared/services';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class CrmService {
    private readonly api = inject(ApiService);

    /**TODO:
     * Determine which APIs can fetch multiple information to reduce network overhead eg can currencies, and channels be received on one API?
     * Determine where the current branch is stored** (business unit)
     */

    fetchTickets(filters: any): Observable<any> {
        // NOTE: Has 2 query params: CustomerId && CountryCode
        let params = new HttpParams();
        let filterKeys = Object.keys(filters);
        filterKeys.forEach(key => {
            if (filters[key] && key !== 'description') {
                params = params.append(key, filters[key]);
            }
        });
        return this.api.get(
            `/v1/customersupportadmin/getallincidents?` + params.toString()
        );
    }

    fetchTicketById(ticketId: string): Observable<any> {
        return this.api.get<any>(`/v1/customersupportadmin/incident/${ticketId}`);
    }

    fetchTicketByTran(ticketId: string): Observable<any> {
        return this.api.get<any>(`/v1/customersupportadmin/incident/${ticketId}`);
    }

    fetchProducts(countryCode: string): Observable<any> {
        return this.api.get(`/v1/customersupportadmin/products/${countryCode}`);
    }

    fetchProductOptions(filters: any): Observable<any> {
        // NOTE: Has 2 query params: product && countryCode
        let params = new HttpParams();
        let filterKeys = Object.keys(filters);
        filterKeys.forEach(key => {
            if (filters[key] && key !== 'description') {
                params = params.append(key, filters[key]);
            }
        });
        return this.api.get(
            `/v1/customersupportadmin/product-details?` + params.toString()
        );
    }

    //NOTE: Remotely defined as issueCategoryTypes, changed from design
    fetchIncidentTypes(): Observable<any> {
        return this.api.get(`/v1/customersupportadmin/issuecategorytypes`);
    }

    fetchChannels(countryCode: string): Observable<any> {
        return this.api.get(`/v1/channels${countryCode}`);
    }

    fetchCategories(): Observable<any> {
        return this.api.get(`/v1/customersupportadmin/issuecategorytypes`);
    }

    postIncident(incidentData: any): Observable<any> {
        return this.api.post(
            `/v1/customersupportadmin/createincident`,
            incidentData
        );
        // customersupportadmin/createincident
        //     api/customersupport/createincident
    }

    fetchCurrencies(): Observable<any> {
        return this.api.get(`/v1/bsh/v1/datalookup/currency`);
    }

    fetchFileAttachment(incidentId: number, fileId: number): Observable<any> {
        return this.api.get(`/v1/customersupportadmin/incident/fileattachment/${incidentId}?fileAttachmentId=${fileId}`)
    }
}

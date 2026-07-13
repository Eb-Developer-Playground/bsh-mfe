import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@app/shared/services';

@Injectable({
  providedIn: 'root',
})
export class ChangeOfSignatureService {
  private api = inject(ApiService);

    submitIndividual(payload: SubmitSignaturePayload) {
        return this.api.post<any>(
            '/v1/backoffice/signature/submit-individual',
            payload
        );
    }

    submitJoint(payload: SubmitSignaturePayload) {
        return this.api.post<any>(
            '/v1/backoffice/signature/submit-joint',
            payload
        );
    }

  public uploadChangeOfSignatureDocuments(value: any): Observable<any> {
    if (
      window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
      window.location.hostname ===
        'servicehub-customer-360-uat.equitygroupholdings.com'
    ) {
      return this.api.post<any>(`/v2/documents/submit`, value);
    }
    return this.api.post<any>(`/v2/documents/submit`, value);
  }

    public submitChangeOfSignatureDocuments(id: any, value: any): Observable<any> {
        return this.api.post<any>(`/v1/backoffice/signature/${id}/upload-documents`, value)
    }

  public bioVerify(ticketId: string, bioModels?: any) {
    const payload = {
      bioModels,
    };
    return this.api.post<any>(
      `/v1/backoffice/signature/${ticketId}/bio-verify`,
      payload
    );
  }

  public skipBio(ticketId: string, bioModels?: any) {
    const payload = {
      bioModels,
    };
    return this.api.post<any>(
      `/v1/backoffice/signature/${ticketId}/skipbio`,
      payload
    );
  }
}

export interface SubmitSignaturePayload {
  customerDetails: {
    acctId: string;
    customerId: string;
    email: {
      id: string;
      emailAddress: string;
      emailType: string;
      comment: null;
      preferred: boolean;
    };
    phone: {
      id: string;
      code: string;
      number: string;
      comment: string;
      phoneType: string;
      preferred: boolean;
    };
    firstName: string;
    middleName: string;
    lastName: string;
    AcctId: string;
  };
  signaturePhotoData: {
    effectiveStartDate: string;
    reasonForChange: string;
    sigFile: string;
    sigEffDt: string;
    pictureFile: string;
    pictureEffDt: string;
  };
  parentTaskId: string;
  oldsignature: {
    signaturefield: string;
  };
}

export interface verifyBioPayload {
  bioModels: {
    cif: string;
    skipBio: true;
    fingerprints: {
      position: string;
      image: {
        format: string;
        resolutionDpi: number;
        data: string;
      };
    }[];
  }[];
}

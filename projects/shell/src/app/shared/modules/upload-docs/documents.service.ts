import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from 'src/app/shared/services/api.service';

import {
  IDocumentSpec,
  IFileParams,
  DocumentUploadServiceType,
  IUploadedDocument,
} from './models';
import * as constants from './constants';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  constructor(private apiService: ApiService) {}

  public getDocumentsFor(
    idTypeOrUseCase: string,
    eddRequired?: boolean,
    isUSCitizen?: boolean,
    useDefaultMaxSize?: boolean,
    secondaryIds?: Array<any>,
    isKenyanAbroad?: boolean
  ): Array<IDocumentSpec> {
    let documentNames: Array<string> = [];
    secondaryIds = secondaryIds || [];

    idTypeOrUseCase = idTypeOrUseCase.toLowerCase();

    if (
      idTypeOrUseCase !== 'jointaccount' &&
      idTypeOrUseCase !== 'existingjointaccountstakeholder' &&
      idTypeOrUseCase !== 'finacleuploadonly'
    )
      documentNames = [
        constants.PASSPORT_PHOTO_DOCUMENT_NAME,
        constants.SIGNATURE_DOCUMENT_NAME,
        constants.FORM_DOCUMENT_NAME,
      ];

    if (eddRequired) documentNames.push(constants.EDD_FORM_NAME);

    if (isUSCitizen) documentNames.push(constants.FATCA_DOCUMENT_NAME);

    if (isKenyanAbroad) documentNames.push(constants.PROOF_OF_RESIDENCE);

    switch (idTypeOrUseCase) {
      case 'finacleuploadonly':
        documentNames = documentNames.concat([
          constants.PASSPORT_PHOTO_DOCUMENT_NAME,
          constants.SIGNATURE_DOCUMENT_NAME,
        ]);
        break;
      case 'nationalid':
        documentNames = documentNames.concat([
          constants.NATIONAL_ID_DOCUMENT_NAME,
          constants.KRA_PIN_CERTIFICATE_DOCUMENT_NAME,
        ]);
        break;
      case 'kenyanpassport':
        documentNames = documentNames.concat([
          constants.NATIONAL_ID_DOCUMENT_NAME,
          constants.KENYAN_PASSPORT_DOCUMENT_NAME,
          constants.KRA_PIN_CERTIFICATE_DOCUMENT_NAME,
        ]);
        break;
      case 'driverslicense':
        documentNames = documentNames.concat([
          constants.NATIONAL_ID_DOCUMENT_NAME,
          constants.DRIVERS_LICENSE_DOCUMENT_NAME,
          constants.KRA_PIN_CERTIFICATE_DOCUMENT_NAME,
        ]);
        break;
      case 'militaryservicecard':
        documentNames = documentNames.concat([
          constants.NATIONAL_ID_DOCUMENT_NAME,
          constants.MILITARY_ID_DOCUMENT_NAME,
          constants.KRA_PIN_CERTIFICATE_DOCUMENT_NAME,
        ]);
        break;
      case 'foreignpassport':
        documentNames = documentNames.concat([
          constants.FOREIGN_PASSPORT_DOCUMENT_NAME,
          constants.WORK_PERMIT_DOCUMENT_NAME,
          constants.PASSPORT_SCREENING_RESULTS_DOCUMENT_NAME,
          constants.INTRODUCTION_LETTER_DOCUMENT_NAME,
          constants.ALIEN_ID_DOCUMENT_NAME,
          constants.KRA_PIN_CERTIFICATE_DOCUMENT_NAME,
        ]);
        break;
      case 'refugeeid':
        documentNames = documentNames.concat([
          constants.REFUGEE_ID_CARD_DOCUMENT_NAME,
          constants.KRA_PIN_CERTIFICATE_DOCUMENT_NAME,
          constants.WORK_PERMIT_DOCUMENT_NAME,
        ]);
        break;
      case 'jointaccount':
        documentNames = documentNames.concat([
          constants.JOINT_ACCOUNT_LETTER_DOCUMENT_NAME,
          constants.ACCOUNT_OPENING_FORM_DOCUMENT_NAME,
        ]);
        break;
      case 'existingjointaccountstakeholder':
        documentNames = documentNames.concat([
          constants.PASSPORT_PHOTO_DOCUMENT_NAME,
          constants.SIGNATURE_DOCUMENT_NAME,
          constants.ACCOUNT_OPENING_FORM_DOCUMENT_NAME,
        ]);
        break;
      default:
        break;
    }
    if (secondaryIds.length) {
      secondaryIds.forEach((secondaryId: any) => {
        const idType = secondaryId.IdType || secondaryId.idType;
        const newgenDocumentName = this.mapIdTypeToNewgenDocumentName(idType);
        if (
          !!newgenDocumentName &&
          !documentNames.find(
            (documentName: string) => documentName === newgenDocumentName
          )
        )
          documentNames.push(newgenDocumentName);
      });
    }
    return documentNames.map((documentName: string) => {
      const ret: IDocumentSpec = {
        required: this.checkDocumentRequired(documentName),
        name: documentName,
        description: '',
        fileTypes: this.getDocumentAllowedFiletypes(documentName),
      };
      if (useDefaultMaxSize)
        ret.maxSize =
          ret.name === constants.PASSPORT_PHOTO_DOCUMENT_NAME ||
          ret.name === constants.SIGNATURE_DOCUMENT_NAME
            ? constants.DEFAULT_MAX_FILE_SIZE_FINACLE
            : constants.DEFAULT_MAX_FILE_SIZE;
      return ret;
    });
  }

  private mapIdTypeToNewgenDocumentName(idType: string): string {
    switch (idType) {
      case 'NationalId':
        return constants.NATIONAL_ID_DOCUMENT_NAME;
      case 'MilitaryServiceCard':
        return constants.MILITARY_ID_DOCUMENT_NAME;
      case 'BirthCertificate':
        return constants.BIRTH_CERTIFICATE_NAME;
      case 'DriversLicense':
        return constants.DRIVERS_LICENSE_DOCUMENT_NAME;
      case 'KenyanPassport':
        return constants.KENYAN_PASSPORT_DOCUMENT_NAME;
      case 'ForeignPassport':
        return constants.FOREIGN_PASSPORT_DOCUMENT_NAME;
      case 'ForeignId':
        return constants.ALIEN_ID_DOCUMENT_NAME;
      case 'WorkPermit':
        return constants.WORK_PERMIT_DOCUMENT_NAME;
      case 'RefugeeId':
        return constants.REFUGEE_ID_CARD_DOCUMENT_NAME;
      case 'UNHCRProof':
        return constants.UNHCR_PROOF;
      default:
        return '';
    }
  }

  private checkDocumentRequired(
    documentName: string,
    secondaryIds?: Array<any>
  ): boolean {
    secondaryIds = secondaryIds || [];
    const secondaryIdsMappedToNewgen = secondaryIds.map((secondaryId: any) => {
      const idType = secondaryId.IdType || secondaryId.idType;
      return this.mapIdTypeToNewgenDocumentName(idType);
    });
    return (
      !constants.NON_MANDATORY_DOCUMENTS.find(
        (document: string) => document === documentName
      ) ||
      !secondaryIdsMappedToNewgen.find(
        (secondaryIdName: string) => secondaryIdName === documentName
      )
    );
  }

  private getDocumentAllowedFiletypes(documentName: string): Array<string> {
    let ret: Array<string> = [];
    if (constants.JPEG_ALLOWED_DOCUMENTS.includes(documentName))
      ret = ret.concat(['image/jpg', 'image/jpeg']);
    if (constants.PDF_ALLOWED_DOCUMENTS.includes(documentName))
      ret.push('application/pdf');
    return ret;
  }

  private preparePayload(
    service: DocumentUploadServiceType,
    documents: Array<IFileParams>,
    ticketId: string,
    customerId?: string
  ): any {
    return {
      cif: customerId || '',
      AccountNumber: '',
      country: 'KE',
      ticketNumber: ticketId,
      idType: '',
      idNumber: '',
      Service: service,
      documents: documents,
    };
  }

  public upload(
    documents: Array<IFileParams>,
    ticketId: string,
    customerId?: string,
    useNewgenServiceForFinacleUpload?: boolean
  ): Observable<any> {
    const url = constants.UPLOAD_URL_V2;

    // create deep copy of documents array to prevent messing up
    // documents lists in components and ui
    const documentsCopy = JSON.parse(JSON.stringify(documents));
    const newgenDocuments = documentsCopy.filter(
      (document: IFileParams) =>
        document.filename !== constants.PASSPORT_PHOTO_DOCUMENT_NAME &&
        document.filename !== constants.SIGNATURE_DOCUMENT_NAME
    );
    const finacleDocuments = documentsCopy.filter(
      (document: IFileParams) =>
        document.filename === constants.PASSPORT_PHOTO_DOCUMENT_NAME ||
        document.filename === constants.SIGNATURE_DOCUMENT_NAME
    );

    const calls = [];

    for (
      let i = 0;
      i < newgenDocuments.length;
      i += constants.MAX_DOCUMENTS_PER_CALL
    ) {
      const uploadChunk = newgenDocuments.slice(
        i,
        i + constants.MAX_DOCUMENTS_PER_CALL
      );
      const data = this.preparePayload(
        'NewGen',
        uploadChunk,
        ticketId,
        customerId
      );
      if (!uploadChunk.length) break;
      calls.push(this.apiService.post<any>(url, data));
    }

    for (
      let i = 0;
      i < finacleDocuments.length;
      i += constants.MAX_DOCUMENTS_PER_CALL
    ) {
      const uploadChunk = finacleDocuments.slice(
        i,
        i + constants.MAX_DOCUMENTS_PER_CALL
      );
      const data = this.preparePayload(
        useNewgenServiceForFinacleUpload ? 'NewGen' : 'Blob',
        uploadChunk,
        ticketId,
        customerId
      );
      if (!uploadChunk.length) break;
      calls.push(this.apiService.post<any>(url, data));
    }

    return forkJoin(calls).pipe(
      map((result: any) => {
        const ret = result[0];
        if (result.length > 1)
          for (let i = 1; i < result.length; i++) {
            const nextResult = result[i];
            if (!nextResult.successful) continue;
            ret.responseObject = ret.responseObject.concat(
              nextResult.responseObject
            );
          }

        // finacle returns filenames with path, so map those
        ret.responseObject.forEach((result: any) => {
          if (result.filename.indexOf('KE/Backoffice') === -1) return;
          if (
            result.filename.indexOf(constants.PASSPORT_PHOTO_DOCUMENT_NAME) > -1
          )
            result.filename = constants.PASSPORT_PHOTO_DOCUMENT_NAME;
          if (result.filename.indexOf(constants.SIGNATURE_DOCUMENT_NAME) > -1)
            result.filename = constants.SIGNATURE_DOCUMENT_NAME;
        });

        // emulate single api call response to consumers
        return ret;
      })
    );
  }

  public downloadDocumentsForTicket(ticketId: string): Observable<any> {
    const data = {
      ticketNumber: ticketId,
      service: 'NewGen',
      Cif: '',
    };
    const url = '/v2/documents/search';
    return this.apiService.post(url, data);
  }

  public downloadDocuments(
    documentIdData: string | Array<string>
  ): Observable<any> {
    if (typeof documentIdData === 'string')
      documentIdData = [documentIdData as string];
    const calls: Array<any> = [];
    (documentIdData as Array<string>).forEach((documentId: string) => {
      calls.push(
        this.apiService.postBlob('/v2/documents/download', {
          id: documentId,
          service: 'NewGen',
        })
      );
    });
    return forkJoin(calls);
  }

  public checkDocumentIsFinacle(document: any): boolean {
    return (
      document.filename.indexOf(constants.PASSPORT_PHOTO_DOCUMENT_NAME) > -1 ||
      document.filename.indexOf(constants.SIGNATURE_DOCUMENT_NAME) > -1
    );
  }
}

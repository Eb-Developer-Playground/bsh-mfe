import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CustomerCifDetailsFilteringService {
  constructor() {}

  public removeDuplicateIdentificationDetails(cifInquiryResponse: any): any {
    const cifData = cifInquiryResponse.responseObject
      ? cifInquiryResponse.responseObject
      : cifInquiryResponse;
    const identificationDetails =
      cifData.identificationDetails || cifData.IdentificationDetails;
    if (!identificationDetails || !identificationDetails.length)
      return cifInquiryResponse;
    const ret: Array<any> = [];
    identificationDetails.forEach((detail: any) => {
      if (
        (!detail.referenceNum && !detail.ReferenceNum) ||
        ret.find((retDetail: any) => {
          return (
            (!!retDetail.docType &&
              retDetail.docType === detail.docType &&
              retDetail.referenceNum === detail.referenceNum) ||
            (!!retDetail.DocType &&
              retDetail.DocType === detail.DocType &&
              retDetail.ReferenceNum === detail.ReferenceNum)
          );
        })
      )
        return;
      ret.push(detail);
    });
    cifData.identificationDetails = ret;
    return cifInquiryResponse.responseObject ? cifInquiryResponse : cifData;
  }

  public mapEddRequired(cifInquiryResponse: any, value: boolean) {
    const cifData = cifInquiryResponse.responseObject
      ? cifInquiryResponse.responseObject
      : cifInquiryResponse;
    const eddDetails = cifData.eddDetails || cifData.EddDetails;
    eddDetails.eddRequired = value;
    cifData.eddDetails
      ? (cifData.eddDetails = eddDetails)
      : (cifData.EddDetails = eddDetails);
    return cifInquiryResponse.responseObject ? cifInquiryResponse : cifData;
  }
}

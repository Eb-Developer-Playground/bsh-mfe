import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { v4 as uuid } from 'uuid';

import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';

const TICKET_ID_LOCAL_STORAGE_NAME = 'CDSCAccountTicketId';
const ACCOUNT_NUMBER_LOCAL_STORAGE_NAME = 'CDSCAccountNumber';

export interface IReviewDetail {
  label: string;
  value: string;
};

export interface IReviewDetailsSection {
  title: string;
  details: Array<IReviewDetail>;
};

function formatLabel(label: string) {
  label = label.split(/(?=[A-Z])/).join(' ');
  const wordsArray = label.split(' ');
  for (let i = 0; i < wordsArray.length; i++) {
    if (wordsArray[i].toLowerCase() === 'of') {
      wordsArray[i] = wordsArray[i].toLowerCase();
      continue;
    }
    wordsArray[i] = wordsArray[i].charAt(0).toUpperCase() + wordsArray[i].slice(1);
  }
  return wordsArray.join(' ');
}

function mapFieldToLabel(fieldname: string): string {
  switch (fieldname) {
    case 'idSerialNumber': return 'ID Serial Number';
    case 'kraPinNumber': return 'KRA Pin Number';
    case 'idType': return 'ID Type';
    case 'idNumber': return 'ID Number';
    case 'CDSCAccountNumber': return 'CDSC Account Number';
    default: return formatLabel(fieldname);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CdscAccountOpeningService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private accountManagementService = inject(AccountManagementService);

  public mapReviewDetails(details: any): Array<IReviewDetailsSection> {
    const customerDetails: Array<IReviewDetail> = [];
    if (details.customerDetails) {
      Object.entries(details.customerDetails).forEach(entry => {
        customerDetails.push({
          label: mapFieldToLabel(<string>entry[0]),
          value: <string>entry[1],
        });
      });
    }

    const contactDetails: Array<IReviewDetail> = [];

    if (details.phoneNumber) {
      contactDetails.push({
        label: 'Phone Number',
        value: `+${details.phoneNumber.countryCode}${details.phoneNumber.cityCode}${details.phoneNumber.number}`,
      });
    }

    if (details.emailAddress) {
      contactDetails.push({
        label: 'Email Address',
        value: details.emailAddress.emailAddress,
      })
    }

    const nextOfKinDetails: Array<IReviewDetail> = [];
    if (details.nextOfKin) {
      Object.entries(details.nextOfKin).forEach(entry => {
        if (entry[0] === 'phoneNumber') return;
        let value = <string>entry[1];
        if (entry[0] === 'relation') {
          const relations = this.getRelations();
          const fullRelation = relations.find(
            (relation: any) => relation.value === entry[1]
          );
          value = fullRelation.relationship;
        }
        nextOfKinDetails.push({
          label: mapFieldToLabel(<string>entry[0]),
          value: value,
        });
      });
    }

    const additionalInformation: Array<IReviewDetail> = [];
    if (details.additionalInfo) {
      Object.entries(details.additionalInfo).forEach(entry => {
        if (typeof entry[1] === 'object') {
          Object.entries(<any>entry[1]).forEach(subEntry => {
            const label = mapFieldToLabel(<string>subEntry[0]);
            let value: any = <any>subEntry[1];
            if (subEntry[0] === 'mobilePaymentNumber') {
              value = `+${value.countryCode} ${value.number}`;
            }
            additionalInformation.push({
              label: label,
              value: value,
            });
          });
          return;
        }
        additionalInformation.push({
          label: mapFieldToLabel(<string>entry[0]),
          value: <string>entry[1],
        });
      });
    }

    const ret: Array<IReviewDetailsSection> = [];

    if (customerDetails.length)
      ret.push({
        title: 'Customer Details',
        details: customerDetails,
      });

    if (contactDetails.length)
      ret.push({
        title: 'Contact Details',
        details: contactDetails,
      });

    if (nextOfKinDetails.length)
      ret.push({
        title: 'Next of Kin',
        details: nextOfKinDetails,
      });

    if (additionalInformation.length)
      ret.push({
        title: 'Additional Information',
        details: additionalInformation,
      });

    return ret;
  }

  public resetLocalStorage() {
    localStorage.removeItem(TICKET_ID_LOCAL_STORAGE_NAME);
    localStorage.removeItem(ACCOUNT_NUMBER_LOCAL_STORAGE_NAME);
  }

  public setTicketId(ticketId: string) {
    localStorage.setItem(TICKET_ID_LOCAL_STORAGE_NAME, ticketId);
  }

  public getTicketId(): string {
    return localStorage.getItem(TICKET_ID_LOCAL_STORAGE_NAME) || '';
  }

  public setAccountNumber(number: string) {
    localStorage.setItem(ACCOUNT_NUMBER_LOCAL_STORAGE_NAME, number);
  }

  public getAccountNumber(): string {
    return localStorage.getItem(ACCOUNT_NUMBER_LOCAL_STORAGE_NAME) || '';
  }

  public getCurrencies(): Array<string> {
      return ['KES', 'USD', 'EUR', 'GBP'];
  }

  public getRelations(): Array<any> {
    const relations = JSON.parse(<string>localStorage.getItem('relation'));
    const customer = this.accountManagementService.getCustomerCifData();
    const ret = relations.filter(
      (relation: { bank_Id: { toString: () => any; }; }) =>
        relation.bank_Id.toString() === customer.accountDetails?.bankId
    );
    return ret;
  }

  public createTicket(customerDetails: any, successCallback: Function) {
    const data = {
      associatedId: uuid(),
      customerId: customerDetails.cif,
      customerName: `${customerDetails.firstName} ${customerDetails.lastName}`,
      customerPresent: true,
    };
    this.http.post(`${environment.apiUrl}/v1/backoffice/cdscaccount/create-ticket`, data).subscribe(
      (result: any) => {
        if (!result.successful) {
          this.toastService.show(
            result.statusMessage,
            'Error',
            MessageBoxType.DANGER,
            5000, undefined, undefined, false
          );
          return;
        }
        this.setTicketId(result.responseObject.id.toString());
        successCallback();
      }
    );
  }

  public submitAccountOpening(customerData: any, successCallback: Function) {
    const ticketId = this.getTicketId();
    // copy and format data
    const data = JSON.parse(JSON.stringify(customerData));
    data.customerDetails.phoneNumber = data.phoneNumber;
    data.customerDetails.email = data.emailAddress;

    delete data.phoneNumber;
    delete data.emailAddress;

    if (data.additionalInfo.divendDisposalPreference.mobilePaymentNumber) {
      const mobilePaymentNumberObject = JSON.parse(JSON.stringify(data.additionalInfo.divendDisposalPreference.mobilePaymentNumber));
      data.additionalInfo.divendDisposalPreference.mobilePaymentNumber = `${mobilePaymentNumberObject.countryCode}${mobilePaymentNumberObject.number}`;
    }

    if (data.additionalInfo.divendDisposalPreference.cityCode)
      delete data.additionalInfo.divendDisposalPreference.cityCode;

    this.http.post(`${environment.apiUrl}/v1/backoffice/cdscaccount/${ticketId}/submit-account-opening`, data).subscribe(
      (result: any) => {
        if (!result.successful) {
          this.toastService.show(
            result.statusMessage,
            'Error',
            MessageBoxType.DANGER,
            5000, undefined, undefined, false
          );
          return;
        }
        successCallback();
      }
    );
  }

  public submitDocumentsUpload(successCallback: Function) {
    const ticketId = this.getTicketId();
    this.http.post(`${environment.apiUrl}/v1/backoffice/cdscaccount/${ticketId}/upload-documents`, null).subscribe(
      (result: any) => {
        if (!result.successful) {
          this.toastService.show(
            result.statusMessage,
            'Error',
            MessageBoxType.DANGER,
            5000, undefined, undefined, false
          );
          return;
        }
        successCallback();
      }
    );
  }

  public checkChildFlows(successCallback: Function) {
    const ticketId = this.getTicketId();
    this.http.post(`${environment.apiUrl}/v1/backoffice/cdscaccount/${ticketId}/check-child-flows`, null).subscribe(
      (result: any) => {
        if (!result.successful) {
          this.toastService.show(
            result.statusMessage,
            'Error',
            MessageBoxType.DANGER,
            5000, undefined, undefined, false
          );
          return;
        }
        successCallback();
      }
    );
  }

  public verifyBio(fingerprintsData: any, successCallback: Function) {
    const ticketId = this.getTicketId();
    const customer = this.accountManagementService.getCustomerCifData();
    const data = {
      skipAllBio: false,
      bioModels: [
        {
          cif: customer.personalDetails.customerId,
          skipBio: false,
          fingerprints: [
            fingerprintsData,
          ]
        },
      ],
    };
    this.http.post(`${environment.apiUrl}/v1/backoffice/cdscaccount/${ticketId}/bio-verify`, data).subscribe(
      (result: any) => {
        if (!result.successful) {
          this.toastService.show(
            result.statusMessage,
            'Error',
            MessageBoxType.DANGER,
            5000, undefined, undefined, false
          );
          return;
        }
        successCallback();
      }
    );
  }

  public fetchAccountNumber(successCallback: Function, errorCallback: Function) {
    const customer = this.accountManagementService.getCustomerCifData();
    const customerAccounts = this.accountManagementService.getCustomerAccounts();
    const primaryAccount = customerAccounts[0];
    const data = {
      Lookup: {
        Identitynumber: customer.identificationDetails[0]?.referenceNum,
      },
    };
    this.http.post(`${environment.apiUrl}/v1/backoffice/cdscaccount/account-lookup`, data).subscribe(
      (result: any) => {
        if (!result.successful) {
          this.toastService.show(
            result.statusMessage,
            'Error',
            MessageBoxType.DANGER,
            5000, undefined, undefined, false
          );
          return;
        }
        if (!result.responseObject)
          return this.noAccountNumberHandler(successCallback);

        const regex = /accountNumber:[0-9]*/;
        const accountNumberFieldSearch = result.responseObject.match(regex);
        if (!accountNumberFieldSearch || !accountNumberFieldSearch.length)
          return this.noAccountNumberHandler(successCallback);

        const accountNumberFieldMatch = accountNumberFieldSearch[0];
        const accountNumber = accountNumberFieldMatch?.split(':')[1];

        if (!accountNumber)
          return this.noAccountNumberHandler(successCallback);

        this.toastService.show(
          `This customer's CDSC Account number is ${accountNumber}`,
          'Info',
          MessageBoxType.INFO,
          5000, undefined, undefined, false
        );
        this.setAccountNumber(accountNumber);
        successCallback();
      },
      error => {
        errorCallback();
      }
    );
  }

  private noAccountNumberHandler(callback: Function) {
    this.toastService.show(
      'This customer does not have a CDSC Account number',
      'Info',
      MessageBoxType.INFO,
      5000, undefined, undefined, false
    );
    // TEMP hard-coded cdsc account number until no account number flow implemented
    this.setAccountNumber('0000050010023');
    callback();
  }
}

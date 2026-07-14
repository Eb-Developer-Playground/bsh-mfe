import { inject, Injectable } from '@angular/core';
import { TicketsService } from '@app/core/services/ticket/tickets.service';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import {
  CreateStandingOrder,
  AmendStandingOrder,
} from '@app/shared/models/standing-order';
import { ApiService } from '@app/shared/services';
import { Ticket } from '../ticket/models';

@Injectable({
  providedIn: 'root',
})
export class StandingOrderService {
  private apiService = inject(ApiService);

  getExecutionTimes() {
    return [
      { label: 'A - Before Change of Date', value: 'A' },
      { label: 'B - After Change of Date', value: 'B' },
    ];
  }
  cif: any;
  accountNumber: any = '';
  standingOrder: any;
  tempStandingOrder: any;

  createStandingOrder: CreateStandingOrder.RootObject = this.getSubmitData(
    null,
    null
  );
  amendStandingOrder: AmendStandingOrder.RootObject = this.getAmendSubmitData(
    null,
    null
  );

  public getAccountNumber() {
    return this.accountNumber;
  }

  public setAccountNumber(accountNumber: any) {
    this.accountNumber = accountNumber;
  }
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        let r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
  public formatDate(data: any) {
    let date = new Date();
    if (data === null || data === undefined || data === '') {
      return null;
    } else {
      date = new Date(data);
    }
    const day = `${
      +date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`
    }`;
    const fullYear = date.getFullYear();
    const month = `${
      +date.getMonth() + 1 < 10
        ? `0${+date.getMonth() + 1}`
        : `${+date.getMonth() + 1}`
    }`;
    return [fullYear, month, day].join('/');
  }

  public toBase64(fileToRead: File): Observable<any> {
    let base64Observable = new ReplaySubject<any>(1);

    let fileReader = new FileReader();
    fileReader.onload = event => {
      base64Observable.next(fileReader.result?.toString());
    };
    fileReader.readAsDataURL(fileToRead);

    return base64Observable;
  }
  public getAccountDetail(): any {
    if (!localStorage.getItem('accounts')) return;
    const result = (
      JSON.parse(<string>localStorage.getItem('accounts')) as any[]
    ).find((f: any) => f.accountNumber == this.getAccountNumber());
    return result;
  }

  public getCustomerDetail(): any {
    return JSON.parse(<string>localStorage.getItem('customerCifData'));
  }

  public getCustomerCifData(): any {
    return JSON.parse(<string>localStorage.getItem('customerDetails'));
  }
  public getRemittanceCurrencies(): any {
    return ['KES', 'USD', 'EUR', 'GBP'];
  }
  public getPaymentFrequencies(): any {
    return ['Daily', 'Weekly', 'Monthly', 'Half-Yearly', 'Quarterly', 'Yearly'];
  }
  public setStandingOrder(value: any) {
    this.tempStandingOrder = value;
  }

  public getFingerPrint() {
    return {
      fingerprints: [
        {
          position: 'RIGHT_INDEX',

          image: {
            format: 'BMP',

            resolutionDpi: 508,

            data: '/6D/qAB6TklTVF9DT00gOQpQSVhfV0lEVEggMjU4ClBJWF9IRUlHSFQgMzM2ClBJWF9ERVBUSCA4ClBQSSA1MDgKTE9TU1kgMQpDT0xPUlNQQUNFIEdSQVkKQ09NUFJFU1NJT04gV1NRCldTUV9CSVRSQVRFIDAuNzUwMDAw/6gACVNlY3VHZW7/pAA6CQcACTLTJc0ACuDzGZoBCkHv8ZoBC44nZM0AC+F5ozMACS7/VgABCvkz0zMBC/KHIZoACiZ32jP',
          },
        },
      ],
    };
  }
  public getSubmitData(data: any, ticket: any): CreateStandingOrder.RootObject {
    let currentAccount = this.getAccountDetail();
    let currentCustomer = this.getCustomerDetail();
    this.createStandingOrder = {
      SenderDetails: {
        StandingOrderType: data?.beneficiary.standingOrderType,
        AssociatedId: ticket?.responseObject?.associatedId,
        CustomerName: currentAccount?.accountName,
        CustomerId:
          currentCustomer?.personalDetails?.customerId ||
          currentCustomer?.companyDetails?.customerId,
        BankId: currentCustomer?.accountDetails.bankId,
        SourceAccount: currentAccount?.accountNumber,
        SourceAccountCurrency: currentAccount?.accountCurrency,
        CurrencyCode: data?.payment.paymentCurrency,
        Amount: data?.payment.amountToSend.toString(),
        Frequency: data?.payment.PaymentFrequency,
        StartDate: this.formatDate(data?.payment.startDate),
        EndDate: this.formatDate(data?.payment.endDate),
        ExecutionTime: data?.payment.executionTime,
        DayOfExecution: data?.payment.dayOfExecution,
        PaymentReason: data?.payment.paymentReason,
        SkipBio: !data?.SkipBio,
        Charge: '',
      },
      BeneficiaryDetails: {
        FullName: data?.beneficiary.beneficiaryName,
        DestinationAccount: data?.beneficiary.accountNumber,
        BIC: data?.beneficiary.bic,
        BankName: data?.beneficiary.beneficiaryBank,
        Address: data?.beneficiary.physicalAddress,
        Phone: data?.beneficiary.mobileNumber,
        Email: data?.beneficiary.email,
        CityState: '',
        BranchCityCode: data?.beneficiary.branchCityCode,
        BranchCityCodeName: data?.beneficiary.branchCityCodeName,
        BranchCode: data?.beneficiary.branchCode,
        BranchCodeName: data?.beneficiary.branchCodeName,
        RecipientReferenceNumber: data?.beneficiary.recipientReferanceNumber,
        RemitterDetails: data?.beneficiary.remitterDetail,
      },
      CustomerPresent: data?.SkipBio,
      NotificationDetails: data?.NotificationDetails,
    };
    return this.createStandingOrder;
  }

  public getAmendSubmitData(
    data: any,
    ticket: any
  ): AmendStandingOrder.RootObject {
    let currentAccount = this.getAccountDetail();
    let currentCustomer = this.getCustomerDetail();
    this.amendStandingOrder = {
      SenderDetails: {
        StandingOrderType: data?.beneficiary.standingOrderType,
        AssociatedId: null,
        CustomerName: null,
        CustomerId:
          currentCustomer?.personalDetails?.customerId ||
          currentCustomer?.companyDetails?.customerId,
        BankId: null,
        SourceAccount: currentAccount?.accountNumber,
        SourceAccountCurrency: null,
        CurrencyCode: data?.payment.paymentCurrency,
        Amount: data?.payment.amountToSend.toString(),
        Frequency: data?.payment.PaymentFrequency,
        StartDate: this.formatDate(data?.payment.startDate),
        EndDate: this.formatDate(data?.payment.endDate),
        ExecutionTime: data?.payment.executionTime,
        DayOfExecution: data?.payment.dayOfExecution,
        PaymentReason: data?.payment.paymentReason,
        SkipBio: null,
        Charge: null,
      },
      BeneficiaryDetails: {
        FullName: data?.beneficiary.beneficiaryName,
        DestinationAccount: data?.beneficiary.accountNumber,
        BIC: data?.beneficiary.bic,
        BankName:
          data?.beneficiary?.standingOrderType !== 'WithinEquity'
            ? data?.beneficiary?.beneficiaryBank
            : '',
        Address: data?.beneficiary.physicalAddress,
        Phone: data?.beneficiary.mobileNumber,
        Email: data?.beneficiary.email,
        CityState: '',
        BranchCityCode: data?.beneficiary.branchCityCode,
        BranchCityCodeName: data?.beneficiary.branchCityCodeName,
        BranchCode: data?.beneficiary.branchCode,
        BranchCodeName: data?.beneficiary.branchCodeName,
        RecipientReferenceNumber: data?.beneficiary.recipientReferanceNumber,
        RemitterDetails: data?.beneficiary.remitterDetail,
      },
      CustomerPresent: data?.SkipBio,
      StandingOrderId: this.standingOrder?.standingOrderId,
      NotificationDetails: data?.NotificationDetails,
    };
    return this.amendStandingOrder;
  }

  public getStopSubmitData(
    data: any,
    ticket: any
  ): AmendStandingOrder.RootObject {
    let currentAccount = this.getAccountDetail();
    let currentCustomer = this.getCustomerDetail();
    this.amendStandingOrder = {
      SenderDetails: {
        StandingOrderType: data?.beneficiary.standingOrderType,
        AssociatedId: ticket?.responseObject?.associatedId,
        CustomerName: currentAccount?.accountName,
        CustomerId:
          currentCustomer?.personalDetails?.customerId ||
          currentCustomer?.companyDetails?.customerId,
        BankId: currentCustomer?.accountDetails.bankId,
        SourceAccount: currentAccount?.accountNumber,
        SourceAccountCurrency: currentAccount?.accountCurrency,
        CurrencyCode: data?.payment.paymentCurrency,
        Amount: data?.payment.amountToSend.toString(),
        Frequency: data?.payment.PaymentFrequency,
        StartDate: this.formatDate(data?.payment.startDate),
        EndDate: this.formatDate(data?.payment.endDate),
        ExecutionTime: data?.payment.executionTime,
        DayOfExecution: data?.payment.dayOfExecution,
        PaymentReason: data?.payment.paymentReason,
        SkipBio: !data?.SkipBio,
        Charge: '',
      },
      BeneficiaryDetails: {
        FullName: data?.beneficiary.beneficiaryName,
        DestinationAccount: data?.beneficiary.accountNumber,
        BIC: data?.beneficiary.bic,
        BankName: data?.beneficiary.beneficiaryBank,
        Address: data?.beneficiary.physicalAddress,
        Phone: data?.beneficiary.mobileNumber,
        Email: data?.beneficiary.email,
        CityState: '',
        BranchCityCode: data?.beneficiary.branchCityCode,
        BranchCityCodeName: data?.beneficiary.branchCityCodeName,
        BranchCode: data?.beneficiary.branchCode,
        BranchCodeName: data?.beneficiary.branchCodeName,
        RecipientReferenceNumber: data?.beneficiary.recipientReferanceNumber,
        RemitterDetails: data?.beneficiary.remitterDetail,
      },
      CustomerPresent: data?.SkipBio,
      StandingOrderId: this.standingOrder?.standingOrderId,
      NotificationDetails: data?.NotificationDetails,
    };
    return this.amendStandingOrder;
  }
  public getCreateTicket(CustomerPresent: any): any {
    let currentAccount = this.getAccountDetail();
    let currentCustomer = this.getCustomerDetail();
    return {
      ActionFlow: 'Create',
      AssociatedId: StandingOrderService.newGuid(),
      CustomerName: currentAccount.accountName,
      CustomerId:
        currentCustomer?.personalDetails?.customerId ||
        currentCustomer?.companyDetails?.customerId,
      BankId: currentCustomer?.accountDetails.bankId,
      CustomerPresent: CustomerPresent,
    };
  }
  public getAmendTicket(CustomerPresent: any): any {
    let currentAccount = this.getAccountDetail();
    let currentCustomer = this.getCustomerDetail();
    return {
      ActionFlow: 'Update',
      AssociatedId: StandingOrderService.newGuid(),
      CustomerName: currentAccount.accountName,
      CustomerId:
        currentCustomer?.personalDetails?.customerId ||
        currentCustomer?.companyDetails?.customerId,
      BankId: currentCustomer?.accountDetails.bankId,
      CustomerPresent: CustomerPresent,
    };
  }
  public getStopTicket(CustomerPresent: any): any {
    let currentAccount = this.getAccountDetail();
    let currentCustomer = this.getCustomerDetail();

    return {
      ActionFlow: 'Delete',
      AssociatedId: StandingOrderService.newGuid(),
      CustomerName: currentAccount.accountName,
      CustomerId:
        currentCustomer?.personalDetails?.customerId ||
        currentCustomer?.companyDetails?.customerId,
      BankId: currentCustomer?.accountDetails.bankId,
      CustomerPresent: CustomerPresent,
    };
  }
  public getUploadDocumentTicket(
    ticketId: any,
    documents: any[]
  ): Observable<any> {
    let ticket = new Subject();
    let arrayDocsBae64: any[] = [];
    let currentCustomer = this.getCustomerDetail();
    let currentAccount = this.getAccountDetail();

    documents.forEach(async document => {
      this.toBase64(document.uploadedFile).subscribe(base64File => {
        const objDoc = { Filename: '', Format: '', data: '' };

        objDoc.Format = document.uploadedFile.type.split('/')[1];
        objDoc.Filename = document.fileName;
        objDoc.data = base64File.split(',')[1];

        arrayDocsBae64.push(objDoc);

        if (documents[documents.length - 1] === document) {
          ticket.next({
            CIF: currentAccount.cif,
            AccountNumber: currentAccount.accountNumber,
            Country: 'KE',
            ticketNumber: ticketId.toString(),
            idNumber:
              currentCustomer?.personalDetails?.customerId ||
              currentCustomer?.companyDetails?.customerId,
            idType: 'CustomerId',
            Service: 'NewGenSwift',
            documents: arrayDocsBae64,
          });
        }
      });
    });
    return ticket.asObservable();
  }

  public getList(cif: any, accountNumber: any): Observable<any> {
    return this.apiService.get(
      `/v1/backoffice/standingorder/list/${cif}/${accountNumber}`
    );
  }
  public getStandingOrder(): Observable<any> {
    return this.apiService.get(
      `/v1/backoffice/standingorder/${this.cif}/${this.accountNumber}/${this.standingOrder.standingOrderId}?bankname=${this.standingOrder.bankName}`
    );
  }
  public uploadStandingOrderDocuments(values: any): Observable<any> {
    if (
      window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
      window.location.hostname ===
        'servicehub-customer-360-uat.equitygroupholdings.com'
    ) {
      return this.apiService.post<any>(`/v2/documents/submit`, values);
    }
    return this.apiService.post('/v2/documents/submit', values);
  }
  public verifyStandingOrderBio(id: string, data: any): Observable<any> {
    return this.apiService.post<any>(
      `/v1/backoffice/StandingOrder/${id}/verify-bio`,
      data
    );
  }

  public submitStandingOrderDocuments(id: any, values: any): Observable<any> {
    return this.apiService.post(
      '/v1/backoffice/StandingOrder/' + id + '/submit-documents',
      values
    );
  }
  public createTicket(values: Ticket): Observable<any> {
    return this.apiService.post('/v1/backoffice/standingorder/create', values);
  }
  public uploadDocument(values: any): Observable<any> {
    return this.apiService.post('/v1/backoffice/StandingOrder/create', values);
  }
  public verifyBio(values: Ticket): Observable<any> {
    return this.apiService.post('/v1/backoffice/standingorder/create', values);
  }
  public submitTicket(values: any, ticketId: any): Observable<any> {
    return this.apiService.post(
      '/v1/backoffice/standingorder/' + ticketId + '/submit',
      values
    );
  }
  public amendOrder(
    values: AmendStandingOrder.RootObject,
    ticketId: any
  ): Observable<any> {
    return this.apiService.post(
      '/v1/backoffice/standingorder/' + ticketId + '/submit',
      values
    );
  }

  public getStandingOrderCharges(
    methodType: any,
    standingOrderType: any
  ): Observable<any> {
    return this.apiService.get(
      `/v1/backoffice/StandingOrder/fee?actionFlow=${methodType}&standingordertype=${standingOrderType}`
    );
  }

  getAmountPrecision(amount: any) {
    return (Math.floor(amount * -20 - 0.2) * -0.05 - 0.05).toFixed(2);
  }
}

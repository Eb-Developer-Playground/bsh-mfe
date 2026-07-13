import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '@app/shared/services';
import {
  MoveMoneyDocInfoT,
  MoveMoneyDocRequestPayloadT,
  SpecialRateObjT,
} from '@app/home/customer/move-money/models/move-money-services.model';

export interface ICheckMoveMoneyAmount {
  amount: string;
  currency: string;
  sourceAccount: string;
}

@Injectable({
  providedIn: 'root',
})
export class MoveMoneyService {
  private api = inject(ApiService);

  public getExchangeRates(
    data: any,
    skipLoadingInterceptor?: boolean
  ): Observable<any> {
    return this.api.post<any>(`/v1/account/exchangeRate`, data, {
      headers: { skipLoadingInterceptor: String(skipLoadingInterceptor) },
    });
  }

  public getRateList(date: string, bankId: number): Observable<any> {
    return this.api.get<any>(
      `/v1/account/ratelist?bankId=${bankId}&date=${date}`
    );
  }

  public getTransferCharges(data: any): Observable<any> {
    return this.api.post<any>(`/v1/banktransferstaff/charge`, data);
  }

  public validateMoveMoneyProcess(data: {
    DestinationAccount: string;
    Currency: string;
    Amount: number;
    CustomerId: string;
  }) {
    return this.api.post<any>(`/v1/backoffice/MoveMoney/validate`, data);
  }

  public validateInstrumentNumber(
    data: any,
    skipLoadingInterceptor?: boolean
  ): Observable<any> {
    return this.api.post<any>(`/v1/account/chequestatus`, data, {
      headers: {
        skipToast: String('true'),
        skipLoadingInterceptor: String(skipLoadingInterceptor),
      },
    });
  }

  public MoveMoneyValidateInstrumentNumber(
    data: any,
    skipLoadingInterceptor?: boolean
  ): Observable<any> {
    return this.api.post<any>(`/v1/ChequeBook/chequestatus`, data, {
      headers: { skipLoadingInterceptor: String(skipLoadingInterceptor) },
    });
  }

  public checkMoveMoneyAmount({
    amount,
    currency,
    sourceAccount,
  }: ICheckMoveMoneyAmount): Observable<any> {
    return this.api.get<any>(
      `/v1/backoffice/MoveMoney/documents-required?amount=${amount}&currency=${currency}&sourceAccount=${sourceAccount}`
    );
  }

  public submitMoveMoneyTicket(id: string, data: any): Observable<any> {
    return this.api.post<any>(`/v1/backoffice/MoveMoney/${id}/submit`, data);
  }

  public verifyCustomerBio(id: string, bioModels: any): Observable<any> {
    return this.api.post<any>(
      `/v1/backoffice/MoveMoney/${id}/verify-bio`,
      bioModels
    );
  }

  public createMoveMoneyTicket(data: any): Observable<any> {
    return this.api.post<any>(`/v1/backoffice/MoveMoney/create`, data);
  }

  public uploadTransactionDocuments(data: any): Observable<any> {
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

  public submitTransactionDocuments(id: any, data: any): Observable<any> {
    return this.api.post<any>(
      `/v1/backoffice/MoveMoney/${id}/submit-documents`,
      data
    );
  }

  // created ticket id = 62256
  public getMoveMoneyDocInfo(payload: MoveMoneyDocRequestPayloadT) {
    return this.api.post<MoveMoneyDocRequestPayloadT>(
      `/v1/backoffice/documents/required/MoveMoneyFlowV2`,
      payload
    ) as any as Observable<MoveMoneyDocInfoT>;
  }

  public getSpecialExchangeRates(
    data: any,
    skipLoadingInterceptor?: boolean
  ): Observable<{
    responseObject: SpecialRateObjT;
    successful: boolean;
    statusMessage: string;
  }> {
    return this.api.post<any>(`/v1/account/specialrate`, data);
  }

  validateTicketTestData(): MoveMoneyDocRequestPayloadT {
    const ticketInfo = {
      DebitAccountDetails: {
        accountNumber: '001100000030419',
        accountCurrency: 'USD',
        availableBalance: '4792.89',
        accountholderName: 'PDG KAMBA KAMBA/ETS BIG SHOP K',
      },
      BeneficiaryDetails: {
        accountNumber: '060109351120052',
        accountCurrency: 'USD',
        accountholderName: 'KAMBA KAMBA PDG',
      },
      PaymentDetails: {
        currency: 'USD',
        amount: 10,
        transactionType: 'OwnAccount',
        reason: 'test pymt',
        ticketNumber: '',
        dateCreated: '2024-12-23T08:11:46.468Z',
        rateCode: 'TTS',
        exchangeRate: 1,
        baseExchangeRate: 1,
        convertedAmount: null,
        paymentFee: '0.000',
        specialRateDetails: null,
      },
      NarrationDetails: {
        comment: null,
      },
      AdditionalDetails: {
        instrumentType: null,
        instrumentDate: null,
        instrumentNumber: null,
      },
      AdditionalDocuments: {},
      ExchangeDetailsForm: {
        RateCode: '',
        ExchangeRate: '',
        BaseExchangeRate: '',
        TreasuryRate: '',
        SearchByCif: '',
        ConvertedCurrency: '',
        ConvertedAmount: '',
        TicketNumber: '',
        isSpecial: false,
      },
    };
    const data1 = {
      SenderDetails: {
        AssociatedId: '052827db-9dc1-453c-b1e3-a963a85c22b3',
        CustomerName: 'PDG KAMBA KAMBA',
        CustomerId: '43000159165',
        BankId: '43',
        TransactionType: 'MOVEMONEY',
        TransferType: 'TransferToOtherEquityBankAccount',
        SourceAccount: '001100000030419',
        SourceAccountCurrency: 'USD',
        Amount: 100,
        PaymentReason: 'test 100 usd',
        SkipBio: false,
      },
      BeneficiaryDetails: {
        Address: '',
        BIC: '',
        BankName: '',
        DestinationAccount: '060109351120052',
        DestinationAccountCurrency: 'USD',
        DestinationAccountType: '',
        Email: '',
        Favorited: false,
        FullName: 'KAMBA KAMBA PDG',
        Phone: '',
      },
      TransactionDetails: {
        InstrumentType: null,
        InstrumentDate: null,
        InstrumentNumber: null,
      },
      ExchangeDetails: {
        RateCode: 'TTS',
        ExchangeRate: '1',
        BaseExchangeRate: '1',
        TreasuryRate: '1',
        SearchByCif: '',
        ConvertedCurrency: 'USD',
        ConvertedAmount: 100,
        TicketNumber: '',
      },
      NotificationDetails: {
        Sms: true,
        Email: true,
      },
      Fee: '0',
    };
    const data2 = {
      SenderDetails: {
        AssociatedId: 'dd9dc3d1-d192-4507-94a4-77b641a034c4',
        CustomerName: 'PDG KAMBA KAMBA',
        CustomerId: '43000159165',
        BankId: '43',
        TransactionType: 'MOVEMONEY',
        TransferType: 'TransferToOwnAccount',
        SourceAccount: '001100000030419',
        SourceAccountCurrency: 'USD',
        CurrencyCode: 'USD',
        Amount: 2001,
        PaymentReason: 'test pymt',
        SkipBio: false,
      },
      BeneficiaryDetails: {
        Address: '',
        BIC: '',
        BankName: '',
        DestinationAccount: '060109351120052',
        DestinationAccountCurrency: 'USD',
        DestinationAccountType: '',
        Email: '',
        Favorited: false,
        FullName: 'KAMBA KAMBA PDG',
        Phone: '',
      },
      TransactionDetails: {
        InstrumentType: null,
        InstrumentDate: null,
        InstrumentNumber: null,
      },
      ExchangeDetails: {
        RateCode: 'TTS',
        ExchangeRate: '1',
        BaseExchangeRate: '1',
        TreasuryRate: '1',
        SearchByCif: '',
        ConvertedCurrency: 'USD',
        ConvertedAmount: 2001,
        TicketNumber: '',
      },
      NotificationDetails: {
        Sms: true,
        Email: true,
      },
      Fee: '0',
    };
    return data2;
  }

  public uploadTransactionDocumentsV3(data: any): Observable<any> {
    return this.api.post<any>(`/v3/documents/submit`, data);
  }
}

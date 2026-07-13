import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { MoveMoneyService } from '@app/core/services/move-money/move-money.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class MmSharedLogicService {
  constructor(
    private moveMoneyService: MoveMoneyService,
    private toastService: ToastService
  ) {}

  generateMoveMoneySubmitPayload(
    transferType: string,
    exchangeDetails: any,
    sendMoneyDetails: any,
    customerDetails: any
  ) {
    const specialRateValues = {
      currency: exchangeDetails.isSpecial
        ? exchangeDetails.ConvertedCurrency
        : sendMoneyDetails.PaymentDetails.currency,
      amount: exchangeDetails.isSpecial
        ? exchangeDetails.ConvertedAmount
        : sendMoneyDetails.PaymentDetails.amount,
    };
    return {
      SenderDetails: this.getSenderDetails(
        sendMoneyDetails,
        customerDetails,
        transferType,
        specialRateValues
      ),
      BeneficiaryDetails: this.getBeneficiaryDetails(sendMoneyDetails),
      TransactionDetails: this.getTransactionDetails(sendMoneyDetails),
      ExchangeDetails: this.getExchangeDetails(
        sendMoneyDetails,
        exchangeDetails
      ),
      NotificationDetails: {
        Sms: true,
        Email: true,
      },
      Fee: sendMoneyDetails.PaymentDetails.paymentFee,
    };
  }

  getSenderDetails(
    sendMoneyDetails: any,
    customerDetails: any,
    transferType: string,
    specialRateValues: any
  ) {
    return {
      AssociatedId: uuid(),
      CustomerName: customerDetails.firstName + ' ' + customerDetails.lastName,
      CustomerId: customerDetails.cif,
      BankId: customerDetails.bankID,
      TransactionType: 'MOVEMONEY',
      TransferType: transferType,
      SourceAccount: sendMoneyDetails.DebitAccountDetails.accountNumber,
      SourceAccountCurrency:
        sendMoneyDetails.DebitAccountDetails.accountCurrency,
      CurrencyCode: specialRateValues.currency,
      Amount: specialRateValues.amount,
      PaymentReason: sendMoneyDetails.PaymentDetails.reason,
      Narration: sendMoneyDetails.NarrationDetails.comment,
      SkipBio: false,
    };
  }
  getBeneficiaryDetails(sendMoneyDetails: any) {
    return {
      Address: '',
      BIC: '',
      BankName: '',
      DestinationAccount: sendMoneyDetails.BeneficiaryDetails.accountNumber,
      DestinationAccountCurrency:
        sendMoneyDetails.BeneficiaryDetails.accountCurrency || '',
      DestinationAccountType: '',
      Email: '',
      Favorited: false,
      FullName: sendMoneyDetails.BeneficiaryDetails.accountholderName,
      Phone: '',
    };
  }
  getTransactionDetails(sendMoneyDetails: any) {
    return {
      InstrumentType: sendMoneyDetails.AdditionalDetails.instrumentType,
      InstrumentDate: sendMoneyDetails.AdditionalDetails.instrumentDate,
      InstrumentNumber: sendMoneyDetails.AdditionalDetails.instrumentNumber,
    };
  }
  getExchangeDetails(sendMoneyDetails: any, exchangeDetails: any) {
    const sourceCurrency = sendMoneyDetails.DebitAccountDetails.accountCurrency;
    const paymentCurrency = sendMoneyDetails.PaymentDetails.currency;
    let convertedCurrency = sendMoneyDetails.BeneficiaryDetails.accountCurrency;

    if (sourceCurrency !== paymentCurrency) {
      convertedCurrency = sourceCurrency;
    }
    return {
      RateCode: exchangeDetails.RateCode || 'TTS', //TTS
      ExchangeRate: exchangeDetails.ExchangeRate || '1',
      BaseExchangeRate: exchangeDetails.BaseExchangeRate || '1',
      TreasuryRate: exchangeDetails.TreasuryRate || '1',
      SearchByCif: '',
      ConvertedCurrency: convertedCurrency,
      ConvertedAmount:
        sendMoneyDetails.PaymentDetails.convertedAmount ||
        sendMoneyDetails.PaymentDetails.amount,
      TicketNumber: sendMoneyDetails.PaymentDetails.ticketNumber,
    };
  }

  validateMoveMoneyDestinationAccount(sendMoneyDetails: any) {
    const customerDetails = JSON.parse(
      <string>localStorage.getItem('customerDetails')
    );
    return this.moveMoneyService.validateMoveMoneyProcess({
      DestinationAccount: sendMoneyDetails.BeneficiaryDetails.accountNumber,
      Currency: sendMoneyDetails.PaymentDetails.currency,
      Amount: sendMoneyDetails.PaymentDetails.amount,
      CustomerId: customerDetails.cif,
    });
  }

  hasDestinationAccountErrors(obj: any) {
    if (Object.keys(obj).length > 0) {
      const error = Object.keys(obj)[0];
      if (obj[error]) return obj[error];
      return null;
    } else {
      return null;
    }
  }

  triggerErrorToast(message: string, hasTranslation?: boolean) {
    this.toastService.show(
      hasTranslation ? 'MOVE-MONEY.SECTIONS.TOAST.ERROR' : 'Error',
      message,
      MessageBoxType.DANGER,
      5000,
      undefined,
      undefined,
      !!hasTranslation
    );
  }

  triggerSuccessToast(message: string, hasTranslation?: boolean) {
    this.toastService.show(
      hasTranslation ? 'MOVE-MONEY.SECTIONS.TOAST.SUCCESS' : 'Success',
      message,
      MessageBoxType.SUCCESS,
      5000,
      undefined,
      undefined,
      !!hasTranslation
    );
  }

  updateRequiredMoveMoneyDocs(
    docData: {
      document: {
        data: string;
        docCode: string;
        filename: string;
        format: string;
      };
      documentCode?: string;
      file?: any;
    }[],
    docsInfo: any[],
    docArray: any,
    docValidators: any[]
  ) {
    const documentArray = docArray as FormArray;
    const uploads: {
      file: string;
      format: string;
      name: string;
      docCode: string;
    }[] = docData.map(doc => {
      if (doc.file) {
        return {
          file: doc.document.data,
          format: doc.document.format,
          name: doc.document.filename,
          docCode: doc?.documentCode || '',
        };
      } else {
        return {
          file: '',
          format: '',
          name: doc.document.filename,
          docCode: '',
        };
      }
    });

    for (let i = 0; i < uploads.length; i++) {
      const activeUpload = uploads[i];
      const activeValidator = docValidators.find(
        validator => validator.fileName === activeUpload.name
      );
      const docIndex = documentArray.controls.findIndex(
        doc => doc?.get('name')?.value === activeValidator?.formName
      );

      if (docIndex !== -1) {
        documentArray
          .at(docIndex)
          .get('value')
          ?.setValue(activeUpload.file.split(',')[1]);
      }
    }

    return uploads;
  }

  getMoveMoneyValuesFromStorage() {
    return JSON.parse(<string>localStorage.getItem('moveMoneyValues'));
  }

  isNotCrossCurrency(ownAccFormValues: any) {
    const destinationAccCurrency =
      ownAccFormValues.BeneficiaryDetails.accountCurrency;
    const currency = ownAccFormValues.PaymentDetails.currency;
    const sourceAccCurrency = ownAccFormValues.DebitAccountDetails.currency;
    if (destinationAccCurrency === currency) {
      return sourceAccCurrency === currency;
    } else {
      return false;
    }
  }

  reorderDocumentsToUpload(docsArray: any[], key: string, value: string) {
    return docsArray.sort((a, b) => {
      if (a[key].toLowerCase().includes(value)) return -1;
      if (b[key].toLowerCase().includes(value)) return 1;
      return 0;
    });
  }

  generateAccountInitials(accName: string) {
    const split = accName.split(' ');
    return (
      (split[0].charAt(0).toUpperCase() || '') +
      (split[1]?.charAt(0).toUpperCase() || '')
    );
  }
  generateAccountNames(accName: string) {
    const split = accName.split(' ');
    if (!split.length) return '';
    return (
      (split[0].charAt(0).toUpperCase() + split[0].slice(1).toLowerCase() ||
        '') +
      ' ' +
      ((split[1] || '')?.charAt(0)?.toUpperCase() +
        (split[1] || '').slice(1)?.toLowerCase())
    );
  }

  generateDate(incomingDate: Date): string {
    if (!incomingDate) return '';
    const date = new Date(incomingDate);
    return date.toISOString().slice(0, 10);
  }

  movemoneyProcessHasNoBio(noBio: boolean) {
    localStorage.setItem('movemoney-flow-type', JSON.stringify({ noBio }));
  }

  updateRequiredDocs(uploads: any) {
    localStorage.setItem('movemoney-doc-uploads', JSON.stringify(uploads));
  }

  getRequiredDocs() {
    const docs = localStorage.getItem('movemoney-doc-uploads');
    if (docs) {
      return JSON.parse(docs);
    } else {
      return [];
    }
  }

  doesNotUseBio() {
    const flowType = localStorage.getItem('movemoney-flow-type');
    if (flowType) {
      const bioInfo = JSON.parse(flowType);
      return !!(bioInfo && bioInfo.noBio);
    } else {
      return false;
    }
  }

  // const reorderedArr = reorderArray(arr, 'name', 'claire');
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { CustomerDetail } from '@app/shared/models/common/cifinquiry.model';
import { SaveAndInvest } from '@app/shared/models/save-and-invest/save-and-invest.model';
import { ApiService, SessionService } from '@app/shared/services';
import { environment } from '@env/environment';
import { v4 as uuid } from 'uuid';
import { AccountManagementService, AccountService } from '@app/core/services';
import { MatDialog } from '@angular/material/dialog';
import { AccountsListSelectorModalComponent } from '@app/home/customer/save-and-invest/components/shared/accounts-list-selector-modal/accounts-list-selector-modal.component';

@Injectable({
  providedIn: 'root',
})
export class SaveAndInvestService {
  private apiService = inject(ApiService);
  private accountService = inject(AccountService);
  private sessionService = inject(SessionService);
  private accountManagementService = inject(AccountManagementService);
  private http = inject(HttpClient);
  public dialog = inject(MatDialog);
  private router = inject(Router);

  productId: number = 0;
  callDepositToken = 'Call deposit';
  frequency!: SaveAndInvest.Frequency.Response;
  ticketResponse: any = null;

  get customerNotPresentDetail(): boolean {
    return JSON.parse(<string>localStorage.getItem('accMgntObj'));
  }

  castFrequency(frequency: string) {
    if (frequency == 'quarterly') {
      return 'Q';
    } else if (frequency == 'weekly') {
      return 'W';
    } else if (frequency == 'monthly') {
      return 'M';
    } else {
      return 'M';
    }
  }

  getCallDepositSaving(
    formdata: SaveAndInvest.FormDataCallDeposit,
    notificationsForm: any,
    customerPresent: boolean,
    customer: CustomerDetail.RootObject
  ): SaveAndInvest.CallDepositSavingRequest {
    let account = this.accountService
      .getCurrentAccounts()
      .find(x => x.accountNumber == formdata.debitAccount);
    if (formdata?.paymentType != 'recurring') {
      return {
        associatedId: uuid(),
        customerId: customer?.personalDetails.customerId,
        customerName: formdata?.accountName,
        ParentTicketId: formdata.ParentTicketId,
        taskData: {
          sourceAccountSchemeType: account?.schemeType || 'SBA',
          customerPresent,
          countryCode: formdata?.currency,
          initialSavingAmount: formdata?.initialAmount,
          notificationDetails: {
            email: notificationsForm?.Email,
            sms: notificationsForm?.Sms,
          },
          reference: uuid(),
          savingsAmountCurrency: formdata?.debitAccountCurrency,
          sourceAccount: formdata?.debitAccount,
          termsAndConditionsAccepted: true,
          useRecurringPayment:
            formdata?.paymentType === 'recurring' ? true : false,
        },
      };
    }
    let recurrentPaymentSettings: SaveAndInvest.RecurrentPaymentSettings = {
      amount: formdata.savingAmount,
      endDate: formdata.endDate,
      startDate: formdata.startDate,
      frequencyOfPayment: this.castFrequency(
        formdata.frequency.toLocaleLowerCase()
      ),
    };
    return {
      associatedId: uuid(),
      customerId: customer?.personalDetails.customerId,
      customerName: formdata?.accountName,
      ParentTicketId: formdata.ParentTicketId,
      taskData: {
        sourceAccountSchemeType: account?.schemeType || 'SBA',
        customerPresent: customerPresent,
        countryCode: formdata?.currency,
        initialSavingAmount: formdata?.initialAmount,
        notificationDetails: {
          email: notificationsForm?.Email,
          sms: notificationsForm?.Sms,
        },
        recurrentPaymentSettings: recurrentPaymentSettings,
        reference: uuid(),
        savingsAmountCurrency: formdata?.debitAccountCurrency,
        sourceAccount: formdata?.debitAccount,
        termsAndConditionsAccepted: true,
        useRecurringPayment:
          formdata?.paymentType === 'recurring' ? true : false,
      },
    };
  }

  getPhoneNumber(customer: CustomerDetail.RootObject): any {
    const preferred = customer?.contactDetails?.phoneNumbers.find(
      x => x.preferred === true
    );
    return preferred?.countryCode.concat(preferred?.number);
  }

  public submitCallDeposit(
    payload: SaveAndInvest.CallDepositSavingRequest
  ): Observable<any> {
    return this.http.post/*this.apiService.post*/ <any>(
      `${environment.apiUrl}/${this.saveDepositPath()}/submit-call`,
      payload
    );
  }

  setTicketResponse(ticketTaskData: any) {
    this.ticketResponse = ticketTaskData;
  }

  public verfiyBio(
    ticketId: any,
    biodata: any,
    isCustomerPresent: boolean,
    cif: string
  ): Observable<any> {
    const isDevEnv =
      environment.apiUrl === 'https:api-omnichannel-dev.azure-api.net' ||
      environment.apiUrl === 'http:localhost:4200' ||
      environment.apiUrl === 'https://api-dev.equitygroupholdings.com';

    const dummyFingerprint = [
      {
        position: 'RIGHT_INDEX',
        image: {
          format: 'BMP',
          resolutionDpi: 90,
          data: 'testingfingerprint',
        },
      },
      {
        position: 'RIGHT_INDEX',
        image: {
          format: 'BMP',
          resolutionDpi: 90,
          data: 'testingfingerprint',
        },
      },
    ];
    const bioObj = {
      cif: cif,
      fingerprints: isDevEnv ? dummyFingerprint : [biodata],
    };
    if (!isCustomerPresent) {
      return this.skipBio(ticketId);
    }
    return this.http.post/*this.apiService.post*/ <any>(
      `${environment.apiUrl}/${this.saveDepositPath()}/${ticketId}/verify-bio`,
      biodata
    );
  }

  public skipBio(ticketId: any) {
    return this.http.post/*this.apiService.post*/ <any>(
      `${environment.apiUrl}/${this.saveDepositPath()}/${ticketId}/skip-bio`,
      {}
    );
  }

  public getProduct(): Observable<SaveAndInvest.Product.Response> {
    return this.http.get/*this.apiService.get*/ <SaveAndInvest.Product.Response>(
      `${environment.apiUrl}/${this.saveDepositPath()}/products`
    );
  }

  public getFrequencyByProduct(
    productId: number
  ): Observable<SaveAndInvest.Frequency.Response> {
    return this.http.get/*this.apiService.get*/ <SaveAndInvest.Frequency.Response>(
      `${environment.apiUrl}/${this.saveDepositPath()}/products/${productId}/payment-frequencies`
    );
  }

  public SetFrequency(data: SaveAndInvest.Frequency.Response) {
    this.frequency = data;
  }

  public populateCallProductDetails(): Observable<SaveAndInvest.Frequency.Response> {
    return this.getProduct().pipe(
      mergeMap(s => {
        this.productId =
          s.responseObject.find(f =>
            f.name
              .toLocaleLowerCase()
              .includes(this.callDepositToken.toLocaleLowerCase())
          )?.productId || 0;
        return this.getFrequencyByProduct(this.productId);
      })
    );
  }

  public submitFixedDeposit(
    payload: SaveAndInvest.FixedDespositSubmitPayload
  ): Observable<any> {
    return this.http.post/*this.apiService.post*/ <any>(
      `${environment.apiUrl}/${this.saveDepositPath()}/submit-fixed`,
      payload
    );
  }

  public getFixedDepositPayload(
    formdata: SaveAndInvest.FormDataFixedDeposit,
    notificationsForm: any,
    customer: any
  ) {
    const payload: SaveAndInvest.FixedDespositSubmitPayload = {
      associatedId: uuid(),
      accountName: formdata.accountName,
      customerId: customer.cif,
      customerName: `${customer.firstName} ${customer.lastName}`,
      ParentTicketId: customer.ParentTicketId,
      taskData: {
        customerPresent: customer.customerPresent,
        notificationDetails: {
          sms: notificationsForm.Sms,
          email: notificationsForm.Email,
        },
        contactDetails: {
          phoneNumber: customer.phoneNumber1,
          email: customer.email,
          firstName: `${customer.firstName} ${customer.lastName}`,
        },
        depositAmount: formdata.initialAmount,
        investmentTermInMonths: formdata.customTerm
          ? +formdata.customTerm
          : +formdata.depositTerm,
        productId: 4, //Fixed deposit
        reference: 'Fixed deposit',
        rollOverOptionId: +formdata.rolloverOption.rollOverOptionId,
        shouldRollerOverOnMaturity: true,
        sourceAccount: formdata.debitAccount,
        currencyCode: formdata.debitAccountCurrency,
        termsAndConditionsAccepted: true,
        interestPercent: formdata.interestPercent,
        investmentReturns: formdata.investmentReturns,
      },
    };
    return payload;
  }

  public getCustomerAccounts(
    cif: number,
    actionFLow: string,
    currencyCode: string = 'KES'
  ): Observable<SaveAndInvest.DepositCustomerAccountsResponse> {
    return this.http.get/*this.apiService.get*/ <any>(
      `${environment.apiUrl}/${this.saveDepositPath()}/${cif}/accounts?actionFlow=${actionFLow}&currencyCode=${currencyCode}`
    );
  }

  public getRollOverOptions(): Observable<SaveAndInvest.RollOverOptionsResponse> {
    return this.http.get/*this.apiService.get*/ <any>(
      `${environment.apiUrl}/${this.saveDepositPath()}/rolloveroptions`
    );
  }

  public getBreakAccounts(accountNumber: string): Observable<any> {
    return this.http.get/*this.apiService.get*/ <any>(
      `${environment.apiUrl}/${this.saveDepositPath()}/deposit/${accountNumber}/source`
    );
  }

  public getInterestPercentEstimate(
    amount: number,
    termInMonths: number,
    amountCurrency: string = 'KES',
    bankId: string = this.sessionService.userBank
  ): Observable<SaveAndInvest.InterestEstimateResponse> {
    return this.http.get/*this.apiService.get*/ <any>(
      `${environment.apiUrl}/${this.saveDepositPath()}/returns-estimate?DepositAmount=${amount}&TermInMonths=${termInMonths}&AmountCurrency=${amountCurrency}&BankId=${bankId}`
    );
  }

  public async setupCustomerNotPresent(
    customerDetail: any,
    router: Router,
    actionFLow: string = 'FixedDepositFlow',
    selectedType: string = 'call',
    currencyCode: string = 'KES'
  ) {
    await this.getCustomerAccounts(
      customerDetail.cif,
      actionFLow,
      currencyCode
    ).subscribe(x => {
      const accounts = x.responseObject.filter(
        account => !['TD410', 'SB162'].includes(account.schemeCode)
      );

      this.openAccountsListSelectorModal(accounts, selectedType, router);
      // this.accountManagementService.setsaveAndInvestDetails({
      //     type: selectedType,
      //     accountNumber: account?.accountNumber,
      //     accountName: account?.accountName,
      //     accountCurrency: account?.accountCurreny,
      //     availableBalance: account?.availableBalance,
      // });

      // let route = '';
      // switch (selectedType) {
      //     case 'fixed':
      //         route = 'fixed-deposit-savings' ;
      //         break;
      //         case 'call':
      //         default:
      //         route = 'call-deposit-savings'
      //         break;
      // }

      // router
      //     .navigate([`/services/save-and-invest/${route}`])
      //     .then((r) => {});
    });
  }

  private saveDepositPath(): string {
    const isDevEnv =
      environment.apiUrl === 'https:api-omnichannel-dev.azure-api.net' ||
      environment.apiUrl === 'http:localhost:4200' ||
      environment.apiUrl === 'https://api-dev.equitygroupholdings.com';

    return isDevEnv
      ? 'term-deposit' /*'v1/backoffice/deposits'*/
      : 'term-deposit';
  }

  private openAccountsListSelectorModal(
    accounts: any,
    selectedType: string,
    router: Router
  ): void {
    const dialogRef = this.dialog.open(AccountsListSelectorModalComponent, {
      width: '520px',
      data: { accounts, selectedType },
    });
    dialogRef.afterClosed().subscribe(selectedAccount => {
      if (selectedAccount) {
        const account = accounts.find(
          (account: any) => account.accountNumber === selectedAccount
        );
        this.accountManagementService.setsaveAndInvestDetails({
          type: selectedType,
          accountNumber: selectedAccount,
          accountName: account?.accountName,
          accountCurrency: account?.accountCurreny,
          availableBalance: account?.availableBalance,
        });

        switch (selectedType) {
          case 'goal':
            // redirect to specific page for selected type
            break;
          case 'classic':
            // redirect to specific page for selected type
            break;
          case 'fixed':
            router.navigateByUrl(
              'services/customer-360/save-and-invest/fixed-deposit-savings'
            );
            break;
          case 'call':
            router.navigateByUrl(
              'services/customer-360/save-and-invest/call-deposit-savings'
            );
            break;

          default:
            break;
        }
      }
    });
  }
}

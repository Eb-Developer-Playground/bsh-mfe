import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Bio } from '@app/home/customer/account-statements/models/account-statement';
import {
  BalacenCertificateStatus,
  PayloadAccountBalance,
  PayloadCalculateCharge,
  PayloadChargeBalance,
  ResponseAccountBalance,
  ResponseCalculateCharge,
  ResponseCalculateChargeCantPay,
  ResponseObjectCalculateCharge,
  ResponseObjectTicketBalanceCertificate,
  ResponseTicketBalanceCertificate,
  BalacenCertificatePayload,
} from '@app/shared/models/statements/statements.model';
import { ApiService } from '@app/shared/services';

@Injectable({
  providedIn: 'root',
})
export class AccountBalanceCertificateService {
  private api = inject(ApiService);

  public submitAccountBalanceCertificate(
    data: BalacenCertificatePayload
  ): Observable<ResponseTicketBalanceCertificate> {
    return this.api.post<any>(`/v1/backoffice/BalanceRequest/submit`, data);
  }

  public calculateCharge(
    data: PayloadCalculateCharge
  ): Observable<ResponseCalculateCharge> {
    return this.api.post<any>(
      `/v1/backoffice/BalanceRequest/CalculateCharge`,
      data
    );
  }

  public getAccountBalance(
    data: PayloadAccountBalance
  ): Observable<ResponseAccountBalance> {
    return this.api.post<any>(`/v1/backoffice/BalanceRequest/Balance`, data);
  }
  /**
   * check the balance of the account and handling the posiblers cases
   * @param balancePayload
   * @param chargePayload
   * @returns ResponseAccountBalance | ResponseCalculateCharge
   */
  public canPayCertificate(
    balancePayload: PayloadAccountBalance,
    chargePayload: PayloadCalculateCharge
  ) {
    return this.getAccountBalance(balancePayload).pipe(
      switchMap(balanceResponse => {
        if (balanceResponse?.successful && balanceResponse?.responseObject) {
          // check if the account has the balance to pay
          const balanceAmount = +balanceResponse.responseObject.balance;
          const enoughBalanceToPayAmount =
            balanceAmount > +chargePayload.amount;
          if (!enoughBalanceToPayAmount) {
            return of<ResponseCalculateChargeCantPay>({
              status: BalacenCertificateStatus.CANTPAYCHARGE,
              message: balanceResponse?.responseObject.message,
            });
          }

          return this.calculateCharge(chargePayload).pipe(
            map(chargeResponse => {
              if (
                chargeResponse?.successful &&
                chargeResponse?.responseObject
              ) {
                // check if the account has the balance to charges
                const enoughBalanceToPayCharge =
                  balanceAmount >
                  +chargeResponse.responseObject.totalBalCertFee;
                if (!enoughBalanceToPayCharge) {
                  return <ResponseCalculateChargeCantPay>{
                    status: BalacenCertificateStatus.CANTPAYTOTALCHARGE,
                    message: balanceResponse?.responseObject.message,
                  };
                }
                //IF OK
                const response: ResponseObjectCalculateCharge = {
                  ...chargeResponse.responseObject,
                  status: BalacenCertificateStatus.CANPAY,
                  balance: balanceAmount,
                  totalCharge: `${+chargeResponse.responseObject.totalBalCertFee}`,
                  totalbalCertComm: `${+chargeResponse.responseObject.balCertComm}`,
                  totalbalCertFee: `${+chargeResponse.responseObject.balCertFee}`,
                };

                return response;
              }
              //error response or false on chargeResponse?.successful
              return chargeResponse;
            }) //end map
          );
        }
        //error response or false on balanceResponse?.successful
        return of(balanceResponse);
      })
    );
  }

  public setChargeBalance(
    data: PayloadChargeBalance,
    taskId: string
  ): Observable<any> {
    return this.api.post<any>(
      `/v1/backoffice/BalanceRequest/${taskId}/ChargeBalanceRequest`,
      data
    );
  }

  public verifyBio(data: Bio, taskId: string): Observable<any> {
    return this.api.post<any>(
      `/v1/backoffice/BalanceRequest/${taskId}/bio-verify`,
      data
    );
  }

  public getBalanceCertificateFile(taskId: number): Observable<any> {
    return this.api.get<any>(`/v1/backoffice/balancerequest/${taskId}/Print`);
  }
}

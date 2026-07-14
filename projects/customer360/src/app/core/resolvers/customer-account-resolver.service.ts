import { inject, Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';
import { mergeMap, retry, switchMap } from 'rxjs/operators';

import { AccountManagementService, AccountService } from '../services/';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';

@Injectable({
  providedIn: 'root',
})
export class CustomerAccountResolver implements Resolve<any> {
  private router = inject(Router);
  private accountService = inject(AccountService);
  private accountManagementService = inject(AccountManagementService);
  private toastService = inject(ToastService);


  resolve() {
    const canReload =
      this.router.getCurrentNavigation()?.extras?.state?.['resolve'];
    if (canReload === false) {
      return of({});
    }
    const customer: any = JSON.parse(
      <string>localStorage.getItem('accMgntObj')
    );

    let url = `?Id=${customer?.cif}&bankId=${customer?.bankID}&idType=customerid&reloadFromCache=false`;

    return this.accountService.getAccount(url).pipe(
      switchMap(res => {
        if (!res.successful) {
          this.toastService.show(
            null,
            'CUSTOMER.RETRY-ACCOUNT-INQUIRY',
            MessageBoxType.WARNING,
            5000,
            undefined,
            undefined,
            true
          );
          return throwError({ error: res });
        }
        return of(res);
      }),
      retry(1),
      mergeMap(result => {
        if (!result || !result.successful) return EMPTY;
        const customerDetails = result.responseObject;
        const obj = customerDetails.accounts.map((x: any) => {
          return { cif: customerDetails?.cif, ...x };
        });
        const relatedAccounts = customerDetails.relatedAccounts.map(
          (x: any) => {
            return { cif: customerDetails?.cif, ...x };
          }
        );

        const isMandateJoint: boolean = !!customerDetails.accounts?.find(
          (x: any) => x.mandate !== 'SELF'
        );

        const dormantAcc: [] =
          obj.filter(
            (x: any) =>
              !isMandateJoint &&
              x?.schemeCode !== 'SB199' &&
              x.accountStatus === 'D'
          ) || [];

        const dormCheck = () => {
          return dormantAcc.length > 0;
        };
        localStorage.setItem('dormantAccounts', JSON.stringify(dormantAcc));
        localStorage.setItem('dormantAccExists', JSON.stringify(dormCheck()));
        localStorage.setItem('dormantAvailable', JSON.stringify(dormantAcc));
        localStorage.setItem('accounts', JSON.stringify(obj));
        localStorage.setItem(
          'relatedAccounts',
          JSON.stringify(relatedAccounts)
        );
        localStorage.setItem(
          'customerDetails',
          JSON.stringify(customerDetails)
        ); //DELETE
        this.accountManagementService.setCustomerDetails(customerDetails);
        this.accountManagementService.setCustomer(customer);
        this.accountManagementService.setCustomerIsPresent(customer.isPresent);
        const isNonInd: boolean = !!result.responseObject?.identifications.find(
          (identification: any) =>
            identification.type === 'CompRegNo' && identification.id !== ''
        );
        const cifInquiryData = {
          BankId: customer?.bankID,
          CustomerID: customer?.cif,
        };
        return this.accountService.cifInquiryV2(isNonInd, cifInquiryData).pipe(
          switchMap(res => {
            if (!res.successful) {
              this.toastService.show(
                null,
                'CUSTOMER.RETRY-CIF-INQUIRY',
                MessageBoxType.WARNING,
                5000,
                undefined,
                undefined,
                true
              );

              return throwError({ error: res });
            }
            return of(res);
          }),
          retry(1),
          mergeMap((result: any) => {
            if (!result || !result.successful) {
              this.toastService.show(
                'CIF Inquiry',
                `${result.statusMessage}`,
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                false
              );
              this.router.navigate(['/services/']).then(r => {});
              return EMPTY;
            }
            const cifInquiryResult = result.responseObject;
            this.accountManagementService.setCustomerCifData(cifInquiryResult);
            return of(cifInquiryData);
          })
        );
      })
    );
  }
}

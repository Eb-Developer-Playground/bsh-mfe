import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { combineLatestWith } from 'rxjs/operators';
import { account } from '^src/mocks/v1/customer';

@Component({
  selector: 'app-customer-account-details',
  templateUrl: './customer-account-details.html',
  styleUrls: ['./customer-account-details.scss'],
})
export class CustomerAccountDetails implements OnInit, OnChanges {
  @Input() cifData$!: BehaviorSubject<any>;
  @Input() ticketData$!: BehaviorSubject<any>;

  accountData: any;

  isEntityOrJoint: boolean = false;

  ngOnInit(): void {
    this.cifData$
      .pipe(combineLatestWith(this.ticketData$))
      .subscribe(([cifData, ticketData]) => {
        if (cifData && ticketData) {
          const taskData = JSON.parse(ticketData?.taskData);
          console.log({ cifData, ticketData });
          this.accountData = cifData.accounts?.find(
            (acc: any) =>
              acc.accountNumber == taskData.CustomerDetails?.AcctId
          );

          const hasCompanyRegistrationID = !!cifData.identifications?.find(
            (identification: any) =>
              identification.type === 'CompRegNo' && identification.id !== ''
          );

          const hasRelatedAccounts = !!cifData.relatedAccounts;
          this.isEntityOrJoint = hasCompanyRegistrationID || hasRelatedAccounts;
        }
      });
  }

  ngOnChanges() {}

  protected readonly account = account;
}

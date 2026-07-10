import { inject, Injectable } from '@angular/core';
import { default as schemeCodesJSON } from '../../../../assets/data/schemecodes.json';
import { SessionService } from '@app/shared/services';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountManagementService {
  private session = inject(SessionService);

  isBusiness = false;
  isPresent = true;
  customerDetails: any;
  selectedAccountDetails: any;
  customer: any;
  customerImages: any;
  customerAccountsTableData: any;
  saveAndInvestDetails: any;
  schemeCodes: any[] =
    schemeCodesJSON.responseObject.filter(
      x => x.bankId === this.session.userBank
    ) || [];

  customerImages$ = new BehaviorSubject(null);

  constructor() {
    this.customerDetails = JSON.parse(
      <string>localStorage.getItem('customerDetails')
    );
  }

  setCustomerIsPresent = (isPresent: any) => (this.isPresent = isPresent);

  getCustomerIsPresent = () => this.isPresent;

  setCustomer = (customer: any) => (this.customer = customer);

  getCustomer = () => this.customer;

  setCustomerDetails = (details: any) => (this.customerDetails = details);

  getCustomerDetails = () => this.customerDetails;

  setCustomerSelectedAccountDetails = (accountDetails: any) =>
    (this.selectedAccountDetails = accountDetails);

  getCustomerSelectedAccountDetails = () => this.selectedAccountDetails;

  setCustomerCifData = (data: any) =>
    localStorage.setItem('customerCifData', JSON.stringify(data));

  getCustomerCifData = () => {
    const cifData: any = localStorage.getItem('customerCifData');
    return JSON.parse(cifData);
  };

  setCustomerImages = (images: any) => {
    this.customerImages$.next(images);
    return (this.customerImages = images);
  };

  getCustomerImages = () => this.customerImages;

  setIsCustomerBusiness = (isBusiness: boolean) => {
    this.isBusiness = isBusiness;
    localStorage.setItem('isBusiness', isBusiness.toString());
  };

  getIsCustomerBusiness = () => this.isBusiness;

  getCustomerAccountsTableData = () => {
    const accountNotLAA = (account: any) => account.schemeType !== 'LAA';
    const filteredAccounts = this.getCustomerAccountsWhere(accountNotLAA)
      ?.map((account: any) => {
        let schemeType: string;
        switch (account.schemeCode) {
          case 'TD410':
            schemeType = 'Fixed Deposit';
            break;
          case 'SB162':
            schemeType = 'Call Deposit';
            break;
          case 'SB142':
            schemeType = 'Savings';
            break;
          default:
            schemeType = account.schemeType;
            break;
        }
        return {
          ...account,
          schemeType,
        };
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.accountOpeningDate).getTime();
        const dateB = new Date(b.accountOpeningDate).getTime();
        return dateB - dateA;
      });
    return (this.customerAccountsTableData = filteredAccounts);
  };

  filterAccounts = () => {
    const accountNotLAA = (account: any) =>
      !['LAA', 'ODA', 'TDA'].some(scheme => account.schemeType.split(',').includes(scheme)) || account.accountStatus !== 'A';
    const filteredAccounts = this.getCustomerAccountsWhere(accountNotLAA)
      ?.map((account: any) => {
        const matchingScheme = this.schemeCodes[0]?.data.find((c: any) => c.SchemeCode === account.schemeCode);
        const display = matchingScheme?.AccountType?.split(' ') || [];
        let displayName: string[] | string = display;

        if (display.length > 1) {
          displayName = display.slice(1, 2).join(' ');
        } else {
          displayName = display[0] || '';
        }
        return {
          ...account,
          AccountType: matchingScheme ? displayName : account.schemeType,
        };
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.accountOpeningDate).getTime();
        const dateB = new Date(b.accountOpeningDate).getTime();
        return dateB - dateA;
      });
    return (this.customerAccountsTableData = filteredAccounts);
  };

  getCustomerAccounts = () => {
    if (!this.customerDetails) {
      return;
    }
    return this.customerDetails.accounts;
  };

  getCustomerAccountsWhere = (filterFunction: any) => {
    if (!this.customerDetails) {
      return;
    }
    const accounts: any = [
      ...this.customerDetails.accounts,
      ...this.customerDetails.relatedAccounts,
    ];

    return accounts.filter(filterFunction);
  };

  reset = () => {
    this.customer = null;
    this.customerDetails = null;
    this.customerAccountsTableData = null;
    this.customerImages = null;
    this.isBusiness = false;
    this.isPresent = true;
    localStorage.removeItem('accMgntObj');
    localStorage.removeItem('staticDataUpdateFormValues');
    localStorage.removeItem('staticDataUpdateTicketId');
  };

  setsaveAndInvestDetails = (data: any) => (this.saveAndInvestDetails = data);

  getsaveAndInvestDetails = () => this.saveAndInvestDetails;

  setDepositAccounts = (accounts: Array<any> | null) =>
    localStorage.setItem('depositAccounts', JSON.stringify(accounts));

  getDepositAccountsWhere = (filterFunction: any) => {
    if (!localStorage.getItem('depositAccounts')) {
      return undefined;
    }
    const accounts: Array<any> = JSON.parse(
      <string>localStorage.getItem('depositAccounts')
    );
    if (!accounts || !accounts.length) {
      return undefined;
    }
    return accounts.filter(filterFunction);
  };

  getPreferredPhoneNumber(): string {
    if (!this.customerDetails) {
      return '';
    }
    return <string>this.customerDetails.phoneNumbers
      .map((item: any) => {
        return {
          preferred: item.preferred,
          phoneNumber: `${item.cityCode} ${item.number}`,
        };
      })
      .find((phoneNumber: any) => phoneNumber.preferred)?.phoneNumber;
  }

  getPreferredEmail(): string {
    if (!this.customerDetails) {
      return '';
    }
    return <string>this.customerDetails.emailAddresses
      .map((item: any) => {
        return {
          preferred: item.preferred,
          emailAddress: `${item.emailAddress}`,
        };
      })
      .find((emailAddress: any) => emailAddress.preferred)?.emailAddress;
  }

  getCountryInfo = () =>
    JSON.parse(<string>localStorage.getItem('countryInfo'));

  getEmails(): any[] {
    if (!this.getCustomerCifData()) {
      return [];
    }

    const emailList = this.getCustomerCifData()?.contactDetails?.emailAddresses;
    return <any[]>emailList.map((item: any) => {
      return {
        preferred: item.preferred,
        emailAddress: `${item.emailAddress}`,
      };
    });
  }
}

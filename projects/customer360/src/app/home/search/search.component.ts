import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, DatePipe } from '@angular/common';

import { AccountService } from '../../core/services/account/account.service';
import { ToastService } from '../../shared/modules/toast/toast.service';
import { MessageBoxType } from '../../shared/modules/toast/models';
import { SessionService } from '../../shared/services/session/session.service';
import { WhiteSpaceValidator } from '../../shared/directives/whitespace-validator';
import { ChannelsService } from '../../core/services/channels/channels.service';
import { AccountManagementService } from '../../core/services/account-management/account-management.service';
import { SEARCH_OPTIONS } from '../../shared/static/search-options';
import { LoaderComponent } from '../../shared/modules/loader/loader.component';
import { CustomerSearchTableComponent } from './customer-search-table/customer-search-table.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatDividerModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
    LoaderComponent,
    CustomerSearchTableComponent,
  ],
  providers: [DatePipe],
})
export class SearchComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly accountService = inject(AccountService);
  private readonly toastService = inject(ToastService);
  private readonly accountManagementService = inject(AccountManagementService);
  private readonly sessionService = inject(SessionService);
  private readonly channelsService = inject(ChannelsService);

  protected readonly Number = Number;

  protected searchForm: UntypedFormGroup = this.fb.group({
    option: ['', Validators.required],
    searchText: ['', [Validators.required, WhiteSpaceValidator.containsOnlySpaces]],
  });

  protected selectedOption = 'National ID';
  protected showSearchTable = false;
  protected eddFlow = false;
  protected noResult = false;
  protected showClearButton = false;
  protected searchOptions: any[] = [];
  protected customerData: any[] = [];
  protected accountsRes: any;
  protected currentUserBankId: string | undefined;
  protected searchInput: any;
  protected loadingSearch = false;
  protected searchFailed = false;
  protected selectedAccount: any = null;
  protected searchOptionsArr: any[] = [];
  protected activeCifFData: any = null;

  protected currentUserBankIdNum = 0;

  ngOnInit(): void {
    this.channelsService.storeChannels();
    const bankId = this.sessionService.userBank;
    this.searchOptionsArr = this.getSearchOptionsByBankId(bankId);
    this.searchOptions = this.searchOptionsArr?.map((option: any) => option);
    this.currentUserBankId = this.sessionService.user?.bankId;
    this.currentUserBankIdNum = Number(this.currentUserBankId);
    this.filterSearchOptionsByBankId(this.currentUserBankId);

    this.getDropdown();
  }

  private filterSearchOptionsByBankId(bankId: string | undefined): void {
    const arr: any = SEARCH_OPTIONS.find(x => x.bank_id === bankId);
    if (arr) {
      this.searchForm.patchValue({
        option: arr.options.filter((x: any) => x.default === true)[0]?.value,
      });
    }
  }

  private getSearchOptionsByBankId(bankId: string | undefined): any[] {
    const searchOption = SEARCH_OPTIONS.find(option => option.bank_id === bankId);
    return searchOption ? searchOption.options : [];
  }

  private getDropdown(): void {
    this.accountService.getDropdown(true).subscribe();
    this.accountService.getCountryInfo().subscribe();
  }

  protected openDropdown(select: any): void {
    select.open();
  }

  protected oninputChange(): void {
    this.selectedOption = this.searchForm.controls['option'].value;
    const searchText = this.searchForm.get('searchText')?.value;
    if (searchText) {
      this.searchForm.patchValue({
        searchText: searchText.toUpperCase().trim(),
      });
    }
  }

  protected onSearchSubmit(): void {
    const form = this.searchForm.value;
    this.loadingSearch = true;
    this.searchFailed = false;

    const searchParams = this.getSearchParams();
    if (!searchParams) {
      this.loadingSearch = false;
      return;
    }
    this.accountService.getAccount(searchParams, true).subscribe({
      next: (v: any) => {
        this.loadingSearch = false;
        this.customerData = [v.responseObject];
        if (form['option'] === 'Account Number') {
          this.fetchDetailsByCif(v.responseObject?.cif, form);
        } else {
          this.persistData(v, form['option'], form['value']);
        }
      },
      error: () => {
        this.loadingSearch = false;
        this.searchFailed = true;
      },
    });
  }

  private fetchDetailsByCif(cif: string, form: any): void {
    this.loadingSearch = true;
    const v = `?Id=${cif}&bankId=${this.currentUserBankId}&idType=customerid&reloadFromCache=false`;
    this.accountService.getAccount(v, false).subscribe(x => {
      this.loadingSearch = false;
      this.persistData(x, form['option'], form['value']);
    });
  }

  private getSearchParams(): string | undefined {
    this.eddFlow = false;
    this.noResult = false;

    const option = this.searchForm.controls['option'].value;
    const searchValue = this.searchForm.controls['searchText'].value.trim();

    if (this.searchForm.status === 'INVALID') {
      return;
    }

    if (searchValue === '12345') {
      this.customerData = [];
      this.noResult = true;
      this.showClearButton = true;
      return `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=nationalid&reloadFromCache=false`;
    }
    if (searchValue === '123456') {
      this.eddFlow = true;
      this.showClearButton = true;
    }

    let uriString: string;
    switch (option) {
      case 'National ID':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=nationalid&reloadFromCache=false`;
        break;
      case 'Account Number':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=accountid&reloadFromCache=false`;
        break;
      case 'Mobile Number':
      case 'Phone Number':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=phoneno&reloadFromCache=false`;
        break;
      case "Voter's Card":
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=voterscard&reloadFromCache=false`;
        break;
      case 'Other Document Number':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=othdocno&reloadFromCache=false`;
        break;
      case 'Passport Number':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=passportno&reloadFromCache=false`;
        break;
      case 'CIF':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=customerid&reloadFromCache=false`;
        break;
      case 'Maisha Card':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=maishacard&reloadFromCache=false`;
        break;
      case 'Alien ID':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=alienid&reloadFromCache=false`;
        break;
      case 'Permit ID':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=permitid&reloadFromCache=false`;
        break;
      case 'Military ID':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=militaryid&reloadFromCache=false`;
        break;
      case 'Police ID':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=policeid&reloadFromCache=false`;
        break;
      case 'Driver License':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=drivinglic&reloadFromCache=false`;
        break;
      case 'Refugee ID':
        uriString = `?Id=${searchValue}&bankId=${this.currentUserBankId}&idType=refugeeid&reloadFromCache=false`;
        break;
      default:
        uriString = ``;
        break;
    }
    this.searchInput = { option, searchValue };
    return uriString;
  }

  private persistData(v: any, option: string, value: string): void {
    if (!v.successful) {
      this.toastService.show('Search', v.statusMessage, MessageBoxType.DANGER, 5000, undefined, undefined, false);
      return;
    }

    if (!v.responseObject) {
      this.searchFailed = true;
      this.toastService.show('Search', v.statusMessage, MessageBoxType.WARNING, 5000, undefined, undefined, false);
      return;
    }

    if (v.successful) {
      this.toastService.show('', 'CUSTOMER.SEARCH.CUSTOMER-FOUND', MessageBoxType.SUCCESS, 5000, undefined, undefined, true);
      this.customerData = [v.responseObject];

      const filteredAccounts = [
        ...(v.responseObject.accounts.filter(
          (account: any) => account.mandate === 'SELF' && account.accountStatus === 'D' && (account.schemeType === 'SBA' || account.schemeType === 'CAA'),
        ) || []),
        ...(v.responseObject.accounts.filter(
          (account: any) => account.mandate === 'SELF' && account.accountStatus === 'A' && (account.schemeType === 'SBA' || account.schemeType === 'CAA'),
        ) || []),
        ...(v.responseObject.accounts.filter(
          (account: any) => account.mandate !== 'SELF' && account.accountStatus === 'A' && (account.schemeType === 'SBA' || account.schemeType === 'CAA'),
        ) || []),
        ...(v.responseObject.accounts.filter(
          (account: any) => account.mandate !== 'SELF' && account.accountStatus === 'D' && (account.schemeType === 'SBA' || account.schemeType === 'CAA'),
        ) || []),
      ];
      this.accountsRes = filteredAccounts.length > 0 ? filteredAccounts : [];
      this.checkJointAndEntityAccs(v.responseObject, this.accountsRes);
    }
  }

  private checkJointAndEntityAccs(res: any, accounts: any[]): void {
    const isEntity = res?.retCorpFlg !== 'Retail';

    if (isEntity) {
      this.showSearchTable = true;
      this.showClearButton = true;
      this.storeUser(res);
      this.accountManagementService.setIsCustomerBusiness(true);
    } else {
      const hasSelf = accounts.some((a: any) => a.mandate === 'SELF');
      const hasJoint = accounts.some((a: any) => a.mandate && a.mandate !== 'SELF');
      const hasAccounts = accounts.length > 0;

      if (hasAccounts) {
        this.showSearchTable = true;
        this.showClearButton = true;
        this.storeUser(res);
        this.accountManagementService.setIsCustomerBusiness(false);
      } else {
        this.toastService.show(
          'Personal Account Check',
          'Customer Does Not Have A Personal Account',
          MessageBoxType.WARNING,
          5000,
          undefined,
          undefined,
          false,
        );
        this.searchFailed = true;
        this.storeUser(res);
        this.router.navigateByUrl('/customer360/services/customer-360');
      }
    }
  }

  protected clearSearchText(): void {
    this.searchForm.controls['searchText'].setValue('');
    this.showClearButton = false;
    this.showSearchTable = false;
    this.selectedAccount = null;
  }

  protected changeSearchFilter(): void {
    this.clearSearchText();
    const option = this.searchForm.controls['option'].value;
    this.selectedOption = this.searchForm.controls['option'].value;
    const vals = this.searchOptionsArr?.find((el: any) => el.name === option)?.validators;
    this.searchForm.get('searchText')!.setValidators(vals);
    this.searchForm.get('searchText')!.updateValueAndValidity();
  }

  private storeUser(value: any): void {
    this.activeCifFData = value;
    const acc = value.accounts[0];
    const objAcc = {
      cif: value.cif,
      bankID: value.bankID,
      idNumber: value.identifications?.[0]?.id,
      accountsId: acc?.accountNumber,
      firstName: value.firstName,
      lastName: value.lastName,
      dateOfBirth: value.dateOfBirth,
      idType: value.identifications?.[0]?.type,
      mandate: acc?.mandate,
      accountType: acc?.schemeType,
      isPresent: true,
    };
    localStorage.setItem('accMgntObj', JSON.stringify(objAcc));
  }

  protected quit(): void {
    this.clearSearchText();
    this.router.navigateByUrl('/customer360/dashboard');
  }

  protected onSelectedAccount(event: any): void {
    this.selectedAccount = event;
    if (this.activeCifFData) {
      const selectedAcc = this.activeCifFData.accounts.find(
        (acc: any) => acc.accountNumber === this.selectedAccount?.accountNumber,
      );
      if (!selectedAcc) return;
      const objAcc = {
        cif: this.activeCifFData.cif,
        bankID: this.activeCifFData.bankID,
        idNumber: this.activeCifFData.identifications?.[0]?.id,
        accountsId: selectedAcc.accountNumber,
        firstName: this.activeCifFData.firstName,
        lastName: this.activeCifFData.lastName,
        dateOfBirth: this.activeCifFData.dateOfBirth,
        idType: this.activeCifFData.identifications?.[0]?.type,
        mandate: selectedAcc.mandate,
        accountType: selectedAcc.schemeType,
        isPresent: true,
      };
      localStorage.setItem('accMgntObj', JSON.stringify(objAcc));
    }
  }

  protected onClosed(): void {
    this.clearSearchText();
  }
}

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { default as BANLIST } from '../../../../assets/data/banlist.json';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
import { TranslateService } from '@ngx-translate/core';
import { TransactionsService } from '../../services/transactions/transactions.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'dialog-bic-search',
  templateUrl: 'bic-search-dialog.html',
  styleUrls: ['bic-search-dialog.scss'],
})
export class BicSearchDialog implements OnInit, OnDestroy {
  filteredOptions!: Observable<
    {
      bankName: string;
      code: string;
      bankCountryCode: string;
      bankFullName?: string;
      bankShortName?: string;
    }[]
  >;
  branchCityCodes: any = [];
  filteredBranchCityCodes: any = [];
  branchCodes: any = [];
  filteredBranchCodes: any = [];
  form: UntypedFormGroup = this.fb.group({
    query: [''],
  });

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    public dialogRef: MatDialogRef<BicSearchDialog>,
    private transService: TransactionsService,
    private fb: UntypedFormBuilder,
    private toast: ToastService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form.controls.query.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(v => {
        if (data.cities || data.branchCityCode) {
          this.filterCodes(v);
        } else if (data.localBank) {
          this.searchLocalBanks(v);
        } else {
          this.searchBIC(v);
        }
      });
  }

  ngOnInit() {
    if (this.data.cities) {
      this.searchBranchCityCode();
    } else if (this.data.branchCityCode) {
      this.searchBranchCode();
    } else if (this.data.localBank) {
      this.searchLocalBanks();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClickBank(data: any) {
    if (
      BANLIST.map((bank: { CountryCode: any }) => bank.CountryCode).includes(
        data.bankCountryCode
      )
    ) {
      const countryName = BANLIST.find(
        (bank: { CountryCode: string }) =>
          bank.CountryCode === data.bankCountryCode
      )?.CountryName;

      this.toast.show(
        null,
        this.translate.instant('COMMON.ERROR.COUNTRY_NAME_NOT_ALLOWED', {
          value1: countryName,
        }),
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
      //this.dialogRef.close({});
    } else {
      this.dialogRef.close({ data: data });
    }
  }

  onClickBranchCityCode(data: any) {
    this.dialogRef.close({ data: data });
  }

  searchBIC(query: string): void {
    this.transService
      .searchBICs(query, this.data?.countryCode ? this.data?.countryCode : '')
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp: { responseObject: any }) => {
        this.filteredOptions = of(resp.responseObject);
      });
  }

  searchLocalBanks(query = ''): void {
    this.transService
      .searchLocalBanks(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp: { responseObject: any }) => {
        this.filteredOptions = of(resp.responseObject.item3);
      });
  }

  searchBranchCityCode() {
    this.transService
      .searchLocalCities()
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp: { responseObject: any }) => {
        this.filteredBranchCityCodes = resp.responseObject;
        this.branchCityCodes = resp.responseObject;
      });
  }

  searchBranchCode() {
    this.transService
      .searchBranchCode(this.data.cityCode, this.data.bankCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp: { responseObject: any }) => {
        this.filteredBranchCodes = resp.responseObject.item3;
        this.branchCodes = resp.responseObject.item3;
      });
  }

  filterCodes(v: any) {
    if (this.data.branchCityCode) {
      if (!v) {
        this.filteredBranchCodes = this.branchCodes;
      }

      this.filteredBranchCodes = this.branchCodes.filter(
        (city: any) =>
          city?.branchCode.includes(v) ||
          city?.name.toLowerCase().includes(v.toLowerCase())
      );
    } else {
      if (!v) {
        this.filteredBranchCityCodes = this.branchCityCodes;
      }
      this.filteredBranchCityCodes = this.branchCityCodes.filter(
        (city: any) =>
          city?.code.includes(v) ||
          city?.description.toLowerCase().includes(v.toLowerCase())
      );
    }
  }

  onClearSearch() {
    this.form.controls.query.setValue('');
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

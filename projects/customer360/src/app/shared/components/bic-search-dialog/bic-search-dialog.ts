import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { default as BANLIST } from 'src/app/assets/data/banlist.json';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { TransactionsService } from 'src/app/core/services/transactions/transactions.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dialog-bic-search',
  templateUrl: './bic-search-dialog.html',
  styleUrls: ['./bic-search-dialog.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatIconModule,
    TranslatePipe,
  ],
})
export class BicSearchDialog implements OnInit, OnDestroy {
  filteredOptions!: Observable<
    { bankName: string; code: string; bankCountryCode: string }[]
  >;
  branchCityCodes: any = [];
  filteredBranchCityCodes: any = [];
  branchCodes: any = [];
  filteredBranchCodes: any = [];
  form!: UntypedFormGroup;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    public dialogRef: MatDialogRef<BicSearchDialog>,
    private transService: TransactionsService,
    private fb: UntypedFormBuilder,
    private toast: ToastService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      query: [''],
    });
    
    this.form.controls['query'].valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(v => {
        if (this.data.cities || this.data.branchCityCode) {
          this.filterCodes(v);
        } else if (this.data.localBank) {
          this.searchLocalBanks(v);
        } else {
          this.searchBIC(v);
        }
      });
      
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

  onClickBank(data: {
    bankName: string;
    code: string;
    bankCountryCode: string;
  }) {
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
                this.translate.instant(
                    "COMMON.ERROR.COUNTRY_NAME_NOT_ALLOWED",
                    {
                        value1: countryName,
                    }
                ),
                MessageBoxType.DANGER,
                5000, undefined, undefined, false
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
        this.filteredOptions = of(resp.responseObject);
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
        this.filteredBranchCodes = resp.responseObject;
        this.branchCodes = resp.responseObject;
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
    this.form.controls['query'].setValue('');
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

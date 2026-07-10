import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import moment from 'moment';
import {
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs';
import { ToastService } from 'src/app/shared/modules/toast';
import { TableFields } from '../../models/table-fields.models';
import { TableDataService } from '../../services/table-data.service';

@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss'],
})
export class TableFilterComponent implements OnInit, OnDestroy {
  selectable = true;
  removable = true;
  selectedChipItem: any[] = [];
  isSubmitted = false;
  dropDownSearch: any[] = [];
  dropDownHasValues = false;
  errorMessage = '';
  checkDateError = false;
  showRangeDate = false;

  @Input() toggleFilter = false;
  @Input() searchFields$!: Observable<TableFields[]>;

  filterForm: UntypedFormGroup = this.fb.group({
    filters: ['', [Validators.required]],
    search: [{ value: '', disabled: true }, [Validators.required]],
    toDate: ['', [Validators.required]],
    fromDate: ['', [Validators.required]],
  });

  private destroy$ = new Subject<void>();

  constructor(
    private fb: UntypedFormBuilder,
    public toast: ToastService,
    private tableDataService: TableDataService,
    protected changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.filterForm.controls.fromDate.valueChanges,
      this.filterForm.controls.toDate.valueChanges,
    ]).subscribe(([fromDate, toDate]) => {
      const control = this.filterForm.controls?.filters;
      const key = control.value?.name;
      const label = control.value?.label;
      const type = control.value?.type;

      if (!key) {
        return;
      }

      this.selectedChipItem = this.selectedChipItem.filter(
        filters => filters.key !== key
      );

      this.selectedChipItem.push({
        type,
        key,
        value: {
          fromDate,
          toDate,
        },
        display: `${label}: ${moment(fromDate).format('YYYY-MM-DD')} to ${moment(toDate).format('YYYY-MM-DD')}`,
      });
    });

    this.filterForm.controls.filters.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(_v => {
        this.showRangeDate = _v.type === 'DATE';
        this.changeDetectorRef.detectChanges();
        this.updateFormValidity();
      });

    this.filterForm.controls.search.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(_v => {
        const _value = typeof _v === 'object' ? _v?.value : _v;
        const _search = typeof _v === 'object' ? _v?.label : _v;
        const _displaySearch = `${this.filterForm.value.filters.label}: ${_search}`;
        const _key = this.filterForm.value.filters.name;

        const findKey = this.selectedChipItem.findIndex(
          chip => chip.key === _key
        );
        if (findKey !== -1) {
          this.selectedChipItem.splice(findKey, 1);
        }
        if (_search) {
          this.selectedChipItem.push({
            key: _key,
            value: _value,
            display: _displaySearch,
          });
        }
      });

    this.filterForm.controls.filters.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => {
        this.dropDownHasValues =
          value &&
          value.filterDropDownValues &&
          value.filterDropDownValues.length &&
          value.filterDropDownValues.length !== 0
            ? true
            : false;

        this.filterForm?.get('search')?.enable();

        this.dropDownSearch = this.dropDownHasValues
          ? value.filterDropDownValues
          : [];

        const findKey = this.selectedChipItem.findIndex(
          chip => chip.key === value.name
        );
        if (findKey !== -1) {
          this.selectedChipItem.splice(findKey, 1);
        }

        this.filterForm.get('search')?.setValue(null, { emitEvent: false });
      });
  }

  clearFilters() {
    this.filterForm.reset({}, { emitEvent: false });
    // this.filterForm.patchValue({
    //     filters: '',
    //     search: ''

    // });

    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.setErrors(null);
    });

    this.onSubmit();
  }
  clearAllFilters() {
    this.selectedChipItem = [];
    this.filterForm.reset({}, { emitEvent: false });
    // this.filterForm.patchValue({
    //     status: '',
    //     subject: '',
    //     createdBy: '',
    //     toDate: '',
    //     fromDate: '',
    //     customerId: '',
    //     ticketId: '',
    // });

    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.setErrors(null);
    });

    // if (this.isSubmitted)

    this.onSubmit();

    this.isSubmitted = false;
  }
  remove(chip: any): void {
    const index = this.selectedChipItem.indexOf(chip);
    if (index >= 0) {
      this.selectedChipItem.splice(index, 1);
      Object.keys(this.filterForm.value).forEach(element => {
        if (chip.key == element) {
          this.filterForm.patchValue({ [element]: '' });
        }
      });

      const updateObj = Object.keys(this.filterForm.value).reduce(
        (acc: any, prop) => {
          if (this.filterForm.value[prop] !== '') {
            acc[prop] = this.filterForm.value[prop];
          }
          return acc;
        },
        {}
      );

      if (updateObj.toDate && (updateObj.fromDate == undefined || null)) return;
      else if ((updateObj.toDate == undefined || null) && updateObj.fromDate)
        return;
      else if (updateObj.toDate && updateObj.fromDate) this.onSubmit();
      else if (
        (updateObj.toDate == undefined || null) &&
        (updateObj.fromDate == undefined || null)
      ) {
        Object.keys(this.filterForm.controls).forEach(key => {
          this.filterForm.get(key)?.setErrors(null);
        });
        this.onSubmit();
      } else if (
        (updateObj.toDate == undefined ||
          (null && updateObj.fromDate == undefined) ||
          null) &&
        Object.keys(updateObj).length > 0
      )
        this.onSubmit();
    }
  }
  onSubmit() {
    this.tableDataService.setFilters(this.selectedChipItem);
  }
  keyDown(value: any) {
    const allowedRegex = /[0-9/]/g;

    if (!allowedRegex.test(value.key)) {
      value.preventDefault();
    }
  }
  validateDateRange() {
    const todate = this.filterForm.value.toDate;
    const fromdate = this.filterForm.value.fromDate;

    if (this.filterForm.invalid && todate == null && fromdate == null) {
      this.checkDateError = false;
    } else if (this.filterForm.invalid && todate == '' && fromdate == '') {
      this.checkDateError = false;
    } else if (this.filterForm.invalid && todate == null && fromdate !== '') {
      this.checkDateError = true;
      this.errorMessage = 'Invalid Date';
    } else if (this.filterForm.invalid && todate !== '' && fromdate == null) {
      this.checkDateError = true;
      this.errorMessage = 'Invalid Date';
    } else if (this.filterForm.invalid && todate == '' && fromdate == null) {
      this.checkDateError = false;
    } else if (this.filterForm.invalid && todate == null && fromdate == '') {
      this.checkDateError = false;
    } else if (this.filterForm.invalid && todate == '' && fromdate !== '') {
      this.checkDateError = true;
      this.errorMessage = 'Invalid Date';
    } else if (this.filterForm.invalid && todate !== '' && fromdate == '') {
      this.checkDateError = true;
      this.errorMessage = 'Invalid Date';
    } else if (!this.filterForm.invalid && todate == null && fromdate == null) {
      this.checkDateError = false;
    }
    if (!this.filterForm.invalid && todate == '' && fromdate == '') {
      this.checkDateError = false;
    } else if (!this.filterForm.invalid && todate == '' && fromdate == null) {
      this.checkDateError = false;
    } else if (!this.filterForm.invalid && todate == null && fromdate == '') {
      this.checkDateError = false;
    } else if (!this.filterForm.invalid && todate == '' && fromdate !== '') {
      this.checkDateError = true;
      this.errorMessage = 'Invalid Date';
    } else if (!this.filterForm.invalid && todate !== '' && fromdate == '') {
      this.checkDateError = true;
      this.errorMessage = 'Invalid Date';
    } else if (!this.filterForm.invalid && todate !== '' && fromdate !== '') {
      this.checkDateError = false;
    }

    return this.checkDateError;
  }
  private updateFormValidity() {
    //        this.filterForm.clearValidators();

    Object.keys(this.filterForm.controls).forEach(key => {
      const control = this.filterForm.get(key);
      if (control) {
        control.removeValidators(Validators.required);
        control.updateValueAndValidity({
          emitEvent: false,
        });
      }
    });

    if (this.showRangeDate) {
      this.filterForm.controls.fromDate.setValidators([Validators.required]);
      this.filterForm.controls.toDate.setValidators([Validators.required]);
    } else {
      this.filterForm.controls.search.setValidators([Validators.required]);
    }
    this.filterForm.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

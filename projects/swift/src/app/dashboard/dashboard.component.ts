import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { TicketItem } from './tickets-datasource';
import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import moment from 'moment';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass, AsyncPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,

    AsyncPipe,
    DatePipe,
    TranslatePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  dataSource: any = [];
  selection = new SelectionModel<TicketItem>(true, []);

  displayedColumns = ['subject', 'customerName', 'customerCif', 'id', 'createdBy', 'createdOnUtc', 'status'];
  selectedChipItem: any[] = [];
  updatedChips: any;
  errorMessage = '';
  checkDateError = false;
  selectable = true;
  removable = true;
  ticketRequest: any = [];
  tickets$!: Observable<any[]>;
  totalTicketsCount!: number;
  subjectDropdown!: any[];
  createdbyDropdown!: any[];
  isSubmitted = false;
  statusDropdown: string[] = ['All', 'Submitted', 'Completed', 'Returned', 'Rejected', 'Pending'];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 30, 50, 100, 300];

  filteredCreatedByOptions!: Observable<string[]>;
  filterForm!: FormGroup;

  public toggleFilter: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      subject: [''],
      status: [''],
      createdBy: [''],
      toDate: [moment(Date.now()).format('YYYY-MM-DD')],
      fromDate: [moment(Date.now()).subtract(7, 'days').format('YYYY-MM-DD')],
      customerId: [''],
      ticketId: [''],
    });

    this.filteredCreatedByOptions = this.filterForm.get('createdBy')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.filterForm.valueChanges.subscribe(value => {
      this.selectedChipItem = [];
      Object.keys(value).map(key => {
        if (value[key] !== null && value[key] !== '') {
          const todate = value.toDate;
          const fromdate = value.fromDate;
          this.selectedChipItem.push({
            key: key,
            value:
              (todate !== '' && key == 'toDate') || (fromdate !== '' && key == 'fromDate')
                ? moment(value[key]).format().slice(0, 10)
                : value[key],
          });
        }
      });
    });

    const ticketId = this.route.snapshot.queryParams?.['ticket'];
    if (ticketId) {
      // Ticket routing will be handled when TicketsService is available
      console.warn('Ticket routing by query param needs TicketsService');
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.createdbyDropdown
      ? this.createdbyDropdown.filter((option: any) => option.toLowerCase().includes(filterValue))
      : [];
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  toggle() {
    this.toggleFilter = !this.toggleFilter;
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

      const updateObj = Object.keys(this.filterForm.value).reduce((acc: any, prop) => {
        if (this.filterForm.value[prop] !== '') {
          acc[prop] = this.filterForm.value[prop];
        }
        return acc;
      }, {});

      if (updateObj.toDate && (updateObj.fromDate == undefined || null)) return;
      else if ((updateObj.toDate == undefined || null) && updateObj.fromDate) return;
      else if (updateObj.toDate && updateObj.fromDate) this.onSubmit();
      else if ((updateObj.toDate == undefined || null) && (updateObj.fromDate == undefined || null)) {
        Object.keys(this.filterForm.controls).forEach(key => {
          this.filterForm.get(key)?.setErrors(null);
        });
        this.onSubmit();
      } else if (
        (updateObj.toDate == undefined || updateObj.fromDate == undefined) &&
        Object.keys(updateObj).length > 0
      )
        this.onSubmit();
    }
  }

  clearAllFilters() {
    this.selectedChipItem = [];
    this.filterForm.reset({}, { emitEvent: false });
    this.filterForm.patchValue({
      status: '',
      subject: '',
      createdBy: '',
      toDate: '',
      fromDate: '',
      customerId: '',
      ticketId: '',
    });

    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.setErrors(null);
    });

    if (this.isSubmitted) this.onSubmit();
    this.isSubmitted = false;
  }

  keyDown(value: any) {
    const allowedRegex = /[0-9\/]/g;
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

  onSubmit() {
    const todate = this.filterForm.value.toDate;
    const fromdate = this.filterForm.value.fromDate;
    this.isSubmitted = true;
    const hasError = this.validateDateRange();
    if (!hasError) {
      if (todate && fromdate) {
        const formattedToDate = moment(todate).format().slice(0, 10);
        const formattedFromDate = moment(fromdate).format().slice(0, 10);
        this.filterForm.patchValue({
          fromDate: formattedFromDate,
          toDate: formattedToDate,
        });
      }
    }
  }

  clearFilters() {
    this.filterForm.reset({}, { emitEvent: false });
    this.filterForm.patchValue({
      status: '',
      subject: '',
      createdBy: '',
      toDate: '',
      fromDate: '',
      customerId: '',
      ticketId: '',
    });
    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.setErrors(null);
    });
    this.onSubmit();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource);
  }

  checkboxLabel(row?: TicketItem): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  handleTicketRouting(row: any): void {
    console.warn('Ticket routing needs TicketsService — row:', row.id);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

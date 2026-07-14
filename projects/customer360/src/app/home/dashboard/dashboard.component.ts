import {
  AfterViewInit,
  Component, DestroyRef, inject, OnDestroy, OnInit, signal, ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import {
  Observable,
  Subject,
  merge, of, from,
  concatMap, iif, map, mergeMap, startWith, switchMap, toArray, catchError,
} from 'rxjs';

import { TicketsService } from '../../core/services/ticket/tickets.service';
import { ToastService } from '../../shared/modules/toast/toast.service';
import { MessageBoxType } from '../../shared/modules/toast/models';

interface TicketRow {
  id: number;
  subject: string;
  customerName: string;
  customerCif: string;
  createdBy: string;
  createdOnUtc: string;
  status: string;
  statusText: string;
  cssStatusClass: string;
  actionCssClass: string;
  actionFlowName: string;
  actionFlowDescription: string;
  showMenu: boolean;
  error?: string;
  note?: string;
  label?: string;
  amount?: string;
  currency?: string;
  details?: any;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    NgSwitch, NgSwitchCase, NgSwitchDefault,
    AsyncPipe, CurrencyPipe, DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatTooltipModule,
    TranslatePipe,
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly fb = inject(UntypedFormBuilder);
  private readonly router = inject(Router);
  private readonly ticketsService = inject(TicketsService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly displayedColumns = [
    'subject',
    'customerName',
    'customerCif',
    'id',
    'createdBy',
    'createdOnUtc',
    'status',
    'actions',
  ];

  protected dataSource: TicketRow[] = [];
  protected totalCount = 0;
  protected pageSize = 10;
  protected readonly pageSizeOptions = [5, 10, 20, 30, 50, 100, 300];
  protected readonly selection = new Set<number>();

  protected filterForm!: UntypedFormGroup;
  protected toggleFilter = false;
  protected isSubmitted = false;
  protected checkDateError = false;
  protected errorMessage = '';

  protected subjectOptions: string[] = [];
  protected createdByOptions: string[] = [];
  protected statusOptions: string[] = [];
  protected filteredCreatedByOptions$!: Observable<string[]>;

  protected selctedChipItem: Array<{ key: string; value: string }> = [];

  protected readonly tickets$ = this.ticketsService.getTicketsObs();

  private readonly destroy$ = new Subject<void>();

  private ticketRequest: any[] = [];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      subject: [''],
      status: [''],
      createdBy: [''],
      toDate: [''],
      fromDate: [''],
      customerId: [''],
      ticketId: [''],
    });

    this.getTicketsCount();
    this.getDropdownValues();

    this.filteredCreatedByOptions$ = this.filterForm.get('createdBy')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );

    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.selctedChipItem = [];
        Object.keys(value).forEach(key => {
          if (value[key] !== null && value[key] !== '') {
            const todate = value.toDate;
            const fromdate = value.fromDate;
            this.selctedChipItem.push({
              key,
              value:
                (todate !== '' && key === 'toDate') || (fromdate !== '' && key === 'fromDate')
                  ? moment(value[key]).format('YYYY-MM-DD')
                  : value[key],
            });
          }
        });
      });

    // Handle ?ticket=TICKET_ID query param for deep linking
    const ticketId = this.getQueryParam('ticket');
    if (ticketId) {
      this.ticketsService.getTicket(ticketId).subscribe(ticket => {
        this.handleTicketRouting(ticket);
      });
    }
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    const formattedToDate = moment().format('YYYY-MM-DD');
    const formattedFromDate = moment().subtract(30, 'days').format('YYYY-MM-DD');

    const initSearchValues = {
      ...this.filterForm.value,
      fromDate: formattedFromDate,
      toDate: formattedToDate,
    };

    merge(this.paginator.page, this.sort.sortChange)
      .pipe(
        startWith({}),
        switchMap(() =>
          this.ticketsService.fetchAllTickets(
            this.paginator.pageIndex,
            this.paginator.pageSize,
            initSearchValues,
          ),
        ),
        mergeMap((ticketData: any) =>
          from(ticketData.items).pipe(
            concatMap((row: any) =>
              iif(
                () => this.enableTicketDetailsOnDashboard(row),
                this.setTicketDataOnDashboard(row).pipe(
                  map(details => ({ ...row, showMenu: true, details })),
                ),
                of(row),
              ),
            ),
            toArray(),
            map(rows => {
              const enriched = rows.map(row => {
                const statusKey = row.status
                  .replace(/([a-z])([A-Z])/g, '$1_$2')
                  .replace(/ /g, '_')
                  .toUpperCase();
                return { ...row, statusText: statusKey };
              });
              return { itemsCount: ticketData.itemsCount, items: enriched };
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(res => {
        this.dataSource = res.items;
        this.ticketsService.updateTickets(this.dataSource);
        this.totalCount = res.itemsCount;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getQueryParam(name: string): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  toggle(): void {
    this.toggleFilter = !this.toggleFilter;
  }

  onSubmit(): void {
    const todate = this.filterForm.value.toDate;
    const fromdate = this.filterForm.value.fromDate;

    this.isSubmitted = true;
    const hasError = this.validateDateRange();

    if (hasError) {
      this.toast.show('Error', this.errorMessage, MessageBoxType.DANGER, 5000);
      return;
    }

    if (todate && fromdate) {
      const formattedToDate = moment(todate).format('YYYY-MM-DD');
      const formattedFromDate = moment(fromdate).format('YYYY-MM-DD');
      this.filterForm.patchValue({
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      });
    }

    this.ticketsService
      .fetchAllTickets(1, this.paginator.pageSize, this.filterForm.value)
      .pipe(
        mergeMap((ticketData: any) =>
          from(ticketData.items).pipe(
            concatMap((row: any) =>
              iif(
                () => this.enableTicketDetailsOnDashboard(row),
                this.setTicketDataOnDashboard(row).pipe(
                  map(details => ({ ...row, showMenu: true, details })),
                ),
                of(row),
              ),
            ),
            toArray(),
            map(rows => ({ items: rows })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: any) => {
        const data = res.items.map((item: any) => ({
          ...item,
          showMenu: this.enableTicketDetailsOnDashboard(item),
        }));
        this.dataSource = data;
        this.ticketsService.updateTickets(this.dataSource);
        this.totalCount = res.itemsCount;
      });
  }

  clearFilters(): void {
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
    this.onSubmit();
  }

  clearAllFilters(): void {
    this.selctedChipItem = [];
    this.filterForm.reset({}, { emitEvent: false });
    this.filterForm.patchValue({
      status: '', subject: '', createdBy: '', toDate: '', fromDate: '',
      customerId: '', ticketId: '',
    });
    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.setErrors(null);
    });
    if (this.isSubmitted) this.onSubmit();
    this.isSubmitted = false;
  }

  remove(chip: { key: string; value: string }): void {
    const index = this.selctedChipItem.indexOf(chip);
    if (index >= 0) {
      this.selctedChipItem.splice(index, 1);
      Object.keys(this.filterForm.value).forEach(element => {
        if (chip.key === element) {
          this.filterForm.patchValue({ [element]: '' });
        }
      });

      const updateObj = Object.keys(this.filterForm.value).reduce(
        (acc: any, prop) => {
          if (this.filterForm.value[prop] !== '') acc[prop] = this.filterForm.value[prop];
          return acc;
        },
        {},
      );

      if (updateObj.toDate && updateObj.fromDate === undefined) return;
      if (updateObj.toDate === undefined && updateObj.fromDate) return;
      if (updateObj.toDate && updateObj.fromDate) this.onSubmit();
      else if (updateObj.toDate === undefined && updateObj.fromDate === undefined) {
        Object.keys(this.filterForm.controls).forEach(key => {
          this.filterForm.get(key)?.setErrors(null);
        });
        this.onSubmit();
      }
    }
  }

  keyDown(event: KeyboardEvent): void {
    const allowedRegex = /[0-9/]/g;
    if (!allowedRegex.test(event.key)) {
      event.preventDefault();
    }
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
  }

  handleTicketRouting(row: any): void {
    console.warn('Ticket routing not yet implemented in MFE dashboard — row:', row.id);
  }

  protected enableTicketDetailsOnDashboard(row: any): boolean {
    return row?.actionFlowName === 'ChequeRequestFlow' || false;
  }

  protected setTicketDataOnDashboard(row: any): Observable<any> {
    return of(null);
  }

  private getTicketsCount(): void {
    this.ticketsService
      .getTicketStatus()
      .pipe(
        catchError(() => {
          this.totalCount = 0;
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: any) => {
        this.ticketRequest = res || [];
        if (Array.isArray(res) && res.length > 0) {
          this.totalCount = res.reduce((acc: number, item: any) => acc + (Number(item?.count) || 0), 0);
        }
      });
  }

  private getDropdownValues(): void {
    this.ticketsService
      .getTicketsDropdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.subjectOptions = res.subjects || [];
        this.createdByOptions = res.createdBy || [];
      });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.createdByOptions.filter(option =>
      option.toLowerCase().includes(filterValue),
    );
  }

  private validateDateRange(): boolean {
    const todate = this.filterForm.value.toDate;
    const fromdate = this.filterForm.value.fromDate;
    this.checkDateError = false;

    if ((todate && !fromdate) || (!todate && fromdate)) {
      this.checkDateError = true;
      this.errorMessage = 'Both start and end dates are required';
    }
    return this.checkDateError;
  }

  protected trackById(_index: number, item: TicketRow): number {
    return item.id;
  }
}

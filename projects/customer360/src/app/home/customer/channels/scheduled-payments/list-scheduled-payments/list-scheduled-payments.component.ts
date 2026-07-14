import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MAT_DATE_FORMATS,
} from '@angular/material/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountManagementService } from '@app/core/services';
import { SchedulePaymentService } from '@app/core/services/schedule-payment/schedule-payment.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { merge, Observable, startWith, switchMap } from 'rxjs';
import { CifInquiryObject } from '@app/shared/models/common/cifinquiry.model';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import {
    TransTableComponent
} from '@app/home/customer/channels/channel-activities/channel-transactions/trans-table/trans-table.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DirectivesModule } from '@shared/directives';
import { MatTableModule } from '@angular/material/table';
import {  MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

export const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'YYYY-MM-DD',
    },
    display: {
        dateInput: 'YYYY-MM-DD',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'YYYY-MM-DD',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-list-scheduled-payments',
    templateUrl: './list-scheduled-payments.component.html',
    styleUrls: ['./list-scheduled-payments.component.scss'],
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ],
    imports: [
        MatCardModule,
        TranslatePipe,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        DatePipe,
        DecimalPipe,
        CommonModule,
        MatExpansionModule,
        MatButtonModule,
        MatChipsModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        DirectivesModule,
        MatTableModule,
        MatPaginatorModule,
        MatToolbarModule,
        MatButtonToggleModule,
        MatSortModule,
        RouterModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class ListScheduledPaymentsComponent implements OnInit, AfterViewInit {
    activities = input<boolean>(true);
    schelduleToggleBtn = [
        {
            key: 'Active',
            value: 'list',
        },
        {
            key: 'Cancelled',
            value: 'cancelled',
        },
        {
            key: 'Expired',
            value: 'past',
        },
        {
            key: 'Failed',
            value: 'failed',
        },
    ];

    dateColumnLabel = 'Next payment date';

    form!: FormGroup;
    customerDetails!: any;
    public toggleFilter = false;

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    dataSource: any = [];
    totalCount!: number;
    pageSize = 10;
    pageIndex = 0;
    pageSizeOptions: number[] = [5, 10, 20, 30, 50, 100, 300];
    schedules$!: Observable<any[]>;
    displayedColumns: string[] = [
        'sourceAccount',
        'requestType',
        'destinationAccount',
        'amount',
        'amountCurrency',
        'frequency',
        'nextDueDate',
        'status',
        'actions',
    ];
    status = 'active';

    cifInquiryObj!: CifInquiryObject;
    filteredAccounts: any = [];
    combinedAccounts: any = [];
    accounts: any = JSON.parse(<string>localStorage.getItem('accounts')) || [];
    relatedAccounts: any =
        JSON.parse(<string>localStorage.getItem('relatedAccounts')) || [];
    checkDateError = false;
    errorMessage = '';
    selctedChipItem: any[] = [];
    selectable = true;
    removable = true;
    isSubmitted = false;
    clearFilterCheck = false;
    sourceAccount!: '';

    constructor(
        public router: Router,
        private fb: FormBuilder,
        private toast: ToastService,
        private SchedulePaymentService: SchedulePaymentService,
        private accountManagementService: AccountManagementService,
        private route: ActivatedRoute
    ) {
        this.customerDetails = this.accountManagementService.getCustomerDetails();
    }

    ngOnInit(): void {
        this.route?.queryParams?.subscribe(params => {
            if (params?.['account']) {
                this.sourceAccount = params?.['account'];
            } else {
                this.sourceAccount = '';
            }
        });

        this.cifInquiryObj = this.accountManagementService.getCustomerCifData();
        const unfilteredAccounts: any = this.accounts.filter(
            (account: any) => account.schemeType !== 'LAA'
        );
        this.combinedAccounts = [...unfilteredAccounts, ...this.relatedAccounts];
        this.filteredAccounts = this.combinedAccounts.filter(
            (account: any) => account.accountStatus === 'A'
        );

        this.form = this.fb.group({
            sourceAccount: [this.sourceAccount],
            startDate: [this.formatDate(new Date(Date.now() - 30 * 86400000))],
            endDate: null,
            sort: ['startdate'],
            direction: ['desc'],
            customerId: [this.customerDetails?.cif],
            scheduleType: ['list'],
        });

        this.chipBuilder(this.form.value);

        this.form.get('scheduleType')?.valueChanges.subscribe(value => {
            this.status = value;
            this.form.patchValue({ scheduleType: value }, { emitEvent: false });

            switch (value) {
                case 'list':
                    this.dateColumnLabel = 'Next payment date';
                    break;
                case 'cancelled':
                    this.dateColumnLabel = 'Cancelled date';
                    break;
                case 'past':
                    this.dateColumnLabel = 'Expired date';
                    break;
                case 'failed':
                    this.dateColumnLabel = 'Failed date';
                    break;
                default:
                    break;
            }
            this.fetchScheldules(
                this.pageIndex,
                this.pageSize,
                this.sort.direction,
                this.form.value
            );
        });

        this.form.valueChanges.subscribe(value => {
            this.selctedChipItem = [];
            if (!this.clearFilterCheck) {
                this.chipBuilder(value);
            }
        });

        this.schedules$ = this.SchedulePaymentService.getSchedulesObs();
    }

    ngAfterViewInit(): void {
        this.sort?.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.paginator?.page, this.sort?.sortChange)
            .pipe(
                startWith({}),
                switchMap(() => {
                    return this.SchedulePaymentService.fetchSchedules(
                        this.paginator.pageIndex,
                        this.paginator.pageSize,
                        this.sort.direction,
                        this.form.value
                    );
                })
            )
            .subscribe(
                (res: any) => {
                    this.dataSource = res.items;
                    this.SchedulePaymentService.updateSchedules(this.dataSource);
                    this.totalCount = res.totalCount;
                },
                (err: any) => {
                    this.SchedulePaymentService.updateSchedules([]);
                    this.toast.show(
                        err.error.statusMessage,
                        '',
                        MessageBoxType.DANGER,
                        5000,
                        undefined,
                        undefined,
                        false
                    );
                }
            );
    }

    viewDetails(element: any, status: string) {
        const data = { data: element, status: status };
        localStorage.setItem('scheduleDetails', JSON.stringify(data));
        this.router.navigate([
            '/services/customer-360/channels/scheduled-payment-details',
        ]);
    }

    updatePayment(element: any, status: string) {
        const data = { data: element, status: status };
        localStorage.setItem('scheduleDetailss', JSON.stringify(data));
        this.router.navigate([
            '/services/customer-360/channels/update-scheduled-payments',
        ]);
    }

    cancelPayment(element: any, status: string) {
        const data = { data: element, status: status };
        localStorage.setItem('scheduleDetailss', JSON.stringify(data));
        this.router.navigate([
            '/services/customer-360/channels/cancel-scheduled-payments',
        ]);
    }

    private fetchScheldules(
        pageIndex: number,
        pageSize: number,
        sort: string,
        data: any
    ) {
        this.SchedulePaymentService.fetchSchedules(
            pageIndex,
            pageSize,
            sort,
            data
        ).subscribe(
            (res: any) => {
                this.dataSource = res.items;
                this.SchedulePaymentService.updateSchedules(this.dataSource);
                this.totalCount = res.totalCount;
            },
            (err: any) => {
                this.SchedulePaymentService.updateSchedules([]);
                this.toast.show(
                    err.error.statusMessage,
                    '',
                    MessageBoxType.DANGER,
                    5000,
                    undefined,
                    undefined,
                    false
                );
            }
        );
    }

    onSubmit() {
        this.paginator.pageIndex = 0;
        const enddate = this.form.value.endDate;
        const startdate = this.form.value.startDate;
        this.isSubmitted = true;
        let hasDateError = this.validateDateRange();
        if (hasDateError) {
            this.toast.show(
                'Error ',
                this.errorMessage,
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                false
            );
        }

        if (!hasDateError) {
            if (enddate && startdate) {
                const formattedToDate = this.formatDate(enddate);
                const formattedFromDate = this.formatDate(startdate);
                this.form.patchValue({
                    startDate: formattedFromDate,
                    endDate: formattedToDate,
                });

                this.SchedulePaymentService.fetchSchedules(
                    this.paginator.pageIndex,
                    this.paginator.pageSize,
                    this.sort.direction,
                    this.form.value
                ).subscribe(
                    (res: any) => {
                        this.dataSource = res.items;
                        this.SchedulePaymentService.updateSchedules(this.dataSource);
                        this.totalCount = res.totalCount;
                        this.clearFilterCheck = false;
                    },
                    (err: any) => {
                        this.SchedulePaymentService.updateSchedules([]);
                        this.toast.show(
                            err.error.statusMessage,
                            '',
                            MessageBoxType.DANGER,
                            5000,
                            undefined,
                            undefined,
                            false
                        );
                    }
                );
            }
        } else return;
        Object.keys(this.form.controls).forEach(key => {
            this.form.get(key)?.setErrors(null);
        });
    }
    toggle() {
        this.toggleFilter = !this.toggleFilter;
    }

    keyDown(value: any) {
        const allowedRegex = /[0-9/]/g;

        if (!allowedRegex.test(value.key)) {
            value.preventDefault();
        }
    }

    validateDateRange() {
        const enddate = this.form.value.endDate;
        const startdate = this.form.value.startDate;

        if (this.form.invalid && enddate == null && startdate == null) {
            this.checkDateError = false;
        } else if (this.form.invalid && enddate == '' && startdate == '') {
            this.checkDateError = false;
        } else if (this.form.invalid && enddate == null && startdate !== '') {
            this.checkDateError = true;
            this.errorMessage = 'Invalid Date';
        } else if (this.form.invalid && enddate !== '' && startdate == null) {
            this.checkDateError = true;
            this.errorMessage = 'Invalid Date';
        } else if (this.form.invalid && enddate == '' && startdate == null) {
            this.checkDateError = false;
        } else if (this.form.invalid && enddate == null && startdate == '') {
            this.checkDateError = false;
        } else if (this.form.invalid && enddate == '' && startdate !== '') {
            this.checkDateError = true;
            this.errorMessage = 'Invalid Date';
        } else if (this.form.invalid && enddate !== '' && startdate == '') {
            this.checkDateError = true;
            this.errorMessage = 'Invalid Date';
        } else if (!this.form.invalid && enddate == null && startdate == null) {
            this.checkDateError = false;
        }
        if (!this.form.invalid && enddate == '' && startdate == '') {
            this.checkDateError = false;
        } else if (!this.form.invalid && enddate == '' && startdate == null) {
            this.checkDateError = false;
        } else if (!this.form.invalid && enddate == null && startdate == '') {
            this.checkDateError = false;
        } else if (!this.form.invalid && enddate == '' && startdate !== '') {
            this.checkDateError = true;
            this.errorMessage = 'Invalid Date';
        } else if (!this.form.invalid && enddate !== '' && startdate == '') {
            this.checkDateError = true;
            this.errorMessage = 'Invalid Date';
        } else if (!this.form.invalid && enddate !== '' && startdate !== '') {
            this.checkDateError = false;
        }

        return this.checkDateError;
    }

    clearFilters() {
        this.form.reset({}, { emitEvent: false });
        this.form.patchValue({
            startDate: '',
            endDate: '',
        });

        Object.keys(this.form.controls).forEach(key => {
            this.form.get(key)?.setErrors(null);
        });
    }

    remove(chip: any): void {
        const index = this.selctedChipItem.indexOf(chip);
        if (index >= 0) {
            this.selctedChipItem.splice(index, 1);
            Object.keys(this.form.value).forEach(element => {
                if (chip.key == element) {
                    this.form.patchValue({ [element]: '' });
                }
            });

            const updateObj = Object.keys(this.form.value).reduce(
                (acc: any, prop) => {
                    if (this.form.value[prop] !== '') {
                        acc[prop] = this.form.value[prop];
                    }
                    return acc;
                },
                {}
            );

            if (updateObj.endDate && (updateObj.startDate == undefined || null))
                return;
            else if ((updateObj.endDate === undefined || null) && updateObj.startDate)
                return;
            else if (updateObj.endDate && updateObj.startDate) this.onSubmit();
            else if (
                (updateObj.endDate === undefined || null) &&
                (updateObj.startDate === undefined || null)
            ) {
                Object.keys(this.form.controls).forEach(key => {
                    this.form.get(key)?.setErrors(null);
                });
                this.onSubmit();
            } else if (
                updateObj.endDate === undefined ||
                Object.keys(updateObj).length > 0
            )
                this.onSubmit();
        }
    }

    clearAllFilters() {
        this.form.patchValue({
            startDate: this.formatDate(new Date(Date.now() - 30 * 86400000)),
            endDate: this.formatDate(new Date()),
        });

        Object.keys(this.form.controls).forEach(key => {
            this.form.get(key)?.setErrors(null);
        });

        if (this.isSubmitted) this.onSubmit();
    }

    private chipBuilder(value: any) {
        Object.keys(value).map(key => {
            if (
                value[key] !== null &&
                value[key] !== '' &&
                key !== 'customerId' &&
                key !== 'scheduleType' &&
                key !== 'sort' &&
                key !== 'direction'
            ) {
                const enddate = value.endDate;
                const startdate = value.startDate;
                this.selctedChipItem.push({
                    key: key,
                    value:
                        (enddate !== '' && key == 'endDate') ||
                        (startdate !== '' && key == 'startDate')
                            ? this.formatDate(value[key])
                            : value[key],
                });
            }
        });
    }

    private formatDate(date: any): string {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

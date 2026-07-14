import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  Input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
  WritableSignal,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
} from '@angular/forms';
import { AccountManagementService } from 'src/app/core/services';
import { ChannelsService } from 'src/app/core/services/channels/channels.service';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MAT_NATIVE_DATE_FORMATS,
} from '@angular/material/core';
import { AccChannels, Channel } from '../../channels.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { TransTableComponent } from '@app/home/customer/channels/channel-activities/channel-transactions/trans-table/trans-table.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DirectivesModule } from '@shared/directives';
import { SessionService } from '@shared/services';
import { CHANNEL_LIST } from '@shared/utils/constants';
import { AppDateAdapter } from '@shared/utils/date-adapter';
import { daysAgoYMD, todayYMD, toYMD } from '@shared/utils/date.utils';

export const MY_DATE_FORMATS = MAT_NATIVE_DATE_FORMATS;

@Component({
  selector: 'app-channel-transactions',
  templateUrl: './channel-transactions.component.html',
  styleUrls: ['./channel-transactions.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: AppDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  imports: [
    MatCardModule,
    TranslatePipe,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    TitleCasePipe,
    DatePipe,
    DecimalPipe,
    MatExpansionModule,
    MatButtonModule,
    TransTableComponent,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    DirectivesModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChannelTransactionsComponent implements OnInit, OnChanges {
  @Input() selectedChannel!: AccChannels;
  referenceSearchOption = input<boolean>(false);
  getAllAccounts: WritableSignal<any> = signal<any>(
    JSON.parse(<string>localStorage.getItem('accounts')),
  );
  getAllRelatedAccounts: WritableSignal<any> = signal<any>(
    JSON.parse(<string>localStorage.getItem('relatedAccounts')),
  );
  accountsArray: WritableSignal<any> = signal<any>(
    this.getAllAccounts().concat(this.getAllRelatedAccounts()),
  );
  customerCif: WritableSignal<string> = signal<string>('');
  toggleFilter: WritableSignal<boolean> = signal<boolean>(false);
  channelsList: WritableSignal<AccChannels[]> = signal(CHANNEL_LIST);
  isLoading: WritableSignal<boolean> = signal<boolean>(false);
  sourceList: WritableSignal<any[]> = signal<any[]>([
    { id: '1', title: 'One Equity', name: 'OneEquity' },
    { id: '2', title: 'USSD', name: 'ussd' },
    { id: '3', title: 'ChatBot Eva', name: 'Chatbot' },
    { id: '4', title: 'BCDC', name: 'BCDC' },
  ]);
  transactionTypesList: WritableSignal<any[]> = signal<any[]>([
    { id: '1', title: 'IntraBank', name: 'IntraBank' },
    { id: '2', title: 'Mobile Money', name: 'MobileMoney' },
    { id: '3', title: 'Buy Float', name: 'BuyFloat' },
    { id: '4', title: 'Inter-Subsidiary', name: 'InterSubsidiary' },
  ]);
  destroy$: Subject<boolean> = new Subject<boolean>();
  statusList: WritableSignal<any> = signal<any>([
    { id: '0', name: 'All' },
    { id: '1', name: 'Approved' },
    { id: '2', name: 'Pending' },
    { id: '3', name: 'Attempted' },
    { id: '4', name: 'Declined' },
    { id: '5', name: 'Expired' },
  ]);
  selectedChipItem: WritableSignal<any[]> = signal<any[]>([]);
  maxDate: WritableSignal<Date> = signal<Date>(new Date());
  bankId: WritableSignal<string> = signal<string>("");

  currentChanel!: string;
  subChannel!: string;

  filterForm!: UntypedFormGroup;
  checkDateError: boolean = false;
  isSubmitted: boolean = false;
  errorMessage = '';
  selectable = true;
  removable = true;
  clearFilterCheck: boolean = false;
  tableData = signal<any>({});
  all: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(
    private fb: UntypedFormBuilder,
    private channelsService: ChannelsService,
    private accountManagementService: AccountManagementService,
    private toast: ToastService,
    private sessionService: SessionService,
  ) {
    this.bankId.set(this.sessionService.userBank);
    this.accountsArray().filter((acc: any) => !['LAA', 'ODA'].includes(acc.schemeType));
  }

  ngOnInit(): void {
    let customerDetails = this.accountManagementService.getCustomerDetails();
    this.customerCif.update(() => customerDetails?.cif);
    this.initInitialForm();
    this.initInitialChipsAndData();
    this.filterSources();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedChannel'].currentValue) {
      this.selectedChannel = changes['selectedChannel'].currentValue;
      this.currentChanel = this.selectedChannel?.channel?.channel;
      this.subChannel = this.selectedChannel?.channel?.subChannel;
      this.filterForm?.patchValue({
        channel: this.subChannel,
        subChannel: this.subChannel,
      });
    }
  }

  filterSources = () => {
    const originalList: any[] = this.sourceList();
    let filteredList: any[];

    if (this.bankId() === '43') {
      filteredList = originalList.filter((val) => !val.name.includes('OneEquity'));
    } else {
      filteredList = originalList.filter((val) => !val.name.includes('BCDC'));
    }
    this.sourceList.update(() => filteredList);
  };

  initInitialForm = () => {
    if (!this.referenceSearchOption()) {
      this.filterForm = this.fb.group({
        customerId: this.customerCif(),
        channel: '',
        accountNumber: '',
        status: '',
        type: '',
        source: '',
        // accountNumber: this.accountsArray()[0]?.accountNumber,
        from: daysAgoYMD(7),
        to: todayYMD(),
      });
    } else {
      this.filterForm = this.fb.group({
        customerId: this.customerCif(),
        channel: '',
        accountNumber: '',
        status: '',
        type: '',
        source: '',
        reference: '',
        // accountNumber: this.accountsArray()[0]?.accountNumber,
        from: daysAgoYMD(7),
        to: todayYMD(),
      });
    }
  };

  initInitialChipsAndData = () => {
    this.chipBuilder(this.filterForm.value);
    this.filterForm.valueChanges.subscribe((value) => {
      this.selectedChipItem.update(() => []);
      if (!this.clearFilterCheck) {
        this.chipBuilder(value);
      }
    });
    this.handlePagination(0, 10);
  };

  fetchSources = () => {
    this.channelsService
      .fetchSources()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {},
        complete: () => {},
      });
  };

  fetchTransTypes = () => {
    this.channelsService
      .fetchSources()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {},
        complete: () => {},
      });
  };

  private chipBuilder(value: any) {
    Object.keys(value).map((key) => {
      if (value[key] !== null && value[key] !== '') {
        const enddate = value.to;
        const startdate = value.from;
        this.selectedChipItem().push({
          key: key,
          value:
            (enddate !== '' && key == 'to') || (startdate !== '' && key == 'from')
              ? toYMD(value[key])
              : value[key],
        });
      }
    });
  }

  onSubmit() {
    const enddate = this.filterForm.value.to;
    const startdate = this.filterForm.value.from;
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
        false,
      );
    }

    if (!hasDateError) {
      if (enddate && startdate) {
        let formattedToDate = toYMD(enddate);
        let formattedFromDate = toYMD(startdate);
        this.filterForm.patchValue({
          from: formattedFromDate,
          to: formattedToDate,
        });
        this.isLoading.update(() => true);
        this.channelsService
          .fetchTransActivities(false, 0, 10, this.filterForm.value)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res: any) => {
              this.all.next(res);
              this.clearFilterCheck = false;
            },
            error: (err: any) => {
              this.isLoading.update(() => false);
            },
            complete: () => this.isLoading.update(() => false),
          });
      }
    } else return;

    Object.keys(this.filterForm.controls).forEach((key) => {
      this.filterForm.get(key)?.setErrors(null);
    });
  }

  toggle() {
    this.toggleFilter.update((value) => !value);
  }

  keyDown(value: any) {
    const allowedRegex = /[0-9/]/g;

    if (!allowedRegex.test(value.key)) {
      value.preventDefault();
    }
  }

  validateDateRange() {
    const { from: startDate, to: endDate } = this.filterForm.value;
    const isFormValid = !this.filterForm.invalid;

    const isEmpty = (val: any) => val === null || val === '';

    if (isEmpty(startDate) && isEmpty(endDate)) {
      this.checkDateError = false;
    } else if (
      (isEmpty(startDate) && !isEmpty(endDate)) ||
      (!isEmpty(startDate) && isEmpty(endDate))
    ) {
      this.checkDateError = true;
      this.errorMessage = 'Invalid Date';
    } else {
      this.checkDateError = false;
    }

    return this.checkDateError;
  }

  remove(chip: any): void {
    const index = this.selectedChipItem().indexOf(chip);
    if (index >= 0) {
      this.selectedChipItem().splice(index, 1);
      Object.keys(this.filterForm.value).forEach((element) => {
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

      if (updateObj.to && (updateObj.from == undefined || null)) return;
      else if ((updateObj.to == undefined || null) && updateObj.from) return;
      else if (updateObj.to && updateObj.from) this.onSubmit();
      else if ((updateObj.to == undefined || null) && (updateObj.from == undefined || null)) {
        Object.keys(this.filterForm.controls).forEach((key) => {
          this.filterForm.get(key)?.setErrors(null);
        });
        this.onSubmit();
      } else if ((updateObj.to == undefined || null) && Object.keys(updateObj).length > 0)
        this.onSubmit();
    }
  }

  clearAllFilters() {
    this.filterForm.patchValue({
      channel: '',
      accountNumber: '',
      status: '',
      type: '',
      source: '',
      startDate: daysAgoYMD(7),
      endDate: todayYMD(),
    });

    Object.keys(this.filterForm.controls).forEach((key) => {
      this.filterForm.get(key)?.setErrors(null);
    });
    if (this.isSubmitted) this.onSubmit();
  }

  updateTable(event: number[]) {
    this.handlePagination(event[0], event[1]);
  }

  handlePagination(page: number, size: number) {
    this.isLoading.update(() => true);
    this.channelsService
      .fetchTransActivities(false, page, size, this.filterForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.all.next(res);
          this.clearFilterCheck = false;
          this.isLoading.update(() => false);
        },
        error: (err: any) => {
          this.isLoading.update(() => false);
        },
        complete: () => this.isLoading.update(() => false),
      });
  }

  getSelectedAccount(value: any) {}
}

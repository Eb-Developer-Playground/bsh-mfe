import {
  Component,
  EventEmitter,
  Input,
  input,
  OnInit,
  Output,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { LoaderComponent } from '@shared/modules/loader';
import { LoaderWidthHeightProps } from '@shared/modules/loader/model/size-props';

@Component({
  selector: 'app-trans-table',
  imports: [
    MatTableModule,
    CommonModule,
    TranslatePipe,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatPaginatorModule,
    MatDividerModule,
    MatSortHeader,
    MatSort,
    LoaderComponent,
  ],
  providers: [DatePipe],
  templateUrl: './trans-table.component.html',
  styleUrl: './trans-table.component.scss',
})
export class TransTableComponent implements OnInit {
  isJoint = input<any>();
  @Input() data: BehaviorSubject<any> | undefined;
  @Output() update: EventEmitter<any> = new EventEmitter();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  isLoading = input(false);
  displayedColumns = signal<string[]>([
    'sourceAccount',
    'channel',
    'data',
    'amount',
    'currency',
    'reference',
    'date',
    'status',
    'actions',
  ]);

  displayedColumnTitles: WritableSignal<string[]> = signal<string[]>([]);
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  totalTransActivityCount = signal<number>(0);
  pageSize: WritableSignal<number> = signal(10);
  currentPage: WritableSignal<number> = signal(0);
  pageSizeOptions: WritableSignal<number[]> = signal([
    10, 20, 30, 50, 100, 300,
  ]);
  sizeProps: WritableSignal<LoaderWidthHeightProps> =
    signal<LoaderWidthHeightProps>({
      height: '125px',
      width: '125px',
    });

  constructor(
    private router: Router,
    private translateService: TranslateService
  ) {
    this.displayedColumnTitles.set([
      this.translateService.instant('CUSTOMER.CHANNELS.ACCOUNT-CARD'),
      this.translateService.instant('CUSTOMER.CHANNELS.EVENT'),
      this.translateService.instant('CUSTOMER.CHANNELS.BENEFICIARY-MERCHANT'),
      this.translateService.instant('CUSTOMER.CHANNELS.AMOUNT'),
      this.translateService.instant('CUSTOMER.CHANNELS.CURRENCY'),
      this.translateService.instant('CUSTOMER.CHANNELS.REFERENCE-NO'),
      this.translateService.instant('COMMON.DATE-CREATED'),
    ]);
  }
  ngOnInit() {
    this.data?.subscribe({
      next: value => {
        this.dataSource = new MatTableDataSource<any>(value?.data);
        this.totalTransActivityCount.set(value?.totalItems);
      },
      error: error => {},
    });
  }
  pageChanged = (event: PageEvent) => {
    this.currentPage.update(() => event.pageIndex);
    this.pageSize.update(() => event.pageSize);
    this.update.emit([this.currentPage(), this.pageSize()]);
  };
  parseData = (data: string): any => {
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  };

  logDispute(element: any) {
    localStorage.setItem('disputedTran', JSON.stringify(element));
    this.router
      .navigate(['/services/customer-360/crm'], {
        queryParams: {
          title: 'Transactional',
        },
      })
      .then(r => {});
  }

  viewTransDetails(element: any) {
    const updatedTransDetails = { ...element, isJointAccount: this.isJoint() };
    this.router.navigate([
      '/services/customer-360/channels/trans-view-details',
    ]);
    localStorage.setItem('transDetails', JSON.stringify(updatedTransDetails));
  }
}

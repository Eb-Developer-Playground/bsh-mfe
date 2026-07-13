import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-shared-standing-order-list',
  templateUrl: './shared-standing-order-list.component.html',
  styleUrls: ['./shared-standing-order-list.component.scss'],
  imports: [
    CommonModule,
    TranslatePipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatMenuModule,
  ],
})
export class SharedStandingOrderListComponent implements OnInit, OnChanges {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;

  @Input() isActiveAccount = false;
  @Input() standingOrders: any = [];

  @Output() onSelectStandingOrder = new EventEmitter<any>();

  expandedHeight: string = '64px';
  collapsedHeight: string = '64px';
  pageSizeOptions: number[] = [5, 10, 20, 30, 50, 100, 300];

  isCreateActive = false;
  dataSource!: MatTableDataSource<any>;
  selectedStandingOrder: any | null = null;
  displayedColumns: string[] = [
    'select',
    'refNumber',
    'beneficiaryFullName',
    'benenficiaryAccountId',
    'bankName',
    'amount',
    'currency',
    'startDate',
    'status',
    'actions'
  ];

  constructor() {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.standingOrders);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isCreateActive = true;
    if (changes['standingOrders']?.currentValue) {
      this.standingOrders = changes['standingOrders'].currentValue;

      this.dataSource = new MatTableDataSource(this.standingOrders);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  onSelect(data: any) {
    if (this.selectedStandingOrder?.standingOrderId === data.standingOrderId) {
      this.selectedStandingOrder = null;
      this.onSelectStandingOrder.emit(null);
    } else {
      this.selectedStandingOrder = data;
      this.onSelectStandingOrder.emit(data);
    }
  }

  createStandingOrder() {
    // Logic to create a new standing order
    console.log('Creating a new standing order');
  }

  showStopAmendOption(element: any): boolean {
    return ['Active'].includes(element.status);
  }

  showAmendStopButton(element: any): { amend: boolean; stop: boolean } {
  if (!element || element.status === 'Deactivated' || element.status === 'Pending') {
    return { amend: false, stop: false };
  }

  return { amend: true, stop: true };
}

  onClickStop(element: any) {
    console.log('Stopping standing order:', element);
  }

  onClickAmend(element: any) {
    console.log('Ammending standing order:', element);
  }

  onClickViewDetails(element: any) {
    console.log('Viewing details for standing order:', element);
  }

  onClickNewStandingOrder() {
    console.log('Creating a new standing order');
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }
}

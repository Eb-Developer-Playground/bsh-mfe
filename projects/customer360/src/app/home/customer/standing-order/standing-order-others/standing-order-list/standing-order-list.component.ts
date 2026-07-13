import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
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
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-standing-order-list',
  templateUrl: './standing-order-list.component.html',
  styleUrls: ['./standing-order-list.component.scss'],
  imports: [
    CommonModule,
    TranslatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginatorModule,
  ],
})
export class StandingOrderListComponent implements OnInit, OnChanges {
  @Input() isActiveAccount = false;

  isCreateActive = false;
  @Input() standingOrders: any = [];
  dataSource: any = new MatTableDataSource<any>();
  @Output() onStandingOrderSelect = new EventEmitter<any>();
  displayedColumns: string[] = [
    'select',
    'standingOrderId',
    'beneficiaryFullName',
    'benenficiaryAccountId',
    'amount',
    'bankName',
    'currency',
    'status',
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;
  constructor(private _liveAnnouncer: LiveAnnouncer) {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.standingOrders);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isCreateActive = true;
    if (changes['standingOrders'].currentValue) {
      this.standingOrders = changes['standingOrders'].currentValue;

      this.dataSource = new MatTableDataSource(this.standingOrders);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${'select'} all`;
    }
    return `${'select'} row ${row.id + 1}`;
  }
  onSelect(data: any) {
    this.onStandingOrderSelect.emit(data);
  }
  announceSortChange(sortState: any) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}

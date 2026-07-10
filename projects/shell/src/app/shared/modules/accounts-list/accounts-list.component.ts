import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  CustomerAccountsDataSource,
  CustomerAccountsItem,
} from './customer-accounts-datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-accounts-list',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss'],
})
export class AccountsListComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<CustomerAccountsItem>;
  @Input() accountsList!: CustomerAccountsItem[];
  dataSource: CustomerAccountsDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
    'cif',
    'account_name',
    'account_number',
    'scheme_code',
    'funds_source',
    'verification_doc',
  ];

  constructor() {
    this.dataSource = new CustomerAccountsDataSource();
    this.dataSource.data = this.accountsList || [];
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}

import { DataSource } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { merge, Observable, of as observableOf } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';

// TODO: Replace this with your own data model type
export interface CustomerAccountsItem {
  account_name: string;
  account_number: any;
  cif: any;
  funds_source: any;
  scheme_code: any;
  verification_doc: any;
}

// TODO: replace this with real data from your application
const DATA: CustomerAccountsItem[] = [];

/**
 * Data source for the CustomerAccounts view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class CustomerAccountsDataSource extends DataSource<CustomerAccountsItem> {
  data: CustomerAccountsItem[] = DATA;
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;

  constructor() {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<CustomerAccountsItem[]> {
    if (this.paginator && this.sort) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(
        observableOf(this.data),
        this.paginator.page,
        this.sort.sortChange
      ).pipe(
        map(() => {
          return this.getPagedData(this.getSortedData([...this.data]));
        })
      );
    } else {
      throw Error(
        'Please set the paginator and sort on the data source before connecting.'
      );
    }
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: CustomerAccountsItem[]): CustomerAccountsItem[] {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    } else {
      return data;
    }
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: CustomerAccountsItem[]): CustomerAccountsItem[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'account_name':
          return compare(a.account_name, b.account_name, isAsc);
        case 'account_number':
          return compare(a.account_number, b.account_number, isAsc);
        case 'cif':
          return compare(+a.cif, +b.cif, isAsc);
        case 'scheme_code':
          return compare(+a.scheme_code, +b.scheme_code, isAsc);
        case 'funds_source':
          return compare(+a.funds_source, +b.funds_source, isAsc);
        case 'verification_doc':
          return compare(+a.verification_doc, +b.verification_doc, isAsc);
        default:
          return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(
  a: string | number,
  b: string | number,
  isAsc: boolean
): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

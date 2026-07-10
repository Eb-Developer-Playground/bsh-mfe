import { AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import {
  GeneralResponse,
  MenuActions,
  MenuOptionsButtons,
} from './models/menu-button-action.models';
import {
  FieldType,
  TableActionsButtons,
  TableData,
  TableFields,
} from './models/table-fields.models';
import { TableDataService } from './services/table-data.service';

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Customer } from '../../models/customer/customer.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSelectChange } from '@angular/material/select';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-table-data',
  templateUrl: './table-data.component.html',
  styleUrls: ['./table-data.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: 'auto' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class TableDataComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
  @Input() tableTitle = '';
  @Input() hideTableHead = false;
  @Input() hideFooterTotalItems = false;
  @Input() hideFooterPaginator = false;
  @Input() tableFields!: TableFields[];
  @Input() data!: TableData & GeneralResponse;
  @Input() tableActionsButtons!: TableActionsButtons[];

  @Input() hasPaginationFromBackend = true;
  @Input() clickableRows = false;
  @Input() reportWidth = false;

  @Input() pageSize = 5;
  @Input() pageNumber = 0;

  @Output() tableActionsButtonEvent = new EventEmitter<TableActionsButtons>();
  @Output() tableSelectedRowEvent = new EventEmitter<any>();
  @Output() tablePageChanged = new EventEmitter<{
    pageSize: number;
    pageNumber: number;
  }>();

  @Output() tableFilter = new EventEmitter<any>();
  @Input() hasSortFromBackend = true;
  @Output() tableSort = new EventEmitter<Sort>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() toggleFilter = true;

  // hide columns like ids, or something like that
  @Input() hideColumsArray: string[] = [];

  @Input() dropDownFilter!: {
    label: string;
    options: any[];
  };

  @Output() dropDownFilterEmitter = new EventEmitter<any>();

  hideColumsArray$ = new BehaviorSubject<string[]>(['']);

  displayedColumns$!: Observable<string[]>;

  searchFields$!: Observable<TableFields[]>;
  dataSource = new MatTableDataSource<any>();

  expandedElement: any | null;
  showExpandedDetail = false;

  filterButton: TableActionsButtons = {
    icon: 'ic-filter',
    label: 'Filter',
    action: MenuActions.FILTER,
  };

  emitMultiplesRow = false; //for table with multiples selections with checkBoxes

  private destroy$ = new Subject<void>();

  constructor(private tableDataService: TableDataService) {}

  ngOnInit(): void {
    // this.displayedColumnsExpand$ = this.hideColumsArray$.pipe(
    //   switchMap(cols => {
    //     return of(this.tableFields
    //     .filter(field => field.type === FieldType.EXPANDED )
    //     .map(field => field.name)
    //     .filter(field => !cols.includes(field))
    //     );
    //   }),
    //   tap(console.log)
    // );

    this.displayedColumns$ = this.hideColumsArray$.pipe(
      switchMap(cols => {
        return of(
          this.tableFields
            .filter(field => field.type !== FieldType.EXPANDEDDETAILS)
            .map(field => field.name)
            .filter(field => !cols.includes(field))
        );
      })
    );

    this.searchFields$ = of(this.tableFields.filter(field => field.filter));

    /**
     * set to null before next subscription, else it will recieve the last value
     * from previously selected row subscription
     */
    this.tableDataService.setSelectedRow(null);
    this.listenTableEvents();

    this.hideColumsArray.forEach(col => {
      this.showHideColumn(col);
    });

    this.tableDataService.filtersSubject$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.tableFilter.emit(data);
      });
  }

  ngOnChanges(changes: any) {
    if (changes && changes.data && changes.data.currentValue) {
      this.setDataTable(changes?.data?.currentValue);
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  setDataTable(currentData: any) {
    this.dataSource.data = !this.hasPaginationFromBackend
      ? currentData
      : currentData?.items;

    //set ExtraField
    const extra = this.tableFields.find(
      field => field.type === FieldType.EXTRA
    );

    const expanded = this.tableFields.find(
      field => field.type === FieldType.EXPANDED
    );

    this.emitMultiplesRow = this.tableFields.some(
      field => field.type === FieldType.CHECK
    );

    if (extra) {
      const data = this.dataSource.data;
      this.dataSource.data = data.map(item => {
        return {
          ...item,
          extra: extra.value,
        };
      });
    }

    if (
      expanded &&
      this.tableFields.map(f => f.name).includes('expandedDetail') === false
    ) {
      this.tableFields.push({
        label: '',
        name: 'expandedDetail',
        type: FieldType.EXPANDEDDETAILS,
        sorted: false,
        widthPercentage: 10,
        filter: false,
        value: expanded.value,
      });

      this.showExpandedDetail = true;
    }

    setTimeout(() => {
      if (this.hasPaginationFromBackend) {
        if (this.paginator) {
          //this.paginator.pageIndex = currentData.currentPageNumber - 1;
          this.paginator.length = currentData.itemsCount;

          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
      }
    }, 500);
  }

  clickTableButtons(tableActionsButtons: TableActionsButtons) {
    this.tableActionsButtonEvent.emit(tableActionsButtons);
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex + 1;
    this.tablePageChanged.emit({
      pageSize: this.pageSize,
      pageNumber: this.pageNumber,
    });
  }

  //private methods

  private listenTableEvents() {
    /**
     * listen the action  of header columns menu
     */
    this.tableDataService.headerMenuTriggerAction$
      .pipe(takeUntil(this.destroy$))
      .subscribe(menuOptionsButton => {
        if (menuOptionsButton) {
          this.handlerMenuAction(menuOptionsButton);
        }
      });

    /**
     * listen when the user select a row from the table (radiobuttons fields)
     */ this.tableDataService.selectedTableRowSubject$
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(row => {
        if (row) {
          if (this.emitMultiplesRow && !row?.index) {
            console.error(
              'i need a index property a (unique value) on data keys'
            );
          }
          //setting value for checkboxes
          if (
            (row?.selected === false || row?.selected === true) &&
            row?.index
          ) {
            this.dataSource.data = this.dataSource.data.map(data => {
              return {
                ...data,
                selected:
                  row.index === data.index ? row.selected : data.selected,
              };
            });
            //console.log(this.dataSource.data.filter(data => data.selected).length)
          }
        }

        //console.log(this.emitMultiplesRow)
        if (this.emitMultiplesRow === true) {
          this.tableSelectedRowEvent.next(
            this.dataSource?.data?.filter(data => data.selected)
          );
        } else {
          this.tableSelectedRowEvent.next(row);
        }
      });

    this.tableDataService.expandedSubject$
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(expandedElement => {
        this.expandedElement = expandedElement;
      });
  }

  handlerRowClic(row: any, tableField: TableFields) {
    if (
      ![
        FieldType.EXPANDED,
        FieldType.CHECK,
        FieldType.DYNAMICMENUACTIONS,
      ].includes(tableField.type)
    ) {
      this.tableSelectedRowEvent.next(row);
    }
  }

  private handlerMenuAction(menuOptionsButton: MenuOptionsButtons) {
    switch (menuOptionsButton?.action) {
      case MenuActions.ASC:
      case MenuActions.DESC:
        this.sortData(menuOptionsButton);
        break;
      case MenuActions.HIDE:
        this.showHideColumn(<string>menuOptionsButton.selectedTableField?.name);
        break;
      case MenuActions.SHOW:
        this.showHideColumn(null);
        break;

      default:
        break;
    }
  }

  /**
   * show or hide the table columns
   */
  private showHideColumn(column: string | null) {
    this.hideColumsArray$.pipe(take(1)).subscribe(current => {
      if (!column) {
        current = this.hideColumsArray;
      } else {
        current.push(column);
      }
      this.hideColumsArray$.next(current);
    });
  }

  private sortData(menuOptionsButton: MenuOptionsButtons) {
    if (this.hasSortFromBackend) {
      const sort: Sort = {
        active: <string>menuOptionsButton.selectedTableField?.name,
        direction: <SortDirection>menuOptionsButton.action,
      };
      this.tableSort.emit(sort);
      return;
    }

    this.dataSource.sort = this.sort;

    const sortState: Sort = {
      active: <string>menuOptionsButton.selectedTableField?.name,
      direction: <SortDirection>menuOptionsButton.action,
    };
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.sort.sortChange.emit(sortState);
  }

  onSelectionChange(event: MatSelectChange) {
    this.dropDownFilterEmitter.emit(event.value);
  }

  checkBoxSelected(data: any, event: boolean) {
    //console.log(data, event)
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.dataSource.data.every(data => data.selected);
  }

  anySelected() {
    return (
      this.dataSource.data.some(data => data.selected === true) &&
      !this.isAllSelected()
    );
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.dataSource.data = this.dataSource.data.map(data => {
      return {
        ...data,
        selected: !this.isAllSelected(),
      };
    });
    this.tableSelectedRowEvent.next(
      this.dataSource.data.filter(data => data.selected)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

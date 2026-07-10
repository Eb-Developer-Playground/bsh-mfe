import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MenuOptionsButtons } from '../models/menu-button-action.models';

@Injectable()
export class TableDataService {
  private headerMenuTriggerActionSubject =
    new BehaviorSubject<MenuOptionsButtons | null>(null);
  headerMenuTriggerAction$ = this.headerMenuTriggerActionSubject.asObservable();

  private selectedTableRowSubject = new BehaviorSubject<any>(null);
  selectedTableRowSubject$ = this.selectedTableRowSubject.asObservable();

  private filtersSubject = new Subject<any>();
  filtersSubject$ = this.filtersSubject.asObservable();

  private expandedSubject = new Subject<any>();
  expandedSubject$ = this.expandedSubject.asObservable();

  constructor() {}

  setMenuTrigger(action: MenuOptionsButtons) {
    this.headerMenuTriggerActionSubject.next(action);
  }

  setSelectedRow(row: any) {
    this.selectedTableRowSubject.next(row);
  }

  setFilters(filters: any) {
    this.filtersSubject.next(filters);
  }

  setExpanded(expanded: any) {
    this.expandedSubject.next(expanded);
  }
}

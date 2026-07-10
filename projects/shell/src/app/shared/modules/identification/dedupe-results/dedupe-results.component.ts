import { CommonModule } from '@angular/common';
import { AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { TranslatePipe } from '@ngx-translate/core';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { IDedupeCIFResult } from '../types';
import { SessionService } from '../../../services';
import { environment as env } from '../../../../../environments/environment';

@Component({
  selector: 'app-dedupe-results',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatRadioModule,
    MatSortModule,
    MatPaginatorModule,
    TranslatePipe,
  ],
  templateUrl: './dedupe-results.component.html',
  styleUrls: ['./dedupe-results.component.scss'],
})
export class DedupeResultsComponent implements AfterViewInit, OnChanges {
  @ViewChild('table') table!: MatTable<IDedupeCIFResult[]>;
  @Input() data!: IDedupeCIFResult[];
  @Input() showActions!: boolean;
  displayedColumns: string[] = [
    'select',
    'cifId',
    'fullName',
    'idType',
    'refNum',
    'phoneNumber',
    'suspendedFlg',
  ];
  selectedId!: string | null;
  dataSource: MatTableDataSource<IDedupeCIFResult>;
  @Output() onContinue = new EventEmitter<void>();
  continueStep() {
    this.onContinue.emit();
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Output() selectedCif = new EventEmitter<IDedupeCIFResult>();

  constructor(private session: SessionService) {
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.table?.renderRows();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']?.currentValue) {
      this.dataSource = new MatTableDataSource(this.data);
      this.selectedId = null;
    }
  }

  onCifSelected(row: IDedupeCIFResult) {
    this.selectedId = row.cifId ?? null;
    const resultToEmit = {
      ...row,
      cifId: row.cifId || row.cifNumber || '',
    };
    this.selectedCif.emit(resultToEmit);
  }

  goToProfile(customerId: string) {
    const url = new URL((env as any).appUrl);
    const params = new URLSearchParams({
      option: 'CIF',
      intent: 'canVerify',
      value: `${customerId}`,
    });
    url.search = params.toString();
    this.session.routeToUrl(url.toString());
  }
  formatFullName(row: { firstName: string; lastName: string }): string {
    const { firstName, lastName } = row;
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    return fullName;
  }
  formatCifNumber(row: any): string {
    const { cifId, cifNumber } = row;
    return cifId || cifNumber;
  }
}

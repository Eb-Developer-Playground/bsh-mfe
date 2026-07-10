import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  constructor(private translate: TranslateService) {}
  public changes = new Subject<void>();

  public firstPageLabel = this.translate.instant('PAGINATOR.FIRST-PAGE');
  public itemsPerPageLabel = this.translate.instant('PAGINATOR.ROWS-PER-PAGE');
  public lastPageLabel = this.translate.instant('PAGINATOR.LAST-PAGE');

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  public nextPageLabel = this.translate.instant('PAGINATOR.NEXT-PAGE');
  public previousPageLabel = this.translate.instant('PAGINATOR.PREVIOUS-PAGE');

  public getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return `${this.translate.instant('PAGINATOR.PAGE')} 1 ${this.translate.instant('PAGINATOR.OF')} 1 ${this.translate.instant('PAGINATOR.ITEM')}`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return `${this.translate.instant('PAGINATOR.PAGE')}  ${page + 1} ${this.translate.instant('PAGINATOR.OF')} ${amountPages} ${this.translate.instant('PAGINATOR.ITEMS')}`;
  }
}

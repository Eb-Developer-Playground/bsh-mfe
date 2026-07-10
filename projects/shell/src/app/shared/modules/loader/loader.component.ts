import { Component, Input, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class LoaderComponent implements OnDestroy {
  loading = false;
  @Input() inComponentLoading = false;
  @Input() headers: string[] = ['', '', '', '', '', ''];
  @Input() itemCount = 6;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading
      .pipe(
        delay(0), // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        this.loading = res && !this.loaderService.suppressLoader;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
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

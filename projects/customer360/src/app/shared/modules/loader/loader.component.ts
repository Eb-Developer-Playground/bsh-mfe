import { Component, input, Input, OnDestroy } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { LoaderService } from './loader.service';
import { LoaderWidthHeightProps } from '@shared/modules/loader/model/size-props';

@Component({
  selector: 'app-loader',
  imports: [LottieComponent],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent implements OnDestroy {
  loading = false;
  data: any = '../../assets/loader.json';
  @Input() inComponentLoading = false;
  sizeProp = input<LoaderWidthHeightProps>({
    height: '66px',
    width: '66px',
  });

  private destroy$: Subject<any> = new Subject<any>();

  constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading
      .pipe(
        delay(0),
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        this.loading = res;
      });
  }

  options: AnimationOptions = {
    path: 'assets/loader.json',
  };

  animationCreated(animationItem: AnimationItem): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
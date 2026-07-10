import { Component, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageBoxType } from 'src/app/shared/modules/toast/models';
import { ToastService } from 'src/app/shared/modules/toast/toast.service';

@Component({
  selector: 'app-toast-guide',
  templateUrl: './toast-guide.component.html',
  styleUrls: ['./toast-guide.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class ToastGuideComponent implements OnInit, OnDestroy {
  type: MessageBoxType = MessageBoxType.SUCCESS;
  private destroySubject = new Subject();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {}

  openToast() {
    this.toastService.show('Aute occaecat ut', 'Quis', this.type, 9500);

    this.toastService
      .dismissed()
      .pipe(takeUntil(this.destroySubject))
      .subscribe((data: { dismissedByAction: boolean }) => {});
  }

  ngOnDestroy() {
    this.destroySubject.next('');
    this.destroySubject.complete();
  }
}

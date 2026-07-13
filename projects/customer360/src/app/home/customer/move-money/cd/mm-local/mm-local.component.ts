import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  ContextManager,
  StepperParentComponent,
} from '@app/shared/modules/stepper';

import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { StepperComponent } from '@app/shared/modules/stepper';
import { TransferDetailsComponent } from './components/transfer-details/transfer-details.component';
import { MmReviewComponent } from '../shared/mm-review/mm-review.component';

@Component({
  selector: 'app-mm-local',
  templateUrl: './mm-local.component.html',
  styleUrl: './mm-local.component.scss',
  imports: [TranslatePipe, CdkStepperModule, StepperComponent, TransferDetailsComponent, MmReviewComponent],
})
export class MmLocalComponent
  extends StepperParentComponent
  implements OnInit, OnDestroy
{
  transferFormControl: UntypedFormControl = new UntypedFormControl(
    null,
    Validators.required
  );

  reviewControl: UntypedFormControl = new UntypedFormControl(null);

  override destroy$: Subject<any> = new Subject<any>();

  constructor(
    protected override route: ActivatedRoute,
    protected override router: Router,
    protected override fb: UntypedFormBuilder,
    protected dialog: MatDialog,
    private ctxManager: ContextManager,
    public translateService: TranslateService
  ) {
    super(router, route, fb);
  }

  override ngOnInit(): void {
    this.ctxManager.context = 'move-money';
  }
  override ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  override onQuit(): void {
    this.goToDashboard();
    // TODO: Show quit dialog
  }

  override onFinish(): void {}

  onBack(): void {}

  goToDashboard() {
    this.router.navigate(['/services/customer-360/move-money']).then(() => {});
  }
}

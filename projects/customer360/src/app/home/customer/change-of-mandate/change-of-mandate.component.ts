import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import {
  ContextManager,
  StepperParentComponent,
  StepperComponent,
} from '@app/shared/modules/stepper';
import { DialogConfirmComponent } from '@app/shared/components/dialog/dialog-confirm/dialog-confirm.component';
import { SessionService } from '@app/shared/services';
import { ChangeMandateService } from '@app/core/services/change-mandate/change-mandate.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MandateFormComponent } from './mandate-form/mandate-form.component';
import { MandateDocumentsComponent } from './documents/mandate-documents.component';
import { ChangeMandatePreviewComponent } from './mandate-form/change-mandate-preview/change-mandate-preview.component';

@Component({
  selector: 'app-change-of-mandate',
  templateUrl: './change-of-mandate.component.html',
  styleUrls: ['./change-of-mandate.component.scss'],
  imports: [
    CommonModule,
    TranslatePipe,
    CdkStepperModule,
    MatButtonModule,
    MatDialogModule,
    StepperComponent,
    MandateFormComponent,
    MandateDocumentsComponent,
    ChangeMandatePreviewComponent,
  ],
})
export class ChangeOfMandateComponent
  extends StepperParentComponent
  implements OnInit, OnDestroy
{
  translatedStepperLabel: string = '';
  translatedStepperInfo: string = '';
  translatedStepperDocs: string = '';

  mandateControl: UntypedFormControl = new UntypedFormControl(
    null,
    Validators.required
  );
  documentsControl: UntypedFormControl = new UntypedFormControl(
    null,
    Validators.required
  );
  previewControl: UntypedFormControl = new UntypedFormControl(null);
  override destroy$: Subject<any> = new Subject<any>();

  shouldRenderDocuments: boolean = false;

  actionFlowData: any;

  constructor(
    private translateService: TranslateService,
    private ctxManager: ContextManager,
    protected override fb: UntypedFormBuilder,
    protected override router: Router,
    protected override route: ActivatedRoute,
    private dialog: MatDialog,
    private sessionService: SessionService,
    private changeMandateService: ChangeMandateService
  ) {
    super(router, route, fb);
  }

  override ngOnInit(): void {
  const translationKey =
  this.sessionService.subsidiary.countryCode === 'RW'
    ? 'CUSTOMER.ACCOUNT-SERVICES.CHANGE-MANDATE-ACCOUNT.CHANGE-MODE-OPERATION-TITLE'
    : 'CUSTOMER.ACCOUNT-SERVICES.CHANGE-MANDATE-ACCOUNT.DIALOG-TITLE';

  this.translateService
  .get(translationKey)
  .subscribe((res: string) => {
    this.translatedStepperLabel = res;
  });

  const detailsKey =
  this.sessionService.subsidiary.countryCode === 'RW'
    ? 'CUSTOMER.ACCOUNT-SERVICES.CHANGE-MANDATE-ACCOUNT.MODE-OF-OPERATION-DETAILS'
    : 'CUSTOMER.ACCOUNT-SERVICES.CHANGE-MANDATE-ACCOUNT.MANDATE_DETAILS';

this.translateService
  .get(detailsKey)
  .subscribe((res: string) => {
    this.translatedStepperInfo = res;
  });

    this.translateService
      .get('COMMON.DOCUMENTS.LABEL')
      .subscribe((res: string) => {
        this.translatedStepperDocs = res;
      });
    this.ctxManager.context = 'mandate';
    const countryCode = this.sessionService.subsidiary.countryCode;

    this.shouldRenderDocuments =
      this.shouldRenderDocumentsComponent(countryCode);
  }

  override ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  override onQuit(): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      height: 'auto',
      data: { title: ' Are you sure ? ' },
    });

    dialogRef.afterClosed().subscribe((option: boolean) => {
      if (option) {
        this.gotoDashboard();
      }
    });
  }

  override onFinish(): void {
    if (this.ctxManager.currentContextData?._parent?.returnUrl) {
      this.routeToParent(false);
      return;
    }
    this.router
      .navigate(['./success'], { relativeTo: this.route })
      .then(() => {});
  }

  routeToParent(quit: boolean): void {
    const data = this.ctxManager.currentContextData;
    const returnPayload = {
      status: quit ? 'abort' : 'success',
      action: 'Change of Mandate',
      accountId: data.account || null,
      ticket: data?.ticket?.id,
    };
    const ctx = btoa(JSON.stringify(returnPayload));
    const url = new URL(data?._parent?.returnUrl);
    const searchParams = url.searchParams;
    searchParams.set('returnCtx', ctx);
    url.search = searchParams.toString();
    this.ctxManager.patchContextData({ mandate: null });
    window.location.href = url.toString();
  }

  gotoDashboard() {
    localStorage.removeItem('ticketId');
    localStorage.removeItem('selectedAccount');
    this.router.navigate(['/services/customer-360']).then(() => {});
  }
  private shouldRenderDocumentsComponent(countryCode: string): boolean {
    return this.changeMandateService.useChangeMandateFlowV2(countryCode);
  }
}

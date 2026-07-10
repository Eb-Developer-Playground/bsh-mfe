import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  ContextManager,
  StepperParentComponent,
} from '@app/shared/modules/stepper';

import { Subject } from 'rxjs';
import { IDocumentSpec } from '@app/shared/modules/upload-docs';
import {
  MoveMoneyDocsRequestedT,
  MoveMoneyDocValidators,
} from '@app/home/customer/move-money/models/move-money-services.model';
import { MmSharedLogicService } from '@app/home/customer/move-money/cd/shared/mm-shared-logic.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { StepperComponent } from '@app/shared/modules/stepper';
import { TransferDetailsComponent } from './components/transfer-details/transfer-details.component';
import { MmAdditionalDocumentsComponent } from '../shared/mm-additional-documents/mm-additional-documents.component';
import { MmReviewComponent } from '../shared/mm-review/mm-review.component';

@Component({
  selector: 'app-ownaccount',
  templateUrl: './ownaccount.component.html',
  styleUrl: './ownaccount.component.scss',
  imports: [TranslatePipe, CdkStepperModule, StepperComponent, TransferDetailsComponent, MmAdditionalDocumentsComponent, MmReviewComponent],
})
export class OwnaccountComponent
  extends StepperParentComponent
  implements OnInit, OnDestroy
{
  isProcessing = false;
  requiredDocuments: IDocumentSpec[] = [];
  docsInfo: MoveMoneyDocsRequestedT[] = [];
  docValidators: MoveMoneyDocValidators[] = [];
  uploads: {
    file: string;
    format: string;
    name: string;
    docCode: string;
  }[] = [];
  RequiredDocumentsForm!: UntypedFormGroup;
  transferFormControl: UntypedFormControl = new UntypedFormControl(
    null,
    Validators.required
  );

  reviewControl: UntypedFormControl = new UntypedFormControl(null);

  override destroy$: Subject<any> = new Subject<any>();

  private documentTranslationMap: { [key: string]: string } = {
    'Additional Document 1': 'BULK-TRANFER.DOCUMENTS.ADDITIONAL_DOCUMENT_1',
    'Additional Document 2': 'BULK-TRANFER.DOCUMENTS.ADDITIONAL_DOCUMENT_2',
    'HVT Supporting Document': 'BULK-TRANFER.DOCUMENTS.HVT_SUPPORTING_DOCUMENT',
    'Funds transfer form': 'BULK-TRANFER.DOCUMENTS.FUNDS_TRANSFER_FORM',
  };

  constructor(
    protected override route: ActivatedRoute,
    protected override router: Router,
    protected override fb: UntypedFormBuilder,
    protected dialog: MatDialog,
    private ctxManager: ContextManager,
    private sharedLogicService: MmSharedLogicService,
    private translate: TranslateService // Add this injection
  ) {
    super(router, route, fb);
    this.RequiredDocumentsForm = this.fb.group({
      documents: this.fb.array([]),
    });
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

  routeToParent(quit: boolean): void {}

  goToDashboard() {
    this.router.navigate(['/services/customer-360/move-money']).then(() => {});
  }

  setupRequiredDocsInfo() {
    const vals = this.sharedLogicService.getMoveMoneyValuesFromStorage();
    this.docsInfo = vals.requiredDocsInfo;
    const unOrderedDocs = this.docsInfo.map(doc => ({
      name: this.getTranslatedDocumentName(doc.fileName),
      description: this.getTranslatedDocumentName(doc.fileName),
      fileTypes: doc.fileExtensions,
      maxSize: 10000 * 1024, // 10Mbs
      required: doc.required,
      documentCode: doc.documentCode,
    }));
    this.requiredDocuments = this.sharedLogicService.reorderDocumentsToUpload(
      unOrderedDocs,
      'name',
      this.translate.instant('BULK-TRANFER.DOCUMENTS.FUNDS_TRANSFER_FORM')
    );
    this.docValidators = this.docsInfo.map(doc => ({
      fileName: this.getTranslatedDocumentName(doc.fileName),
      formName: this.mergeStringWithUnderscores(
        this.getTranslatedDocumentName(doc.fileName)
      ),
      required: doc.required,
    }));
    this.initializeRequiredDocumentsFormOwnAcc();
  }

  private getTranslatedDocumentName(originalFileName: string): string {
    const translationKey = this.documentTranslationMap[originalFileName];
    if (translationKey) {
      return this.translate.instant(translationKey);
    }

    return originalFileName;
  }

  initializeRequiredDocumentsFormOwnAcc() {
    const documentArray = this.RequiredDocumentsForm.get(
      'documents'
    ) as FormArray;
    documentArray.clear();
    documentArray.controls.forEach(control => {
      control.clearValidators();
      control.updateValueAndValidity();
    });
    this.docsInfo.forEach(doc => {
      const validation = this.docValidators.find(
        v =>
          this.getTranslatedDocumentName(v.fileName) ===
          this.getTranslatedDocumentName(doc.fileName)
      );
      const validators =
        validation && validation.required ? [Validators.required] : [];

      const formName = this.mergeStringWithUnderscores(
        this.getTranslatedDocumentName(doc.fileName)
      );
      documentArray.push(
        this.fb.group({
          name: [formName],
          value: ['', validators],
        })
      );
    });
  }
  mergeStringWithUnderscores(inputString: string) {
    return inputString.replace(/\s+/g, '_');
  }

  updateDocuments(
    docData: {
      document: {
        data: string;
        docCode: string;
        filename: string;
        format: string;
      };
      file?: any;
    }[]
  ) {
    const docInfo = this.docsInfo;
    const docArray = this.RequiredDocumentsForm.get('documents') as FormArray;
    const docValidators = this.docValidators;
    this.uploads = this.sharedLogicService.updateRequiredMoveMoneyDocs(
      docData,
      docInfo,
      docArray,
      docValidators
    );
  }

  updatedLocalStorageDocs() {
    this.sharedLogicService.updateRequiredDocs(this.uploads);
  }
}

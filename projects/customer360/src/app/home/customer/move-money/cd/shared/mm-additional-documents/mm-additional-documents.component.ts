import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  IDocumentSpec,
  IUploadedDocument,
} from '@app/shared/modules/upload-docs';
import { Subject } from 'rxjs';
import { MoveMoneyDocsRequestedT } from '@app/home/customer/move-money/models/move-money-services.model';
import { OnSave, StepperChildComponent } from '@app/shared/modules/stepper';
import { MmSharedLogicService } from '@app/home/customer/move-money/cd/shared/mm-shared-logic.service';
import { DocumentsUploadDrcComponent } from '@app/shared/modules/upload-docs/documents-upload-drc/documents-upload-drc.component';

@Component({
  selector: 'app-mm-additional-documents',
  templateUrl: './mm-additional-documents.component.html',
  styleUrl: './mm-additional-documents.component.scss',
  imports: [DocumentsUploadDrcComponent],
})
export class MmAdditionalDocumentsComponent
  extends StepperChildComponent
  implements OnDestroy, OnSave
{
  @Input() form!: FormGroup;
  @Input() requiredDocuments: IDocumentSpec[] = [];
  @Output() updateDocuments = new EventEmitter();
  @Output() updatedLocalStorageDocs = new EventEmitter();
  destroy$: Subject<any> = new Subject<any>();

  uploads: {
    file: string;
    format: string;
    name: string;
    docCode: string;
  }[] = [];

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onSave() {
    this.updatedLocalStorageDocs.emit();
    this.gotoNext();
  }
}

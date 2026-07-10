import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './material.module';
import { ToastModule } from '../toast';
import { DocumentsUploadComponent } from './documents-upload.component';
import { DocumentsReviewComponent } from './review/documents-review.component';
import { DocumentPreviewComponent } from './preview/document-preview.component';
import { DragDropDocumentsDirective } from './drag-drop-documents.directive';
import { DocsStatusDialog } from './dialogs/docs-status.dialog';
import { DocsPreviewDialog } from './dialogs/docs-preview.dialog';
import { FileSizePipe } from './file-size.pipe';
import { FilenameLabelPipe } from './filenameLabel.pipe';

@NgModule({

  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    MaterialModule,
    FlexLayoutModule,
    DocumentsUploadComponent,
    DocumentsReviewComponent,
    DocumentPreviewComponent,
    DocsStatusDialog,
    DocsPreviewDialog,
    DragDropDocumentsDirective,
    FileSizePipe,
    FilenameLabelPipe,
  ],
  exports: [
    DocumentsUploadComponent,
    DocumentsReviewComponent,
    DocumentPreviewComponent,
    DragDropDocumentsDirective,
    FileSizePipe,
    FilenameLabelPipe,
  ],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DocumentsUploadModule {}

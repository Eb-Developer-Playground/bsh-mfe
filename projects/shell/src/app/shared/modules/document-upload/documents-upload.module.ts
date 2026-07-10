import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { CameraModalComponent } from './camera-modal/camera-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentUploadComponent } from './document-upload.component';

@NgModule({

  imports: [
      CommonModule,
      MaterialModule,
      MatTooltipModule,
      CameraModalComponent,
      DocumentUploadComponent,
    ],
  exports: [DocumentUploadComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DocumentsUploaderModule {}

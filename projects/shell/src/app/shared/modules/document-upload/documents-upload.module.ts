import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from './material.module';
import { CameraModalComponent } from './camera-modal/camera-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentUploadComponent } from './document-upload.component';

@NgModule({
  declarations: [CameraModalComponent, DocumentUploadComponent],
  imports: [CommonModule, MaterialModule, TranslateModule, MatTooltipModule],
  exports: [DocumentUploadComponent],
})
export class DocumentsUploaderModule {}

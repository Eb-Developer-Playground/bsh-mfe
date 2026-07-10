import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material.module';
import { ToastModule } from '../../toast';
import { DocumentsUploadDrcComponent } from './documents-upload-drc.component';
import { MatMenuModule } from '@angular/material/menu';
import { DocumentsUploadModule } from '../documents-upload.module';

@NgModule({
  declarations: [DocumentsUploadDrcComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    TranslateModule,
    MaterialModule,
    FlexLayoutModule,
    MatMenuModule,
    DocumentsUploadModule,
  ],
  exports: [DocumentsUploadDrcComponent],
})
export class DocumentsUploadModuleDrc {}

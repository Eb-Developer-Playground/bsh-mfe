import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material.module';
import { ToastModule } from '../../toast';
import { DocumentsUploadDrcComponent } from './documents-upload-drc.component';
import { MatMenuModule } from '@angular/material/menu';
import { DocumentsUploadModule } from '../documents-upload.module';

@NgModule({

  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    MaterialModule,
    FlexLayoutModule,
    MatMenuModule,
    DocumentsUploadModule,
    DocumentsUploadDrcComponent,
  ],
  exports: [DocumentsUploadDrcComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DocumentsUploadModuleDrc {}

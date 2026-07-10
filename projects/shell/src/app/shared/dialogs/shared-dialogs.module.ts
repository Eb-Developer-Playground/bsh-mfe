import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './material.module';

import { QuestionDialog } from './question/question.dialog';
import { TimeoutDialog } from './timeout-dialog/timeout.dialog';
import { ImagePreviewDialog } from './image-preview/image-preview.dialog';
import { RestrictedCountryDialog } from './restricted-country-dialog/restricted-country.dialog';

@NgModule({

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    NgOptimizedImage,
    QuestionDialog,
    RestrictedCountryDialog,
    TimeoutDialog,
    ImagePreviewDialog,
  ],
  exports: [QuestionDialog, TimeoutDialog, ImagePreviewDialog],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedDialogsModule {}

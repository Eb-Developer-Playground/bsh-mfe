import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from './material.module';

import { QuestionDialog } from './question/question.dialog';
import { TimeoutDialog } from './timeout-dialog/timeout.dialog';
import { ImagePreviewDialog } from './image-preview/image-preview.dialog';
import { RestrictedCountryDialog } from './restricted-country-dialog/restricted-country.dialog';

@NgModule({
  declarations: [
    QuestionDialog,
    RestrictedCountryDialog,
    TimeoutDialog,
    ImagePreviewDialog,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    NgOptimizedImage,
    TranslateModule,
  ],
  exports: [QuestionDialog, TimeoutDialog, ImagePreviewDialog],
})
export class SharedDialogsModule {}

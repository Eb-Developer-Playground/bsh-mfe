import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { DocumentCardsComponent } from './document-cards.component';
import { DocumentCardComponent } from './document-card/document-card.component';
import { PreviewComponent } from './preview/preview.component';

@NgModule({

  imports: [
      CommonModule,
      MaterialModule,
      DocumentCardsComponent,
      DocumentCardComponent,
      PreviewComponent,
    ],
  exports: [DocumentCardsComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DocumentsPreviewModule {}

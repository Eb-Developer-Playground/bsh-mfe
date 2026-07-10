import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from './material.module';
import { DocumentCardsComponent } from './document-cards.component';
import { DocumentCardComponent } from './document-card/document-card.component';
import { PreviewComponent } from './preview/preview.component';

@NgModule({
  declarations: [
    DocumentCardsComponent,
    DocumentCardComponent,
    PreviewComponent,
  ],
  imports: [CommonModule, MaterialModule, TranslateModule],
  exports: [DocumentCardsComponent],
})
export class DocumentsPreviewModule {}

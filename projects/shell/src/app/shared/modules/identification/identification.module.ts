import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';

import { DirectivesModule } from '../../directives';
import { IdTypePipe } from './id-type.pipe';
import { DedupeValidatorDirective } from './validators';
import { IdDocumentsComponent } from './id-documents/id-documents.component';
import { IdDocumentComponent } from './id-document/id-document.component';
import { DedupeFormComponent } from './dedupe-form/dedupe-form.component';
import { SearchableFormControl } from '../../form-controls';
import { DedupeSearchResultComponent } from './dedupe-search-result/dedupe-search-result.component';
import { TableDataModule } from '../../components/table-data/table-data.module';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationsModule } from '../notifications';
import { AutoCompleteField } from '@app/shared/components/auto-complete';
import { NgxMaskDirective } from 'ngx-mask';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NumberFormatModule } from './number-format.module';
import { DedupeResultsComponent } from './dedupe-results/dedupe-results.component';
import { ContactsModule } from '../contacts';

@NgModule({
  declarations: [
    IdDocumentsComponent,
    IdDocumentComponent,
    DedupeFormComponent,
    IdTypePipe,
    DedupeValidatorDirective,
    DedupeSearchResultComponent,
  ],
  exports: [
    DedupeSearchResultComponent,
    IdDocumentsComponent,
    DedupeFormComponent,
    DedupeResultsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DirectivesModule,
    SearchableFormControl,
    TableDataModule,
    TranslateModule,
    AutoCompleteField,
    NgxMaskDirective,
    NumberFormatModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    DedupeResultsComponent,
    NotificationsModule,
    ContactsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IdentificationModule {}

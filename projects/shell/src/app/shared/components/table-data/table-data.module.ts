import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableDataComponent } from './table-data.component';
import { MaterialModule } from './material.modules';
import { TranslateModule } from '@ngx-translate/core';
import { TableFieldsTemplateComponent } from './components/table-fields-template/table-fields-template.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TableFieldsHeaderMenuComponent } from './components/table-fields-header-menu/table-fields-header-menu.component';
import { TableDataService } from './services/table-data.service';
import { TableFilterComponent } from './components/table-filter/table-filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablePillsComponent } from './components/table-pills/table-pills.component';

@NgModule({
  providers: [TableDataService],
  declarations: [
    TableDataComponent,
    TableFieldsTemplateComponent,
    TableFieldsHeaderMenuComponent,
    TableFilterComponent,
    TablePillsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    FlexLayoutModule,
  ],
  exports: [TableDataComponent],
})
export class TableDataModule {}

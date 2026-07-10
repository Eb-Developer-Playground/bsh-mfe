import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableDataComponent } from './table-data.component';
import { MaterialModule } from './material.modules';
import { TableFieldsTemplateComponent } from './components/table-fields-template/table-fields-template.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TableFieldsHeaderMenuComponent } from './components/table-fields-header-menu/table-fields-header-menu.component';
import { TableDataService } from './services/table-data.service';
import { TableFilterComponent } from './components/table-filter/table-filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablePillsComponent } from './components/table-pills/table-pills.component';

@NgModule({
  providers: [TableDataService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    TableDataComponent,
    TableFieldsTemplateComponent,
    TableFieldsHeaderMenuComponent,
    TableFilterComponent,
    TablePillsComponent,
  ],
  exports: [TableDataComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TableDataModule {}

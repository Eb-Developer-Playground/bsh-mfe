import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './material.module';
import { AccountsListModule } from '../accounts-list';
import { EddComponent } from './edd.component';
import { EddFormPrintComponent } from './form-print/edd-form-print.component';

@NgModule({

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    AccountsListModule,
    EddComponent,
    EddFormPrintComponent,
  ],
  exports: [EddComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EddModule {}

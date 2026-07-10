import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './material.module';
import { AccountsListComponent } from './accounts-list.component';

@NgModule({

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    AccountsListComponent,
  ],
  exports: [AccountsListComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AccountsListModule {}

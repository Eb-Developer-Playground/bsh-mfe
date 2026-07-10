import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './material.module';
import { AccountsListComponent } from './accounts-list.component';

@NgModule({
  declarations: [AccountsListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
  ],
  exports: [AccountsListComponent],
})
export class AccountsListModule {}

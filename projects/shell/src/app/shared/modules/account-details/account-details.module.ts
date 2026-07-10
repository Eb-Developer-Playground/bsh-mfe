import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../pipes/pipes.module';
import { MaterialModule } from './material.module';
import { AccountDetailsComponent } from './account-details.component';
@NgModule({

  imports: [
      CommonModule,
      MaterialModule,
      PipesModule,
      AccountDetailsComponent,
    ],
  exports: [AccountDetailsComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AccountDetailsModule {}

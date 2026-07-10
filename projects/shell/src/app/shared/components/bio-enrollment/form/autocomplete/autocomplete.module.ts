import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { AutocompleteComponent } from './autocomplete.component';

@NgModule({

  imports: [
      CommonModule,
      ReactiveFormsModule,
      MaterialModule,
      AutocompleteComponent,
    ],
  exports: [AutocompleteComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AutocompleteModule {}

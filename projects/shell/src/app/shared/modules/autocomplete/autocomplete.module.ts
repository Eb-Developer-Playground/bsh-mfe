import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { AutocompleteComponent } from './autocomplete.component';

@NgModule({
  declarations: [AutocompleteComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  exports: [AutocompleteComponent],
})
export class AutocompleteModule {}

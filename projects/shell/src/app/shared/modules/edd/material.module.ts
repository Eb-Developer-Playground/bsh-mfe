import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
  ],
})
export class MaterialModule {}

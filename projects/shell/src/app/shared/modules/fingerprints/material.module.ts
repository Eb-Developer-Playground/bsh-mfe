import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatTableModule,
    MatMenuModule,
    MatPaginatorModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
  ],
})
export class MaterialModule {}

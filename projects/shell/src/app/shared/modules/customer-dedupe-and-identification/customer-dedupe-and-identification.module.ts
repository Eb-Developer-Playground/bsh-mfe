import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { IdentificationModule } from '../identification';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerDedupeAndIdentificationDetailsComponent } from './components/customer-dedupe-and-identification-details/customer-dedupe-and-identification-details.component';
import { CustomerCifDetailsFilteringService } from './services/customer-cif-details-filtering.service';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@NgModule({

  imports: [
    CommonModule,
    MatDividerModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    IdentificationModule,
    CustomerDedupeAndIdentificationDetailsComponent,
  ],
  providers: [CustomerCifDetailsFilteringService],
  exports: [CustomerDedupeAndIdentificationDetailsComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerDedupeAndIdentificationModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { LocalizationService } from './localization.service';
import { PreferenceDialog } from './preference.dialog';
import { ToastModule } from '../toast';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [PreferenceDialog],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule,
    TranslateModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    ToastModule,
  ],
  providers: [LocalizationService],
})
export class LocalizationModule {}

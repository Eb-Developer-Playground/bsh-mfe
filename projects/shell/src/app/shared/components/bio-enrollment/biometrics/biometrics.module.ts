import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './material.module';
import { AutocompleteModule } from '../form/autocomplete/autocomplete.module';

import { BiometricsComponent } from './biometrics.component';
import { BiometricsFingerComponent } from './biometrics-finger/biometrics-finger.component';
import { BiometricHandComponent } from './biometric-hand/biometric-hand.component';
import { BiometricCompleteDialog, SkipBioDialog } from './dialogs';
import { ToastModule } from 'src/app/shared/modules/toast';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    BiometricsComponent,
    BiometricsFingerComponent,
    BiometricHandComponent,
    BiometricCompleteDialog,
    SkipBioDialog,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    AutocompleteModule,
    ToastModule,
    TranslateModule,
  ],
  exports: [
    BiometricsComponent,
    BiometricsFingerComponent,
    BiometricHandComponent,
  ],
})
export class BiometricsModule {}

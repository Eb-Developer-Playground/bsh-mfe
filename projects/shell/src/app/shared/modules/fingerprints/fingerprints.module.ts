import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { ToastModule } from '../toast';
import { PipesModule } from '../../pipes/pipes.module';
import { AutocompleteModule } from '../autocomplete/autocomplete.module';
import { MaterialModule } from './material.module';

import {
  FingerComponent,
  FingerprintsComponent,
  HandComponent,
} from './components';
import {
  SkipEnrolBioDialog,
  VerifyBioDialog,
  VerifySignatoryBioDialog,
  VerifySignatoryDialog,
  VerifySkipBioDialog,
} from './dialogs';
import { TransformProfileActionPipe } from './pipes/transform-profile-action.pipe';

@NgModule({
  declarations: [
    FingerprintsComponent,
    FingerComponent,
    HandComponent,
    SkipEnrolBioDialog,
    VerifySignatoryDialog,
    VerifySignatoryBioDialog,
    VerifySkipBioDialog,
    VerifyBioDialog,
    TransformProfileActionPipe,
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
    FingerprintsComponent,
    FingerComponent,
    HandComponent,
    SkipEnrolBioDialog,
    VerifySignatoryDialog,
    VerifySignatoryBioDialog,
    VerifySkipBioDialog,
    VerifyBioDialog,
  ],
})
export class FingerprintsModule {}

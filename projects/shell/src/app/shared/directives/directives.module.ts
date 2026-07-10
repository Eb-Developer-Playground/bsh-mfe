import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppNationalIdValidateDirective } from './nationalid-validator';
import { CapitalsDirective } from './capitals.directive';
import { EmailValidatorDirective } from './email';
import { FullNumbersOnlyDirective } from './full-numbers-only.directive';
import { KenyanPassportValidatorDirective } from './kenyan-passport-validator.directive';
import { KraPinValidatorDirective } from './kra-pin-validator.directive';
import { KraPinInputDirective } from './kra-pin-input.directive';
import { LettersDirective } from './letters.directive';
import { MaxRangeDirective } from './max-range.directive';
import { NationalidValidatorDirective } from './nationalid-validator.directive';
import { NumberSecondDirective } from './numbers-only.directive';
import { NumberDirective } from './number.directive';
import { OnlyDecimalDirective } from './only-decimal.directive';
import { PersonalNameDirective } from './personal-name.directive';
import { ToUpperCaseDirective } from './to-upper-case.directive';
import { TrimWhitespaceDirective } from './trim-whitespace.directive';
import { DocumentReviewComponentNew } from '@app/shared/modules/upload-docs/review/new/document-review-new.component';
import { DocumentsUploadModule } from '@app/shared/modules/upload-docs';
import { MatCard, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@NgModule({
  declarations: [
    AppNationalIdValidateDirective,
    CapitalsDirective,
    EmailValidatorDirective,
    FullNumbersOnlyDirective,
    KenyanPassportValidatorDirective,
    KraPinValidatorDirective,
    KraPinInputDirective,
    LettersDirective,
    MaxRangeDirective,
    NationalidValidatorDirective,
    NumberSecondDirective,
    NumberDirective,
    OnlyDecimalDirective,
    PersonalNameDirective,
    ToUpperCaseDirective,
    TrimWhitespaceDirective,
    TrimWhitespaceDirective,
    DocumentReviewComponentNew,
  ],
  imports: [
    CommonModule,
    DocumentsUploadModule,
    MatCard,
    MatCardHeader,
    MatIcon,
    MatIconButton,
    MatCardTitle,
  ],
  exports: [
    AppNationalIdValidateDirective,
    CapitalsDirective,
    EmailValidatorDirective,
    FullNumbersOnlyDirective,
    KenyanPassportValidatorDirective,
    KraPinValidatorDirective,
    KraPinInputDirective,
    LettersDirective,
    MaxRangeDirective,
    NationalidValidatorDirective,
    NumberSecondDirective,
    NumberDirective,
    OnlyDecimalDirective,
    PersonalNameDirective,
    ToUpperCaseDirective,
    TrimWhitespaceDirective,
    DocumentReviewComponentNew,
  ],
})
export class DirectivesModule {}

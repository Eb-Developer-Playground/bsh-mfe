import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StepperModule } from '../../../shared/modules/stepper';
import { DocumentsUploadModule } from '../../../shared/modules/upload-docs';

import { ChangeOfMandateRoutingModule } from './change-of-mandate-routing.module';
import { ChangeOfMandateComponent } from './change-of-mandate.component';
import { MandateDocumentsComponent } from './documents/mandate-documents.component';
import { AdditionalDetailsComponent } from './mandate-form/additional-details/additional-details.component';
import { ChangeMandateAccountDetailComponent } from './mandate-form/change-mandate-account-detail/change-mandate-account-detail.component';
import { ChangeMandateAccountComponent } from './mandate-form/change-mandate-account/change-mandate-account.component';
import { ChangeMandateSelectAccountComponent } from './mandate-form/change-mandate-select-account/change-mandate-select-account.component';
import { ChangeMandateNewSignatoryComponent } from './mandate-form/change-mandate-select-signatories/change-mandate-new-signatory/change-mandate-new-signatory.component';
import { ChangeMandateSelectSignatoriesComponent } from './mandate-form/change-mandate-select-signatories/change-mandate-select-signatories.component';
import { ChangeMandateSelectSignatoryComponent } from './mandate-form/change-mandate-select-signatories/change-mandate-select-signatory/change-mandate-select-signatory.component';
import { MandateFormComponent } from './mandate-form/mandate-form.component';
import { MaterialModule } from './material.module';
import { SuccessComponent } from './success/success.component';
import { FingerprintsModule } from '../../../shared/modules/fingerprints';
import { ChangeMandateDocumentsUploadComponent } from './mandate-form/change-mandate-documents-upload/change-mandate-documents-upload.component';
import { CurrentMandateSignatoriesComponent } from './mandate-form/current-mandate-signatories/current-mandate-signatories.component';
import { CollapsibleComponent } from '@app/shared/modules/new-collapsible-section/collapsible.component';
import { SignatoriesListComponent } from './mandate-form/current-mandate-signatories/signatories-list/signatories-list.component';
import { SignatorySliderComponent } from './mandate-form/current-mandate-signatories/signatory-slider/signatory-slider.component';
import { ChangeMandatePreviewComponent } from './mandate-form/change-mandate-preview/change-mandate-preview.component';
import { DocumentsComponent } from './mandate-form/change-mandate-preview/documents-view/documents.component';
import { DocumentsUploaderModule } from '../../../shared/modules/document-upload/documents-upload.module';
import { DocumentsUploadModuleDrc } from '../../../shared/modules/upload-docs/documents-upload-drc/documents-upload-drc.module';

@NgModule({
  declarations: [
    ChangeMandateAccountDetailComponent,
    ChangeMandateSelectAccountComponent,
    ChangeMandateAccountComponent,
    ChangeMandateSelectSignatoriesComponent,
    AdditionalDetailsComponent,
    ChangeMandateNewSignatoryComponent,
    ChangeMandateSelectSignatoryComponent,
    ChangeMandateDocumentsUploadComponent,
    ChangeOfMandateComponent,
    SuccessComponent,
    MandateFormComponent,
    MandateDocumentsComponent,
    CurrentMandateSignatoriesComponent,
    SignatoriesListComponent,
    SignatorySliderComponent,
    ChangeMandatePreviewComponent,
    DocumentsComponent,
  ],
  imports: [
    FlexModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChangeOfMandateRoutingModule,
    CdkStepperModule,
    StepperModule,
    MaterialModule,
    DocumentsUploadModule,
    TranslateModule,
    FingerprintsModule,
    CollapsibleComponent,
    DocumentsUploaderModule,
    DocumentsUploadModuleDrc,
  ],
  exports:[
    MandateDocumentsComponent
  ]
})
export class ChangeOfMandateModule {}

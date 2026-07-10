import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../components.module';
import { MaterialModule } from '../material/material.module';
import { ChangeOfSignatureChangeComponent } from './change-of-signature-change/change-of-signature-change.component';
import { ChangeOfSignatureStakeholderDetailComponent } from './change-of-signature-stakeholder-detail/change-of-signature-stakeholder-detail.component';
import { ChangeOfSignatureSuccessComponent } from './change-of-signature-success/change-of-signature-success.component';
import { ChangeOfSignatureSupportingDocumentsComponent } from './change-of-signature-supporting-documents/change-of-signature-supporting-documents.component';
import { ChangeOfSignatureApprovalComponent } from './change-of-signature-approval/change-of-signature-approval.component';
import { ChangeOfSignatureSkipBioComponent } from './change-of-signature-skip-bio/change-of-signature-skip-bio.component';
import { ChangeOfSignatureBioDialog } from './change-of-signature-bio-dialog/change-of-signature-bio-dialog.component';
import { PhotoSignatoriesListComponent } from './signatories-list/signatories-list.component';

@NgModule({

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    ComponentsModule,
    ChangeOfSignatureChangeComponent,
    ChangeOfSignatureStakeholderDetailComponent,
    ChangeOfSignatureSuccessComponent,
    ChangeOfSignatureSupportingDocumentsComponent,
    ChangeOfSignatureApprovalComponent,
    ChangeOfSignatureSkipBioComponent,
    ChangeOfSignatureBioDialog,
    PhotoSignatoriesListComponent,
  ],
  exports: [
    ChangeOfSignatureChangeComponent,
    ChangeOfSignatureStakeholderDetailComponent,
    ChangeOfSignatureSuccessComponent,
    ChangeOfSignatureSupportingDocumentsComponent,
    ChangeOfSignatureApprovalComponent,
    ChangeOfSignatureSkipBioComponent,
    ChangeOfSignatureBioDialog,
  ],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChangeOfSignatureComponentsModule {}

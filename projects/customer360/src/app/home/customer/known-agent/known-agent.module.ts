import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CdkStepperModule } from "@angular/cdk/stepper";
import { MaterialModule } from "../material.module";


import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '@app/shared/components/components.module';
import { KnownAgentAdditionalInformationComponent } from '@app/shared/components/known-agent/known-agent-additional-information/known-agent-additional-information.component';
import { KnownAgentApprovalComponent } from '@app/shared/components/known-agent/known-agent-approval/known-agent-approval.component';
import { KnownAgentCustomerImageComponent } from '@app/shared/components/known-agent/known-agent-customer-image/known-agent-customer-image.component';
import { KnownAgentDetailsComponent } from '@app/shared/components/known-agent/known-agent-details/known-agent-details.component';

import { KnownAgentFunctionsComponent } from '@app/shared/components/known-agent/known-agent-functions/known-agent-functions.component';
import { KnownAgentHighRiskDetailsComponent } from '@app/shared/components/known-agent/known-agent-high-risk-details/known-agent-high-risk-details.component';
import { KnownAgentIntroduceComponent } from '@app/shared/components/known-agent/known-agent-introduce/known-agent-introduce.component';
import { KnownAgentSuccessComponent } from '@app/shared/components/known-agent/known-agent-success/known-agent-success.component';
import { KnownAgentSupportingDocumentsComponent } from '@app/shared/components/known-agent/known-agent-supporting-documents/known-agent-supporting-documents.component';
import { KnownAgentTicketDetailsComponent } from '@app/shared/components/known-agent/known-agent-ticket-details/known-agent-ticket-details.component';

import { FindAgentComponent } from './find-agent/find-agent.component';
import { KnownAgentRoutingModule } from './known-agent-routing.module';
import { KnownAgentComponent } from './known-agent.component';
import { RemoveAgentComponent } from './remove-agent/remove-agent.component';
import { SuccessComponent } from './success/success.component';
// import { UploadAgentDocumentsComponent } from './upload-agent-documents/upload-agent-documents.component';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { KnownAgentShowLimitsComponent } from '@app/shared/components/known-agent/known-agent-show-limits/known-agent-show-limits.component';
import { KnownAgentValidationComponent } from '@app/shared/components/known-agent/known-agent-validation/known-agent-validation.component';
import { TableDataModule } from '@app/shared/components/table-data/table-data.module';
import { CustomerDedupeAndIdentificationModule } from '@app/shared/modules/customer-dedupe-and-identification/customer-dedupe-and-identification.module';
import { DocumentsPreviewModule } from '@app/shared/modules/documents-preview/documents-preview.module';
import { DocumentsUploadModule } from '@app/shared/modules/upload-docs';
import { KnownAgentEditFunctionsComponent } from './known-agent-edit-functions/known-agent-edit-functions.component';
import { KnownAgentLimitsComponent } from './known-agent-limits/known-agent-limits.component';
import { KnownAgentListComponent } from './known-agent-list/known-agent-list.component';
import { KnownAgentOverviewComponent } from './known-agent-overview/known-agent-overview.component';
import { KnownAgentViewAgentDetailsComponent } from './known-agent-view-agent-details/known-agent-view-agent-details.component';

import { KnownAgentAmendFunctionsComponent } from './known-agent-amend-functions/known-agent-amend-functions.component';
import { KnownAgentService } from './services/known.agent.service';
import {DocumentsUploadModuleDrc} from '@app/shared/modules/upload-docs/documents-upload-drc/documents-upload-drc.module';

@NgModule({

    declarations: [
        KnownAgentIntroduceComponent,
        KnownAgentDetailsComponent,
        KnownAgentFunctionsComponent,
        KnownAgentSupportingDocumentsComponent,
        KnownAgentValidationComponent,
        KnownAgentApprovalComponent,
        KnownAgentSuccessComponent,
        KnownAgentAdditionalInformationComponent,
        KnownAgentEditFunctionsComponent,
        KnownAgentHighRiskDetailsComponent,
        KnownAgentCustomerImageComponent, /*TODO REMOVE THIS ONE */
        KnownAgentTicketDetailsComponent,
        KnownAgentComponent,
        FindAgentComponent,
        RemoveAgentComponent,
        SuccessComponent,
        KnownAgentShowLimitsComponent,


        //CustomerImageComponent,
        /*NEW IU COMPONENTS */
        KnownAgentOverviewComponent,
        KnownAgentListComponent,
        KnownAgentViewAgentDetailsComponent,
        KnownAgentLimitsComponent,
        KnownAgentAmendFunctionsComponent,


        // UploadAgentDocumentsComponSent,

    ],exports:[
        KnownAgentIntroduceComponent,
        KnownAgentDetailsComponent,
        KnownAgentFunctionsComponent,
        KnownAgentSupportingDocumentsComponent,
        KnownAgentValidationComponent,
        KnownAgentApprovalComponent,
        KnownAgentSuccessComponent,
        KnownAgentAdditionalInformationComponent,
        KnownAgentEditFunctionsComponent,
        KnownAgentHighRiskDetailsComponent,
        KnownAgentCustomerImageComponent,
        KnownAgentTicketDetailsComponent,
        KnownAgentComponent,
        FindAgentComponent,
        RemoveAgentComponent,
        SuccessComponent,
        KnownAgentShowLimitsComponent
        // UploadAgentDocumentsComponent,

    ],
    imports: [
        DocumentsUploadModule,
        FormsModule,
        ReactiveFormsModule,
        ComponentsModule,
        CommonModule,
        FlexLayoutModule,
        MaterialModule,
        CdkStepperModule,
        TranslateModule,
        KnownAgentRoutingModule,
        TableDataModule,
        CurrencyMaskModule,
        DocumentsPreviewModule,
        CustomerDedupeAndIdentificationModule,
        DocumentsUploadModuleDrc


    ], providers:[
        KnownAgentService
    ]
})
export class KnownAgentModule {}

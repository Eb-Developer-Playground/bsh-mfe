import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { ThemingComponent } from './guides/theming/theming.component';
import { IconographyComponent } from './guides/iconography/iconography.component';
import { TypographyComponent } from './guides/typography/typography.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DirectivesModule } from '@app/shared/directives/directives.module';
import { ToastGuideComponent } from './guides/toast/toast-guide.component';
import { VerifyBioDialogComponent } from './verify-bio-dialog/verify-bio-dialog.component';
import { ViewReasonDialogComponent } from './view-reason-dialog/view-reason-dialog.component';
import { LaunchCustomerDialogComponent } from './launch-customer-dialog/launch-customer-dialog.component';
import { FileBoxComponent } from './file-box/file-box.component';
import { DialogDocumentPreviewComponent } from './dialog/dialog-document-preview/dialog-document-preview.component';
import { DialogConfirmComponent } from './dialog/dialog-confirm/dialog-confirm.component';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';
import { ApprovalFormComponent } from './approval-form/approval-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { AccountDetailSectionComponent } from './account-detail-section/account-detail-section.component';
import { VerifySkipBioComponent } from './verify-skip-bio/verify-skip-bio.component';
import { BicSearchDialog } from './bic-search-dialog/bic-search-dialog';
import { SignDialogComponent } from './dialog/sign-dialog/sign-dialog.component';
import { InfoDialogComponent } from './dialog/info-dialog/info-dialog.component';
import { DynamicHTMLModule } from './dialog/dynamic-html';
import { AdditionalDetailsComponent } from '@app/home/customer/change-of-mandate/mandate-form/additional-details/additional-details.component';
import { ChangeMandateAccountDetailComponent } from '@app/home/customer/change-of-mandate/mandate-form/change-mandate-account-detail/change-mandate-account-detail.component';
import { CashManagementPrintReceiptComponent } from './dialog/cash-management-print-receipt/cash-management-print-receipt.component';
import { DialogPrintReceiptComponent } from './dialog/dialog-print-receipt/dialog-print-receipt.component';
import { InfoBoxComponent } from './info-box/info-box.component';
import { DragDropDocumentsDirective } from '../directives/drag-drop-documents.directive';
import { ToastModule } from '../modules/toast';
import { BioEnrollmentComponent } from './bio-enrollment/bio-enrollment.component';
import { VerifySignatoryDialogComponent } from './verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySignatoryBioDialogComponent } from './verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { DialogStatementComponent } from './dialog/dialog-statement/dialog-statement.component';
import { AppPhoneValidateDirective } from '../directives/phone-validator';
import { HeaderComponent } from './header/header.component';
import { PdfDialogComponent } from './dialog/pdf-dialog/pdf-dialog.component';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { BreadcrumbNavigationComponent } from './breadcrumb-navigation/breadcrumb-navigation.component';
import { PhoneOtpValidationComponent } from './phone-otp-validation/phone-otp-validation.component';
import { EmailLinkValidationComponent } from './email-link-validation/email-link-validation.component';
import { DocumentPreviewComponent } from './document/document-preview/document-preview.component';
import { DocumentComponent } from './document/documents.component';
import { DocumentCardComponent } from './document/document-card/document-card.component';
import { DialogBalanceStatementComponent } from './dialog/dialog-balance-statement/dialog-balance-statement.component';
import { PillsComponent } from './pills/pills.component';
import { PipesModule } from '../pipes/pipes.module';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { CustomerDetailImagesComponent } from './customer-details/customer-detail-images/customer-detail-images.component';
import { CustomerImagesPreviewModalComponent } from './customer-details/customer-images-preview-modal/customer-images-preview-modal.component';
import { BulkPaymentTicketTransactionsPrintReceiptComponent } from './dialog/bulk-payment-ticket-transactions-print-receipt/bulk-payment-ticket-transactions-print-receipt.component';
import { DialogDocumentAgentPreviewComponent } from './dialog/dialog-document-agent-preview/dialog-document-agent-preview.component';
import { ActiveSpecialForexRatesComponent } from './active-special-forex-rates/active-special-forex-rates/active-special-forex-rates.component';
import { CommonCustomerImageComponent } from './customer-image/customer-image.component';
import { CommonCustomerImagePreviewModalComponent } from './customer-image/customer-image-preview-modal/customer-image-preview-modal.component';
import { AccountCardComponent } from './account-card/account-card.component';
import { EntityInformationComponent } from './customer-information/entity/entity.component';
import { CustomerInformationComponent } from './customer-information/individual/customer-information.component';
import { CustomerImageComponent } from './customer-information/individual/customer-image/customer-image.component';
import { EntityImageComponent } from './customer-information/entity/entity-image/entity-image.component';
import { RouterModule } from '@angular/router';
import { SoftDeleteDialogComponent } from './customer-information/soft-delete-dialog/soft-delete-dialog.component';
import { CustomerProfileStatusComponent } from './customer-information/customer-profile-status/customer-profile-status.component';
import { ExistingCustomerComponent } from './existing-customer/existing-customer.component';
import { LegalSearchComponent } from './customer-information/legal-search/legal-search.component';
import { ListItemComponent } from './list-item/list-item.component';
import { ButtonItemMenuComponent } from './button-item-menu/button-item-menu.component';
import { SharedEntityInformationComponent } from './shared-entity-information/shared-entity-information.component';
import { TransactionHistoryDetailsComponent } from '@app/home/customer/transactions/transaction-history-details/transaction-history-details.component';
import { SendTermsDialogComponent } from './send-terms-dialog/send-terms-dialog.component';
import { CurrentMandateSignatoriesComponent } from '@app/home/customer/change-of-mandate/mandate-form/current-mandate-signatories/current-mandate-signatories.component';
import { BiometricsModule } from '@app/shared/components/bio-enrollment/biometrics';
import { DocumentsUploaderModule } from '../modules/document-upload/documents-upload.module';
import { TransformCurrencyPipe } from '@app/shared/pipes/transform-currency.pipe';
import { CustomerAccountDetails } from '@app/shared/components/customer-account-details/customer-account-details';
import { DocumentsUploadModuleDrc } from '../modules/upload-docs/documents-upload-drc/documents-upload-drc.module';
import { DocumentsUploadModule } from '../modules/upload-docs';
import { CommonCustomerInformationComponent } from '@shared/components/customer-information/customer-information.component';
import { SkeletonLoaderComponent } from './skeleton-loader/skeleton-loader.component';

@NgModule({
  providers: [DatePipe],
  declarations: [
    ThemingComponent,
    IconographyComponent,
    TypographyComponent,
    ToastGuideComponent,
    VerifyBioDialogComponent,
    ViewReasonDialogComponent,
    LaunchCustomerDialogComponent,
    FileBoxComponent,
    DialogDocumentPreviewComponent,
    PdfDialogComponent,
    DialogConfirmComponent,
    TicketDetailsComponent,
    ApprovalFormComponent,
    AccountDetailSectionComponent,
    VerifySkipBioComponent,
    BicSearchDialog,
    SignDialogComponent,
    InfoDialogComponent,
    DialogPrintReceiptComponent,
    CashManagementPrintReceiptComponent,
    InfoBoxComponent,
    DragDropDocumentsDirective,
    BioEnrollmentComponent,
    // BiometricsComponent,
    // SkipBioDialog,
    // BiometricCompleteDialog,
    // BiometricsFingerComponent,
    // BiometricHandComponent,
    AutocompleteComponent,
    VerifySignatoryDialogComponent,
    VerifySignatoryBioDialogComponent,
    DialogStatementComponent,
    BreadcrumbNavigationComponent,
    DialogBalanceStatementComponent,
    AppPhoneValidateDirective,
    HeaderComponent,
    PhoneOtpValidationComponent,
    EmailLinkValidationComponent,
    DocumentPreviewComponent,
    DocumentComponent,
    DocumentCardComponent,
    // PillsComponent,
    CustomerDetailsComponent,
    CustomerDetailImagesComponent,
    CustomerImagesPreviewModalComponent,
    BulkPaymentTicketTransactionsPrintReceiptComponent,
    DialogDocumentAgentPreviewComponent,
    ActiveSpecialForexRatesComponent,
    CommonCustomerImageComponent,
    CommonCustomerImagePreviewModalComponent,
    ActiveSpecialForexRatesComponent,
    EntityInformationComponent,
    CustomerImageComponent,
    EntityImageComponent,
    AccountCardComponent,
    SoftDeleteDialogComponent,
    CustomerProfileStatusComponent,
    ExistingCustomerComponent,
    ExistingCustomerComponent,
    LegalSearchComponent,
    ListItemComponent,
    ButtonItemMenuComponent,
    SharedEntityInformationComponent,
    TransactionHistoryDetailsComponent,
    SendTermsDialogComponent,
    CustomerAccountDetails,
    CustomerInformationComponent,
  ],
  imports: [
    CommonModule,
    PillsComponent,
    DocumentsUploaderModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PdfViewerModule,
    FlexLayoutModule,
    MaterialModule,
    TranslateModule,
    ToastModule,
    DirectivesModule,
    DocumentsUploadModuleDrc,
    DocumentsUploadModule,
    DynamicHTMLModule.forRoot({
      components: [
        {
          component: AdditionalDetailsComponent,
          selector: 'app-additional-details',
        },
        {
          component: ChangeMandateAccountDetailComponent,
          selector: 'app-change-mandate-account-detail',
        },
        {
          component: CurrentMandateSignatoriesComponent,
          selector: 'app-current-mandate-signatories',
        },
      ],
    }),
    PipesModule,
    BiometricsModule,
    TransformCurrencyPipe,
    SkeletonLoaderComponent,
  ],
  exports: [
    ThemingComponent,
    IconographyComponent,
    TypographyComponent,
    ToastGuideComponent,
    FileBoxComponent,
    DialogDocumentPreviewComponent,
    PdfDialogComponent,
    DialogPrintReceiptComponent,
    CashManagementPrintReceiptComponent,
    TicketDetailsComponent,
    ApprovalFormComponent,
    AccountDetailSectionComponent,
    BicSearchDialog,
    SignDialogComponent,
    VerifySkipBioComponent,
    InfoDialogComponent,
    HeaderComponent,
    AutocompleteComponent,
    InfoBoxComponent,
    BreadcrumbNavigationComponent,
    HeaderComponent,
    InfoBoxComponent,
    BreadcrumbNavigationComponent,
    PhoneOtpValidationComponent,
    EmailLinkValidationComponent,
    DocumentPreviewComponent,
    DocumentComponent,
    DocumentCardComponent,
    DragDropDocumentsDirective,
    CustomerDetailsComponent,
    BulkPaymentTicketTransactionsPrintReceiptComponent,
    DialogDocumentAgentPreviewComponent,
    ActiveSpecialForexRatesComponent,
    CommonCustomerImageComponent,
    CommonCustomerImagePreviewModalComponent,
    AccountCardComponent,
    ActiveSpecialForexRatesComponent,
    CustomerImageComponent,
    EntityInformationComponent,
    ExistingCustomerComponent,
    ListItemComponent,
    ButtonItemMenuComponent,
    SharedEntityInformationComponent,
    TransactionHistoryDetailsComponent,
    CustomerAccountDetails,
    CustomerInformationComponent,
    SoftDeleteDialogComponent,
    SkeletonLoaderComponent,
  ],
})
export class ComponentsModule {}

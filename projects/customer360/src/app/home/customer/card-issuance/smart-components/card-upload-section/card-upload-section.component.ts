import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardIssuanceService } from '@app/home/customer/card-issuance/services/card-issuance.service';
import { CardIssuanceApisService } from '@app/home/customer/card-issuance/services/card-issuance-apis.service';
import { Observable, of } from 'rxjs';
import {
  CardIssuanceDocCodeResponseT,
  DocumentsUploadResponseT,
  InstantCardIssuanceRequestDataT,
  IssuanceCustomerDataT,
} from '@app/home/customer/card-issuance/card-issuance.models';
import { Router } from '@angular/router';
import { ActionTicketsService } from '@app/shared/services/actionTickets/action-tickets.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { AccountService } from '@app/core/services';
import { SessionService } from '@app/shared/services';
import { NgIf, NgFor } from '@angular/common';
import { DocumentsUploadDrcComponent } from '@shared/modules/upload-docs';

@Component({
  selector: 'app-card-upload-section',
  templateUrl: './card-upload-section.component.html',
  styleUrls: [
    '../../card-issuance.component.scss',
    './card-upload-section.component.scss',
  ],
  imports: [
    ReactiveFormsModule,
    DocumentsUploadDrcComponent,
  ],
})
export class CardUploadSectionComponent {
  @Input() DocumentsForm!: FormGroup;
  @Input() requiredDocuments: any[] = [];
  @Input() runningTaskId: any;
  @Input() runningActionFlow: string = '';
  @Input() activeAccountNumber: string = '';
  @Input() issuanceType: 'INSTANT' | 'PREMIUM' | 'PREPAID' = 'INSTANT';
  @Output() validationChange = new EventEmitter<any[]>();
  @Output() documentsProcessed = new EventEmitter<void>();

  activeActionFlow: string = 'InstantCardIssuance';
  customerData: IssuanceCustomerDataT = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  upload = '';
  activeTicketNumber: string = '89642';
  loadingDocCodes = false;

  private documentsForUpload: any[] = [];
  private uploadedDocs: any[] = [];
  private uploadedDocsAreValid = false;

  constructor(
    private fb: FormBuilder,
    private cardIssuanceService: CardIssuanceService,
    private cardIssuanceApisService: CardIssuanceApisService,
    private router: Router,
    private actionTicketsService: ActionTicketsService,
    private toastService: ToastService,
    private accountService: AccountService,
    private session: SessionService
  ) {}
  get documents(): FormArray {
    return this.DocumentsForm.get('documents') as FormArray;
  }

  setupDocCodes() {
    this.getDocCodes();
  }

  setupActiveRequestData() {
    const issuanceRequest: InstantCardIssuanceRequestDataT = JSON.parse(
      <string>localStorage.getItem('Cards-Issuance-RequestData')
    );
    if (issuanceRequest) {
      this.activeActionFlow = issuanceRequest.actionFlowName;
      this.activeTicketNumber = issuanceRequest.ticketID;
    }
  }
  getDocCodes() {
    this.setupActiveRequestData();
    this.loadingDocCodes = true;
    const apiCall: Observable<CardIssuanceDocCodeResponseT> =
      this.cardIssuanceApisService.getDocCodes(
        this.activeTicketNumber,
        this.activeActionFlow
      );
    this.cardIssuanceService.callApi(
      apiCall,
      (isSuccess: boolean, response: CardIssuanceDocCodeResponseT) => {
        this.loadingDocCodes = false;
        if (isSuccess) {
          this.requiredDocuments =
            response.responseObject.DocumentData.Documents.map(doc => ({
              key: doc.DocumentCode,
              name: doc.FileName,
              description: doc.ShortDesc,
              fileTypes: doc.FileExtensions,
              maxSize: 1048576,
              required: doc.Required,
            }));
        }
      }
    );
  }
  updateValidation(
    uploadEv: {
      description: string;
      document: { filename: string; data: string; format: string };
      file?: any;
      key?: string;
    }[]
  ) {
    this.uploadedDocs = uploadEv;

    this.documentsForUpload = uploadEv
      .filter(
        doc =>
          doc?.document &&
          doc.description &&
          doc.document.data &&
          doc.document.format
      )
      .map(doc => ({
        filename: doc.description || doc.description,
        format: doc.document.format,
        data: doc.document.data.includes(',')
          ? doc.document.data.split(',')[1]
          : doc.document.data,
        docCode: doc.key || '',
        docName: doc.description || doc.description,
      }));

    const requiredDocSpecs = this.requiredDocuments.filter(
      doc => doc.required === true
    );

    this.uploadedDocsAreValid =
      requiredDocSpecs.length === 0 ||
      requiredDocSpecs.every(requiredDocSpec => {
        const uploadedDoc = uploadEv.find(
          doc => doc.key === requiredDocSpec.key
        );
        return !!(
          uploadedDoc?.description ||
          uploadedDoc?.file ||
          uploadedDoc?.document?.data
        );
      });

    this.documents.clear();
    for (let i = 0; i < uploadEv.length; i++) {
      const upload = uploadEv[i];
      if (!upload.document.data || !upload.file) break;
      this.addDocument(
        upload.description,
        upload.document.data,
        upload.document.format,
        upload.document.filename
      );
    }

    this.validationChange.emit(uploadEv);
  }

  addDocument(
    filename: string,
    base64data: string,
    fileextension: string,
    docCode: string
  ): void {
    const data = this.cardIssuanceService.removeBase64Prefix(base64data);
    if (!data) return;
    this.documents.push(
      this.fb.group({
        Filename: [filename, Validators.required],
        Format: [fileextension, Validators.required],
        data: [data, Validators.required],
        docCode: [docCode, Validators.required],
      })
    );
  }

  triggerDocumentsUpload() {
    const apiCall: Observable<DocumentsUploadResponseT> =
      this.cardIssuanceApisService.uploadIssuanceDocs({
        Country: this.customerData.preferredAddress.countryCode,
        Cif: this.customerData.cif,
        documents: this.documents.value,
        Service: 'Blob',
        ticketNumber: String(this.activeTicketNumber),
      });
    this.cardIssuanceService.callApi(apiCall, this.confirmDocumentsUpload);
  }

  confirmDocumentsUpload = (
    isSuccess: boolean,
    response: DocumentsUploadResponseT
  ) => {
    if (isSuccess) {
      const apiCall = this.cardIssuanceApisService.submitTransactionDocumentsV3(
        this.activeTicketNumber,
        this.activeActionFlow,
        {
          documentIds: response.responseObject.map(doc => doc.id),
        }
      );
      this.cardIssuanceService.callApi(apiCall, this.confirmUploadResponse);
    }
  };

  confirmUploadResponse = (isSuccess: boolean, response: any) => {
    if (isSuccess) {
      this.goToSuccess();
    }
  };
  goToSuccess() {
    this.router
      .navigate(['/services/card-issuance/success'], {
        state: { resolve: false },
      })
      .then(r => {});
  }

  processDocumentsForSubmission() {
    if (!this.uploadedDocsAreValid) {
      this.toastService.show(
        null,
        'Please upload all required documents',
        MessageBoxType.WARNING,
        5000,
        undefined,
        undefined,
        false
      );
      return;
    }

    if (this.documentsForUpload.length === 0) {
      const hasRequiredDocs = this.requiredDocuments.some(doc => doc.required);
      if (hasRequiredDocs) {
        this.toastService.show(
          null,
          'No documents to upload',
          MessageBoxType.WARNING,
          5000,
          undefined,
          undefined,
          false
        );
        return;
      } else {
        this.documentsProcessed.emit();
        return;
      }
    }

    const basePayload = {
      processName: 'Customer Onboarding',
      processId: 'Customer Onboarding',
      CIF: this.customerData?.cif || '',
      branch: this.session?.user?.branchid,
      country: this.session?.subsidiary?.countryCode,
      ticketNumber: String(this.runningTaskId),
      idType: 'NationalId',
      idNumber: this.customerData?.prefDocumentID || '',
      accountNumber: this.activeAccountNumber || '',
    };

    const documentsPayload = {
      ...basePayload,
      Service: 'Blob',
      documents: this.documentsForUpload,
    };

    this.uploadDocuments(documentsPayload);
  }

  private uploadDocuments(documentsPayload: any) {
    const upload =
      documentsPayload.documents.length > 0
        ? this.accountService.uploadTransactionDocumentsV3(
            documentsPayload,
            'cardIssuance'
          )
        : of({ successful: true });

    upload.subscribe({
      next: response => {
        if (this.issuanceType === 'PREPAID') {
          this.actionTicketsService
            .validateMandateDocuments(
              this.runningTaskId,
              this.runningActionFlow
            )
            .subscribe({
              next: () => {
                this.documentsProcessed.emit();
              },
              error: error => {
                this.toastService.show(
                  null,
                  'Document validation failed',
                  MessageBoxType.DANGER,
                  5000,
                  undefined,
                  undefined,
                  false
                );
              },
            });
        } else {
          this.documentsProcessed.emit();
        }
      },
      error: err => {
        this.toastService.show(
          null,
          err.error?.statusMessage || 'Document upload failed',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          false
        );
      },
    });
  }
}

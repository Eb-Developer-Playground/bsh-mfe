import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { TransactionsService } from '../../../../core/services';
import { AdditionalFieldsComponent } from '../form-sections';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COUNTRY_CODES, REQUIRED_DOCS } from '../../../../shared/static';
import { FIELDS, PROCESSES } from '../../../../shared/static';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { TranslatePipe } from '../../../shared-stubs/translate.pipe';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { DocumentsUploadComponent } from '../../../shared-stubs/documents-upload';

@Component({
  imports: [...COMPAT_IMPORTS, DocumentsUploadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-cash-request192-recall',
  templateUrl: './cash-request192-recall.component.html',
  styleUrls: ['./cash-request192-recall.component.scss'],
})
export class CashRequest192RecallComponent implements OnInit, AfterViewInit, OnDestroy {
  fieldsForm!: UntypedFormGroup;
  actionForm!: UntypedFormGroup;
  formFields: any[] = FIELDS[PROCESSES.RECALL];
  requiredDocs: any[] = REQUIRED_DOCS;
  documents!: any[];
  countryCode!: any;
  isReturnTicket!: boolean;
  submitted!: boolean;
  destroy$: Subject<any> = new Subject<any>();

  @ViewChild('fieldsComp') fieldsComponent!: any;
  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private toast: ToastService,
    private transService: TransactionsService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (!this.transService.ticket) {
      this.toast.show(null, 'Transaction ticket has not been created', MessageBoxType.DANGER);
    }
    this.isReturnTicket = this.transService.ticket.status === 'Returned';
    this.actionForm = this.fb.group({
      action: [null, Validators.required],
      fields: [null, Validators.required],
      comment: [''],
    });
  }

  ngAfterViewInit() {
    this.fieldsForm = this.fieldsComponent.form;
    this.fieldsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(vc => {
      this.actionForm.controls['fields'].patchValue(this.fieldsForm.valid ? true : null);
    });
    this.countryCode = COUNTRY_CODES.find(code => code.bankId === this.transService.ticket.bankId).countryCode;
    const taskData = JSON.parse(this.transService.ticket.taskData);
    this.fieldsForm.patchValue({
      RelatedReferenceNumber: this.isReturnTicket ? taskData?.RelatedRefNumber : taskData?.RelatedReferenceNumber,
      MT103ReferenceNumber: taskData?.MT103ReferenceNumber,
      OriginalMessageDate: taskData?.OriginalMessageDate ? new Date(taskData?.OriginalMessageDate) : null,
      RecieverBIC: taskData?.RecieverBIC,
      RequestType: this.isReturnTicket
        ? taskData?.RequestType
        : this.transService.contextData.selectionForm.recallCancelationType,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.transService.ticket.status === 'New' && !this.submitted) {
      const form = JSON.stringify(this.fieldsForm.value);
      this.transService.updateTicketData(this.transService.ticket.id, { data: form }).subscribe(res => {
        if (res.successful && res.responseObject) {
          this.toast.show(
            '',
            `Saved... Ticket ID: ${this.transService.ticket.id} can be continued`,
            MessageBoxType.SUCCESS
          );
        }
      });
    }
  }

  submit(): void {
    if (!this.fieldsForm.valid) {
      this.toast.show('', 'Please fill in the required fields to proceed', MessageBoxType.INFO);
      return;
    }
    const ticketId = this.transService.ticket.id.toString();
    const documentName = this.translate.instant('COMMON.REQUIRED_DOCUMENTS.CUSTOMER_INSTRUCTIONS');
    const requiredExists = this.documents?.some(doc => doc.documentName === documentName && doc?.uploadedFile);

    if (!requiredExists) {
      this.toast.show(null, `COMMON.ERROR.DOCUMENT_SELECTION`, MessageBoxType.INFO);
      return;
    }

    this.completeSubmission(ticketId);
  }

  completeSubmission(ticketId: any): void {
    const data = {
      Country: this.countryCode,
      ticketNumber: ticketId,
      Service: 'NewGenSwift',
      documents: this.documents
        .map((docs: any) => ({ ...docs.document, filename: docs.documentName }))
        .filter(d => !!d.data),
    };
    this.transService.uploadDocuments(data).subscribe(
      docRes => {
        if (docRes.successful && docRes.responseObject) {
          const docs = docRes.responseObject;
          const isErrorFile = docs.some((doc: any) => !doc.success);
          if (isErrorFile) {
            docs.forEach((doc: any) => {
              if (!doc.success) {
                this.toast.show(
                  null,
                  `Failed to upload ${doc.filename}. Reason: ${doc.message}`,
                  MessageBoxType.DANGER
                );
              }
            });
            return;
          }
          if (this.documents.length > 0) {
            this.toast.show(null, `Documents uploaded successfully!`, MessageBoxType.SUCCESS);
          }
          this.submitTicket(ticketId);
        }
      },
      docErr => console.log(docErr)
    );
  }

  submitTicket(ticketId: any): void {
    this.transService
      .submitTicket(
        ticketId,
        {
          ...this.fieldsForm.value,
          OriginalMessageDate: moment(this.fieldsForm.value.OriginalMessageDate).format('YYYY/MM/DD'),
        },
        'mt192'
      )
      .subscribe(
        res => {
          if (res.successful && res.responseObject) {
            this.submitted = true;
            this.toast.show(
              null,
              `Transaction ticket ${this.transService.ticket.id} submitted to Checker successfully!`,
              MessageBoxType.SUCCESS
            );
            this.clear();
            this.router.navigateByUrl('/dashboard/');
          }
        },
        err => console.log(err)
      );
  }

  clear(): void {
    this.fieldsForm.reset();
    this.actionForm.reset();
    this.documents = [];
  }
}

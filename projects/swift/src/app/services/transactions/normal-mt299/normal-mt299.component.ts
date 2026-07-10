import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { TransactionsService } from '../../../../core/services';
import { AdditionalFieldsComponent } from '../form-sections';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { COUNTRY_CODES, FIELDS, PROCESSES, REQUIRED_DOCS } from '../../../../shared/static';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '../../../shared-stubs/translate.pipe';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { DocumentsUploadComponent } from '../../../shared-stubs/documents-upload';

@Component({
  imports: [...COMPAT_IMPORTS, DocumentsUploadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-normal-mt299',
  templateUrl: './normal-mt299.component.html',
  styleUrls: ['./normal-mt299.component.scss'],
})
export class NormalMt299Component implements OnInit, OnDestroy, AfterViewInit {
  fieldsForm!: UntypedFormGroup;
  actionForm!: UntypedFormGroup;
  formFields: any[] = FIELDS[PROCESSES.NORMAL_MT299];
  documents!: any[];
  requiredDocs: any[] = REQUIRED_DOCS;
  submitted!: boolean;
  isReturnTicket!: boolean;
  destroy$: Subject<any> = new Subject<any>();

  viewType = 'Maker';
  ticket: any;
  taskData: any;
  countryCode = '';

  @ViewChild('fieldsComp') fieldsComponent!: any;
  constructor(
    private fb: UntypedFormBuilder,
    private toast: ToastService,
    private router: Router,
    private transService: TransactionsService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (!this.transService.ticket) {
      this.showToast('', 'Transaction ticket has not been created', MessageBoxType.DANGER);
    }
    this.isReturnTicket = this.transService?.ticket?.status === 'Returned';
    this.actionForm = this.fb.group({
      fields: [null, Validators.required],
      comment: [''],
    });
  }

  ngAfterViewInit() {
    this.fieldsForm = this.fieldsComponent.form;
    this.fieldsForm.valueChanges.subscribe(vc => {
      this.actionForm.controls['fields'].patchValue(this.fieldsForm.valid ? true : null);
    });
    this.ticket = this.transService.ticket;
    this.isReturnTicket = this.ticket.status === 'Returned';
    this.taskData = JSON.parse(this.ticket.taskData);
    this.ticket = {
      ...this.ticket,
      transactionType: this.taskData.TransactionType,
    };
    this.countryCode = COUNTRY_CODES.find(code => code.bankId === this.ticket.bankId).countryCode;
    this.fieldsForm.patchValue({
      TransferType: this.ticket.subject,
      CountryCode: this.countryCode,
      CenterNumber: this.transService.contextData.selectionForm.centerNumber.split(' - ')[1] || '234',
      RecieverBIC: this.taskData?.RecieverBIC,
      RelatedRefNumber: this.taskData?.RelatedRefNumber,
      Field79: this.taskData?.Field79,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
    if (this.transService.ticket.status === 'New' && !this.submitted) {
      const form = JSON.stringify(this.fieldsForm.value);
      this.transService.updateTicketData(this.transService.ticket.id, { data: form }).subscribe(res => {
        if (res.successful && res.responseObject) {
          this.showToast(
            '',
            `Saved... Ticket ID: ${this.transService.ticket.id} can be continued`,
            MessageBoxType.SUCCESS
          );
        }
      });
    }
  }

  submit(): void {
    // console.log(this.fieldsForm.value, this.ticket, this.fieldsForm.valid )
    // //return
    // Object.keys(this.fieldsForm.controls).forEach(key => {
    //     const controlErrors: any = this.fieldsForm.get(key)?.errors;
    //     if (controlErrors != null) {
    //       Object.keys(controlErrors).forEach(keyError => {
    //        console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
    //       });
    //     }
    //   });

    if (!this.fieldsForm.valid) {
      return;
    }
    const ticketId = this.ticket.id.toString();
    const documentName = this.translate.instant('COMMON.REQUIRED_DOCUMENTS.CUSTOMER_INSTRUCTIONS');
    const requiredExists = this.documents?.some(doc => doc.documentName === documentName && doc?.uploadedFile);

    if (!requiredExists) {
      this.toast.show(null, `COMMON.ERROR.DOCUMENT_SELECTION`, MessageBoxType.INFO);
      return;
    }

    this.uploadDocsAndSubmitTicket(ticketId, this.fieldsForm.value);
  }

  clear(): void {
    this.fieldsForm.reset();
    this.actionForm.reset();
    this.documents = [];
  }

  uploadDocsAndSubmitTicket(ticketId: any, formData: any) {
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
          const isErrorFile = docs.some((doc: { success: any }) => !doc.success);

          if (isErrorFile) {
            docs.forEach((doc: { success: any; filename: any; message: any }) => {
              if (!doc.success) {
                this.toast.show('', `Failed to upload ${doc.filename}. Reason: ${doc.message}`, MessageBoxType.DANGER);
              }
            });
            return;
          }

          if (this.documents.length > 0) {
            this.toast.show('', `Documents uploaded successfully!`, MessageBoxType.SUCCESS);
          }
          this.submitTicket(ticketId, formData);
        }
      },
      (docErr: any) => console.log(docErr)
    );
  }

  submitTicket = (ticketId: any, formData: any) => {
    this.transService.submitTicket(ticketId, formData, 'normal-mt299').subscribe(
      res => {
        if (res.successful && res.responseObject) {
          this.submitted = true;
          this.toast.show(
            '',
            `Ticket ${this.ticket.ticketId} submitted to Checker successfully!`,
            MessageBoxType.SUCCESS
          );
          this.clear();
          this.router.navigateByUrl('/dashboard/tickets');
        }
      },
      err => console.log(err)
    );
  };

  showToast(title: string, text: string, type: MessageBoxType): void {
    this.toast.show(title, text, type, 1500);
    this.toast
      .dismissed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});
  }
}

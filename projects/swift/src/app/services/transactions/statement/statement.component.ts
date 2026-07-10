import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { TransactionsService } from '../../../../core/services';
import { AdditionalFieldsComponent } from '../form-sections';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FIELDS, PROCESSES, REQUIRED_DOCS } from '../../../../shared/static';
import moment from 'moment';
import { TranslatePipe } from '../../../shared-stubs/translate.pipe';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { DocumentsUploadComponent } from '../../../shared-stubs/documents-upload';

@Component({
  imports: [...COMPAT_IMPORTS, DocumentsUploadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.scss'],
})
export class StatementComponent implements OnInit, AfterViewInit, OnDestroy {
  fieldsForm!: UntypedFormGroup;
  actionForm!: UntypedFormGroup;
  formFields: any[] = FIELDS[PROCESSES.STATEMENT];
  requiredDocs: any[] = REQUIRED_DOCS;
  documents!: any[];
  isReturnTicket!: boolean;
  submitted!: boolean;
  destroy$: Subject<any> = new Subject<any>();

  @ViewChild('fieldsComp') fieldsComponent!: any;
  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private toast: ToastService,
    private transService: TransactionsService
  ) {}

  ngOnInit(): void {
    if (!this.transService.ticket) {
      this.toast.show('', 'Transaction ticket has not been created', MessageBoxType.DANGER);
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
    const requiredExists =
      true; /*this.documents.some(doc => doc.documentName === 'COMMON.REQUIRED_DOCUMENTS.CUSTOMER_INSTRUCTIONS' && doc?.uploadedFile);*/

    if (!requiredExists) {
      this.toast.show(null, `COMMON.ERROR.DOCUMENT_SELECTION`, MessageBoxType.INFO);
      return;
    }

    this.uploadDocuments(ticketId);
  }

  submitTicket(ticketId: any): void {
    const frequency = this.fieldsForm.get('Frequency')?.value;
    const payload = {
      ...this.fieldsForm.value,
      StartDate: moment(this.fieldsForm.value.StartDate).format('YYYY/MM/DD'),
      EndDate: moment(this.fieldsForm.value.EndDate).format('YYYY/MM/DD'),
      UpdateDelete: 'Update',
      OnetimeRepeat: frequency === '' ? 'Onetime' : 'Repeat',
    };
    this.transService.submitTicket(ticketId, payload, 'statement').subscribe(
      res => {
        if (!res.successful) return this.toast.show('', `Failed to submit statement`, MessageBoxType.DANGER);
        this.submitted = true;
        this.toast.show('', `Statement submitted successfully!`, MessageBoxType.SUCCESS);
        this.clear();
        this.router.navigateByUrl('/dashboard/');
      },
      err => console.log(err)
    );
  }

  uploadDocuments(ticketId: any): void {
    const data = {
      ticketNumber: this.transService.ticket.id.toString(),
      Service: 'NewGenSwift',
      documents: this.documents
        .map((docs: any) => ({ ...docs.document, filename: docs.documentName }))
        .filter(d => !!d.data),
    };

    this.transService.uploadDocuments(data).subscribe(result => {
      if (!result.successful || !result.responseObject) return;
      const docs = result.responseObject;
      const isErrorFile = docs.some((doc: any) => !doc.success);

      if (isErrorFile) {
        return docs.forEach((doc: any) => {
          if (!doc.success) {
            this.toast.show('', `Failed to upload ${doc.filename}. Reason: ${doc.message}`, MessageBoxType.DANGER);
          }
        });
      }
      this.toast.show('', `Documents uploaded successfully!`, MessageBoxType.SUCCESS);
      this.submitTicket(ticketId);
    });
  }

  clear(): void {
    this.fieldsForm.reset();
    this.actionForm.reset();
    this.documents = [];
  }
}

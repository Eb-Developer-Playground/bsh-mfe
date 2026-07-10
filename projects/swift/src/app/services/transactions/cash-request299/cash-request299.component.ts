import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TransactionsService } from '../../../../core/services';
import { SessionService } from '../../../../shared/services';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { AdditionalFieldsComponent, DenominationsComponent } from '../form-sections';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DenominationFormAttributes } from '../../../../core/models/denominations.model';
import { COUNTRY_CODES, FIELDS, PROCESSES, REQUIRED_DOCS } from '../../../../shared/static';
import moment from 'moment';
import { FormFieldBase } from '../../../../shared/dynamic-form';
import { TranslatePipe } from '../../../shared-stubs/translate.pipe';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { DocumentsUploadComponent } from '../../../shared-stubs/documents-upload';

@Component({
  imports: [...COMPAT_IMPORTS, DocumentsUploadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-cash-request299',
  templateUrl: './cash-request299.component.html',
  styleUrls: ['./cash-request299.component.scss'],
})
export class CashRequest299Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('denomComp') denomsComponent!: DenominationsComponent;
  title: string = 'Cash Request 299';
  fieldsForm!: UntypedFormGroup;
  actionForm!: UntypedFormGroup;
  documents!: any[];
  requiredDocs: any[] = REQUIRED_DOCS;
  submitted!: boolean;
  isReturnTicket!: boolean;
  countryCode!: any;
  denominations!: DenominationFormAttributes[];
  managedBy!: any[];
  denominationsValue!: any;
  managedByValue!: any;
  fields!: any[];

  destroy$: Subject<any> = new Subject<any>();

  @ViewChild('fieldsComp') fieldsComponent!: any;
  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private toast: ToastService,
    public transService: TransactionsService,
    private cdref: ChangeDetectorRef,
    private session: SessionService,
    private translate: TranslateService
  ) {
    this.fields = this.setFormFields();
  }

  ngOnInit(): void {
    if (!this.transService.ticket) {
      this.showToast('', 'Transaction ticket has not been created', MessageBoxType.DANGER);
    }
    this.actionForm = this.fb.group({
      action: [null, Validators.required],
      comment: [''],
      fields: [null, Validators.required],
    });
  }

  ngAfterViewInit() {
    this.fieldsForm = this.fieldsComponent.form;
    this.fieldsForm.addControl('Denominations', this.fb.array([]));
    this.fieldsForm.addControl('ManagedBy', this.fb.array([]));
    this.fieldsForm.valueChanges.subscribe(vc => {
      this.actionForm.controls['fields'].patchValue(this.fieldsForm.valid ? true : null);
    });
    let ticket = this.transService?.ticket;
    const taskData = JSON.parse(ticket?.taskData);
    this.isReturnTicket = ticket?.status === 'Returned';
    this.transService.ticket = {
      ...this.transService.ticket,
      transactionType: taskData.TransactionType,
    };
    this.countryCode = COUNTRY_CODES.find(code => code.bankId === ticket.bankId).countryCode;
    this.title = `${this.title} ${this.countryCode}`;
    this.fieldsForm.patchValue({
      CenterNumber: this.transService.contextData.selectionForm.centerNumber.split(' - ')[1],
      CenterName: this.transService.contextData.selectionForm.centerNumber.split(' - ')[0],
      Currency: this.countryCode === 'KE' ? 'KES' : 'UGX',
      TransferType: this.transService.contextData.selectionForm.transferType,
      TransactionType: this.transService.contextData.selectionForm.transactionType,
      CountryCode: this.countryCode,
    });

    if (this.isReturnTicket || this.transService.ticket.status === 'New') {
      if (this.isReturnTicket) this.fieldsForm.patchValue(taskData);

      this.fieldsForm.patchValue({
        ValueDate: taskData?.ValueDate ? new Date(taskData.ValueDate).toISOString() : null,
        TransactionDate: taskData?.TransactionDate ? new Date(taskData.TransactionDate).toISOString() : null,
      });

      this.denominationsValue = taskData.Denominations;
      this.managedByValue = taskData.ManagedBy;
    }
    this.cdref.detectChanges();
    // this.getDenominations(this.countryCode, this.transService.ticket.transactionType);
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
    if (this.transService.ticket?.status === 'New' && !this.submitted) {
      const form = JSON.stringify({
        ...this.fieldsForm.getRawValue(),
        Denominations: this.denominations,
        ManagedBy: this.managedBy,
      });
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
    // Object.keys(this.fieldsForm.controls).forEach(key => {
    //     const controlErrors: any = this.fieldsForm.get(key)?.errors;
    //     if (controlErrors != null) {
    //       Object.keys(controlErrors).forEach(keyError => {
    //        console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
    //       });
    //     }
    //   });

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

  completeSubmission(ticketId: any) {
    const data = {
      Country: this.countryCode,
      ticketNumber: ticketId,
      Service: 'NewGenSwift',
      documents: this.documents
        .map((docs: any) => ({ ...docs.document, filename: docs.documentName }))
        .filter(d => !!d.data),
    };

    this.transService.uploadDocuments(data).subscribe(
      (docRes: { successful: any; responseObject: any }) => {
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
          this.submitTicket(ticketId);
        }
      },
      (docErr: any) => {}
    );
  }

  submitTicket(ticketId: any) {
    const formData = {
      ...this.fieldsForm.getRawValue(),
      TransactionDate: moment(this.fieldsForm.value.TransactionDate).format('YYYY/MM/DD'),
      ValueDate: moment(this.fieldsForm.value.ValueDate).format('YYYY/MM/DD'),
      Denominations: this.denominations.map(denomination => {
        return {
          ...denomination,
          DenominationValue: denomination['DenominationValue']?.toString() ?? '',
        };
      }),
      ManagedBy: this.managedBy,
    };

    this.transService.submitTicket(ticketId, formData, 'mt299').subscribe(
      res => {
        if (res.successful && res.responseObject) {
          this.submitted = true;
          this.toast.show(
            '',
            `Ticket ${this.transService.ticket.id} submitted to Checker successfully!`,
            MessageBoxType.SUCCESS
          );
          this.router.navigateByUrl('/dashboard/');
        }
      },
      err => {}
    );
  }

  clear(): void {
    this.fieldsForm.reset();
    this.actionForm.reset();
    this.documents = [];
  }

  showToast(title: string, text: string, type: MessageBoxType): void {
    this.toast.show(title, text, type, 1500);
    this.toast
      .dismissed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});
  }

  private setFormFields(): any[] {
    if (this.session.user.bankId === '54') {
      return FIELDS[PROCESSES.CASH_REQUEST_299].filter(
        (ff: FormFieldBase<any>) => !['TransactionDate', 'TransactionReference'].includes(ff.key)
      );
    }
    return FIELDS[PROCESSES.CASH_REQUEST_299];
  }
}

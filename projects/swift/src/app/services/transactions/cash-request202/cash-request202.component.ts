import { Component, OnDestroy, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TransactionsService } from '../../../../core/services';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AdditionalFieldsComponent } from '../form-sections';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COUNTRY_CODES, FIELDS, PROCESSES, REQUIRED_DOCS } from '../../../../shared/static';
import { logFormErrors } from '../../../../shared/utils';
const dropdownData: any = {};
import moment from 'moment';
import { TranslatePipe } from '../../../shared-stubs/translate.pipe';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { DocumentsUploadComponent } from '../../../shared-stubs/documents-upload';

@Component({
  imports: [...COMPAT_IMPORTS, DocumentsUploadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-cash-request202',
  templateUrl: './cash-request202.component.html',
  styleUrls: ['./cash-request202.component.scss'],
})
export class CashRequest202Component implements OnInit, OnDestroy {
  fields!: any[];
  documents!: any[];
  requiredDocuments: any[] = REQUIRED_DOCS;
  fieldsForm!: UntypedFormGroup;
  actionForm!: UntypedFormGroup;
  destroy$: Subject<any> = new Subject<any>();

  ticket: any;
  taskData: any;
  isReturnTicket: boolean = false;
  countryCode: string = '';
  dropdownData = dropdownData.responseObject;
  remittanceCurrencies: any;
  submitted: boolean = false;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transService: TransactionsService,
    private toast: ToastService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (!this.transService.ticket) {
      this.showToast(null, 'Transaction ticket has not been created', MessageBoxType.DANGER);
    }
    this.actionForm = this.fb.group({
      action: [null, Validators.required],
      comment: [''],
      fields: [null, Validators.required],
    });
    this.countryCode = COUNTRY_CODES.find(code => code.bankId === this.transService.ticket.bankId).countryCode;
    this.setDynamicFields();
  }

  onFormReady(form: UntypedFormGroup) {
    this.fieldsForm = form;
    this.fieldsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(vc => {
      // logFormErrors(this.fieldsForm, 'MT202');
      this.actionForm.patchValue({
        fields: this.fieldsForm.valid ? true : null,
      });
    });
    this.getTicket();
  }

  getTicket() {
    this.ticket = this.transService.ticket;
    if (this.ticket.status === 'Returned') this.isReturnTicket = true;
    this.taskData = JSON.parse(this.ticket.taskData);
    this.ticket = {
      ...this.ticket,
      transactionType: this.taskData.TransactionType,
    };
    this.countryCode = COUNTRY_CODES.find(code => code.bankId === this.ticket.bankId).countryCode;
    this.remittanceCurrencies = this.dropdownData.remittanceCurrencies.filter(
      (currency: { countryCode: string }) => currency.countryCode === this.countryCode
    );
    this.fieldsForm.patchValue({
      ReceiverBIC: this.taskData?.ReceiverBIC,
      RelatedRefNumber: this.taskData?.RelatedRefNumber,
      Amount: this.taskData?.Amount,
      Currency: this.taskData?.Currency,
      CountryCode: this.countryCode,
      ValueDate: this.taskData?.ValueDate ? new Date(this.taskData?.ValueDate) : null,
    });
  }

  submit(): void {
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

    this.completeSubmission(ticketId);
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
    if (this.transService.ticket.status === 'New' && !this.submitted) {
      const form = JSON.stringify(this.fieldsForm.value);
      this.transService.updateTicketData(this.transService.ticket.id, { data: form }).subscribe(res => {
        if (res.successful && res.responseObject) {
          this.showToast(
            null,
            `Saved... Ticket ID: ${this.transService.ticket.id} can be continued`,
            MessageBoxType.SUCCESS
          );
        }
      });
    }
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

    this.transService.uploadDocuments(data).subscribe(docRes => {
      if (docRes.successful && docRes.responseObject) {
        const docs = docRes.responseObject;
        const isErrorFile = docs.some((doc: { success: any }) => !doc.success);

        if (isErrorFile) {
          docs.forEach((doc: { success: any; filename: any; message: any }) => {
            if (!doc.success) {
              this.showToast('', `Failed to upload ${doc.filename}. Reason: ${doc.message}`, MessageBoxType.DANGER);
            }
          });
          return;
        }
        if (this.documents.length > 0) {
          this.showToast('', `Documents uploaded successfully!`, MessageBoxType.SUCCESS);
        }
        this.submitTicket(ticketId);
      }
    });
  }

  submitTicket(ticketId: any): void {
    const formData = {
      ...this.fieldsForm.value,
      CountryCode: this.countryCode,
      Amount: this.fieldsForm.value.Amount.toString(),
      ValueDate: moment(this.fieldsForm.value.ValueDate).format('YYYY/MM/DD'),
    };
    this.transService.submitTicket(ticketId, formData, 'mt202').subscribe(
      res => {
        if (res.successful && res.responseObject) {
          this.submitted = true;
          this.showToast(
            null,
            `Transaction ticket ${this.ticket.ticketId} submitted to Checker successfully!`,
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

  showToast(title: string | null, text: string, type: MessageBoxType): void {
    this.toast.show(title, text, type, 1500);
    this.toast
      .dismissed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});
  }

  /**
   * init form fields and overwrite the harcoded dropdown options from currency
   */
  private setDynamicFields() {
    const fields: any[] = FIELDS[PROCESSES.CASH_REQUEST_202];
    this.transService.getDropdownData('SWIFT').subscribe(
      (res: any) => {
        if (res?.responseObject?.remittanceCurrencies) {
          let currenciesField = fields.find(field => field.key === 'Currency');
          if (currenciesField?.options) {
            currenciesField.options = res?.responseObject?.remittanceCurrencies
              .filter((currency: { countryCode: string }) => currency.countryCode === this.countryCode)
              .map((currency: { currencyCode: string; countryCode: string }) => {
                return {
                  label: currency.currencyCode,
                  value: currency.currencyCode,
                };
              });
          }
        }
        this.fields = fields;
      },
      error => {
        /**still show the form field if finacle not response */
        this.fields = fields;
      }
    );
  }
}

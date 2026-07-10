import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { TransactionsService } from '../../../../core/services';
import { FIELD_TYPES } from '../../../../shared/dynamic-form';
import { AdditionalFieldsComponent } from '../form-sections';
import { TranslatePipe } from '../../../shared-stubs/translate.pipe';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { DocumentsUploadComponent } from '../../../shared-stubs/documents-upload';

@Component({
  imports: [...COMPAT_IMPORTS, DocumentsUploadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-statement-cancellation',
  templateUrl: './statement-cancellation.component.html',
  styleUrls: ['./statement-cancellation.component.scss'],
})
export class StatementCancellationComponent implements OnInit, AfterViewInit, OnDestroy {
  fieldsForm!: UntypedFormGroup;
  actionForm!: UntypedFormGroup;
  formFields: any[] = [
    {
      id: 1,
      order: 1,
      key: 'AccountNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'Account Number',
      value: '',
      required: true,
    },
    {
      id: 2,
      order: 2,
      key: 'StartDate',
      field_type: FIELD_TYPES.DATETIME,
      label: 'Effective Date Of Cancellation',
      value: '',
      required: true,
    },
  ];
  requiredDocs: any[] = [];
  documents!: any[];
  submitted!: boolean;

  @ViewChild('fieldsComp') fieldsComponent!: any;
  constructor(
    private fb: UntypedFormBuilder,
    private toast: ToastService,
    private transService: TransactionsService
  ) {}

  ngOnInit(): void {
    if (!this.transService.ticket) {
      this.toast.show('', 'Transaction ticket has not been created', MessageBoxType.DANGER);
    }
    this.actionForm = this.fb.group({
      action: [null, Validators.required],
      fields: [null, Validators.required],
      comment: [''],
    });
  }

  ngAfterViewInit() {
    this.fieldsForm = this.fieldsComponent.form;
    this.fieldsForm.valueChanges.subscribe(vc => {
      this.actionForm.controls['fields'].patchValue(this.fieldsForm.valid ? true : null);
    });
  }

  ngOnDestroy(): void {
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
    if (!this.documents?.length && this.transService.ticket.status === 'Returned') {
      return this.submitStatement();
    }
    this.uploadDocuments();
  }

  submitStatement(): void {
    //
  }

  uploadDocuments(): void {
    //
  }
}

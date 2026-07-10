import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AdditionalFieldsComponent } from '../form-sections';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { TransactionsService } from '../../../../core/services';
import { FIELD_TYPES } from '../../../../shared/dynamic-form';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { DocumentsUploadComponent } from '../../../shared-stubs/documents-upload';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.scss'],
  imports: [...COMPAT_IMPORTS, DocumentsUploadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BulkUploadComponent implements OnInit {
  fieldsForm!: UntypedFormGroup;
  actionForm!: UntypedFormGroup;
  formFields: any[] = [
    {
      id: 1,
      order: 1,
      key: 'TransactionNarration',
      field_type: FIELD_TYPES.PARAGRAPH,
      label: 'Transaction Narration',
      value: '',
      required: true,
    },
  ];
  documents!: any[];

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

  submit(): void {
    //
  }
}

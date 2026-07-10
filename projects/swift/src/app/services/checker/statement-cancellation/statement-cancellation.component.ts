import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TransactionsService } from '../../../../core/services';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { TransactionsStatusType, TransactionsUpdateTicketPayload } from '../../../../core/models/transactions.model';
import { REQUIRED_DOCS } from '../../../../shared/static';
import { FIELD_TYPES } from '../../../../shared/dynamic-form';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  imports: [...COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-checker-statement-cancellation',
  templateUrl: './statement-cancellation.component.html',
  styleUrls: ['./statement-cancellation.component.scss'],
})
export class StatementCancellationComponent implements OnInit {
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
  data!: any;
  documents!: any[];
  requiredDocuments: any[] = REQUIRED_DOCS;
  fieldsForm!: UntypedFormGroup;
  actionForm!: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private transService: TransactionsService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.data = JSON.parse(this.transService.ticket.taskData);
    this.actionForm = this.fb.group({
      action: [null, Validators.required],
      comment: [''],
    });
    this.getDocuments();
  }

  getValue(k: string): string {
    return this.data[k] || '---';
  }

  submit(): void {
    const ticketId = this.transService.ticket.id.toString();
    const payload: TransactionsUpdateTicketPayload = {
      ticketId,
      stage: 'OMNI_CHECKER', // mandatory by NewGen so pass any string
      status: this.actionForm.controls['action'].value, // "submit", "refer back", "reject"
      performedBy: 'hsahkl', // mandatory if you send comment
      comments: this.actionForm.controls['comment'].value, // optional
    };

    this.transService.submitTicketToNewGen(payload).subscribe((res: any) => {
        if (res.successful) {
          switch (payload['status']) {
            case TransactionsStatusType.SUBMIT:
              this.toast.show(
                'Success',
                `Ticket ${ticketId} submitted to NewGen successfully!`,
                MessageBoxType.SUCCESS
              );
              break;
            case TransactionsStatusType.RETURN:
              this.toast.show('Success', `Ticket ${ticketId} returned to Branch Maker!`, MessageBoxType.SUCCESS);
              break;
            case TransactionsStatusType.REJECT:
              this.toast.show('Success', `Ticket ${ticketId} rejected by Branch Checker!`, MessageBoxType.WARNING);
              break;

            default:
              break;
          }
        }
        this.router.navigateByUrl('/dashboard/tickets');
      },
      error => {}
    );
  }

  getDocuments(): void {
    const data = {
      ticketNumber: this.transService.ticket.id.toString(),
      service: 'NewGen',
      Cif: '', // this.data.PersonalDetails.CustomerId || this.data.personalDetails.CustomerId
    };
    this.transService.getTicketDocs(data).subscribe(
      (res: { responseObject: any }) => {
        this.documents = res.responseObject;
      },
      (err: any) => console.log(err)
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { SessionService } from '../../../../shared/services';
import { TransactionsService } from '../../../../core/services';
import { FIELDS, PROCESSES, REQUIRED_DOCS } from '../../../../shared/static';
import { TransactionsStatusType, TransactionsUpdateTicketPayload } from '../../../../core/models/transactions.model';
import { FormFieldBase } from '../../../../shared/dynamic-form';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  imports: [...COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-cash-request-299',
  templateUrl: './cash-request-299.component.html',
  styleUrls: ['./cash-request-299.component.scss'],
})
export class CashRequest299Component implements OnInit {
  data!: any;
  documents!: any[];
  requiredDocs: any[] = REQUIRED_DOCS;
  fieldsForm!: UntypedFormGroup;
  actionForm!: UntypedFormGroup;
  denominationsInfo!: any;

  get fields(): any[] {
    if (this.session.user.bankId === '54') {
      return FIELDS[PROCESSES.CASH_REQUEST_299].filter(
        (ff: FormFieldBase<any>) => !['TransactionDate', 'TransactionReference'].includes(ff.key)
      );
    }
    return FIELDS[PROCESSES.CASH_REQUEST_299];
  }

  constructor(
    private fb: UntypedFormBuilder,
    private session: SessionService,
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

    this.denominationsInfo = {
      country: this.data.CountryCode,
      denominations: this.data.Denominations.map((d: any) => {
        return { ...d, DenominationName: d.DenominationName };
      }),
      transactionType: this.data.TransactionType,
      managedBy: this.data.ManagedBy,
    };
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

    this.transService.submitTicketToNewGen(payload).subscribe(
      (res: any) => {
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

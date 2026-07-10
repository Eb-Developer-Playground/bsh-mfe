import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { TransactionsService } from '../../../../core/services';
import { AccountService, SessionService } from '../../../../shared/services';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { TransactionsStatusType, TransactionsUpdateTicketPayload } from '../../../../core/models/transactions.model';
import { FIELDS, PROCESSES, REQUIRED_DOCS } from '../../../../shared/static';
import { MatDialog } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  imports: [...COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-checker-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.scss'],
})
export class StatementComponent implements OnInit {
  fields: any[] = FIELDS[PROCESSES.STATEMENT];
  data!: any;
  documents!: any[];
  requiredDocuments: any[] = REQUIRED_DOCS;
  fieldsForm!: UntypedFormGroup;
  actionForm!: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private session: SessionService,
    private accService: AccountService,
    private domSanitizer: DomSanitizer,
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
        this.router.navigateByUrl('/dashboard/');
      },
      error => {}
    );
  }

  getValue(k: string): string {
    return this.data[k] || '';
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { TransactionsService } from '../../../../core/services';
import { FIELDS, PROCESSES, REQUIRED_DOCS } from '../../../../shared/static';
import { TransactionsStatusType, TransactionsUpdateTicketPayload } from '../../../../core/models/transactions.model';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  imports: [...COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-normal-mt299',
  templateUrl: './normal-mt299.component.html',
  styleUrls: ['./normal-mt299.component.scss'],
})
export class NormalMt299Component implements OnInit {
  formFields: any[] = FIELDS[PROCESSES.NORMAL_MT299];
  actionForm!: UntypedFormGroup;
  data!: any;
  requiredDocs: any[] = REQUIRED_DOCS;
  documents!: any[];

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

  getValue(k: string): string {
    return this.data[k] || 'N/A';
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

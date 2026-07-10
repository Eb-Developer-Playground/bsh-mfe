import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
} from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Ticket, TicketStatusForm } from '../../../core/services/ticket/models';
import { TicketService } from '../../../core/services/ticket/tickets.service';
import { FormNames } from '../../models';
import { MessageBoxType, ToastService } from '../../modules/toast';

@Component({
  selector: 'app-approval-form',
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './approval-form.component.html',
  styleUrls: ['./approval-form.component.scss'],
})
export class ApprovalFormComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  form!: UntypedFormGroup;
  forms: any;
  notes: Array<any> = [];
  @Output() isFormValid: EventEmitter<any> = new EventEmitter();
  destroySubject$ = new Subject();
  @Input() ticket: Ticket | any;
  @Input() horizontalView = false;
  @Input() statusOptions = [
    {
      value: 'submit',
      description: 'Approve',
    },
    {
      value: 'refer back',
      description: 'Return',
    },
    {
      value: 'reject',
      description: 'Reject',
    },
  ];

  @Input() ticketType: any;

  constructor(
    private fb: UntypedFormBuilder,
    private ticketsService: TicketService,
    private toastService: ToastService
  ) {
    this.forms = this.fb.group({
      status: ['', [Validators.required]],
      comments: ['', [Validators.required]],
    });
  }
  ngAfterViewInit(): void {
    const comments = this.forms.controls.comments;
    if (!this.horizontalView) {
      comments.clearValidators();
      //comments.addValidators([Validators.required]);
      this.forms.updateValueAndValidity();
    }
    this.checkFormValidity();
  }

  ngOnChanges() {
    this.notes = this.ticket?.taskNotes;
  }

  ngOnDestroy(): void {
    if (this.horizontalView) {
      this.submitComment();
    }

    this.destroySubject$.next('');
    this.destroySubject$.complete();
  }

  checkFormValidity() {
    this.forms.statusChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((status: string) => {
        const form: TicketStatusForm = {
          formName: FormNames.APPROVAL,
          values: this.forms.value,
          valid: status === 'VALID',
        };
        if (this.horizontalView && status === 'VALID') {
          this.isFormValid.next(form);
        } else if (this.notes?.length > 0) {
          this.isFormValid.next(form);
        }
      });
  }

  clear = () =>
    this.forms?.patchValue({
      status: '',
      comment: '',
    });

  submitComment = () => {
    const note = this.forms.get('comments').value;
    if (!note) return;
    const form: TicketStatusForm = {
      formName: FormNames.APPROVAL,
      values: this.forms.value,
      valid: this.forms.valid && note.length > 0,
    };
    this.isFormValid.next(form);

    const details = {
      note,
      author: 'you',
      createdOnUtc: moment.utc(),
    };
    this.forms.get('comments').setValue('');
    this.ticketsService
      .addTicketNote(this.ticket?.id, { note })
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((res: any) => {
        if (res.successful) {
          this.toastService.show(
            'Note added successfully!',
            '',
            MessageBoxType.SUCCESS,
            5000,
            undefined,
            undefined,
            false
          );
          this.notes.push(details);
          this.forms.get('comments').setValue('');
        }
      });
  };
}

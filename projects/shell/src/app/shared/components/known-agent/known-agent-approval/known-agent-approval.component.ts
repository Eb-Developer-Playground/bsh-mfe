import { Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentFormObj, FormNames } from 'src/app/shared/models';
import { ApprovalStatus } from 'src/app/shared/models/common/ticket.model';

@Component({
  selector: 'app-known-agent-approval',
  templateUrl: './known-agent-approval.component.html',
  styleUrls: ['./known-agent-approval.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class KnownAgentApprovalComponent implements OnInit, OnDestroy {
  @Output() isApprovalFormValid: EventEmitter<any> = new EventEmitter();

  approvalForm!: UntypedFormGroup;
  private destroySubject$ = new Subject();

  approvalOptions: any[] = [
    {
      code: ApprovalStatus.APPROVE,
      description: ApprovalStatus.APPROVE,
    },
    {
      code: ApprovalStatus.RETURN,
      description: ApprovalStatus.RETURN,
    },
    {
      code: ApprovalStatus.REJECT,
      description: ApprovalStatus.REJECT,
    },
  ];
  constructor(private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.approvalForm = this.fb.group({
      approvalStatus: ['', [Validators.required]],
      commentSection: ['', [Validators.maxLength(100), Validators.required]],
    });

    this.approvalForm.statusChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(status => {
        const formObj: AgentFormObj = {
          formName: FormNames.APPROVAL,
          values: this.approvalForm.value,
          valid: status === 'VALID',
        };
        this.isApprovalFormValid.next(formObj);
      });
  }

  ngOnDestroy(): void {
    this.destroySubject$.next('');
    this.destroySubject$.complete();
  }
}

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

@Component({
  selector: 'app-change-of-signature-approval',
  templateUrl: './change-of-signature-approval.component.html',
  styleUrls: ['./change-of-signature-approval.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class ChangeOfSignatureApprovalComponent implements OnInit, OnDestroy {
  @Output() isApprovalFormValid: EventEmitter<any> = new EventEmitter();

  approvalForm!: UntypedFormGroup;
  private destroySubject$ = new Subject();

  approvalOptions: any[] = [
    {
      code: 1,
      description: 'Approve',
    },
    {
      code: 2,
      description: 'Return',
    },
    {
      code: 3,
      description: 'Reject',
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

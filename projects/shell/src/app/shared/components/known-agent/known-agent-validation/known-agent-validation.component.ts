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
  selector: 'app-known-agent-validation',
  templateUrl: './known-agent-validation.component.html',
  styleUrls: ['./known-agent-validation.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class KnownAgentValidationComponent implements OnInit, OnDestroy {
  @Output() isValidationFormValid: EventEmitter<any> = new EventEmitter();

  validationForm!: UntypedFormGroup;

  minDate: Date;
  private destroySubject$ = new Subject();

  constructor(private fb: UntypedFormBuilder) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.validationForm = this.fb.group({
      customer: ['', [Validators.maxLength(100), Validators.required]],
      dateOfCall: ['', [Validators.required]],
      time: ['', [(Validators.maxLength(100), Validators.required)]],
      customerMobileNumber: [
        '',
        [(Validators.maxLength(100), Validators.required)],
      ],
    });

    this.validationForm.statusChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(status => {
        const formObj: AgentFormObj = {
          formName: FormNames.VALIDATION,
          values: this.validationForm.value,
          valid: status === 'VALID',
        };
        this.isValidationFormValid.next(formObj);
      });
  }

  ngOnDestroy(): void {
    this.destroySubject$.next('');
    this.destroySubject$.complete();
  }
}

import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentFormObj, FormNames } from 'src/app/shared/models';

@Component({
  selector: 'app-known-agent-high-risk-details',
  templateUrl: './known-agent-high-risk-details.component.html',
  styleUrls: ['./known-agent-high-risk-details.component.scss'],
})
export class KnownAgentHighRiskDetailsComponent implements OnInit, OnDestroy {
  @Output() isHighRiskFormValid: EventEmitter<any> = new EventEmitter();

  highRiskForm!: UntypedFormGroup;
  private destroySubject$ = new Subject();

  highRiskOptions: any[] = [
    {
      code: 1,
      description: 'PEP',
    },
    {
      code: 2,
      description: 'Risk 1',
    },
    {
      code: 3,
      description: 'Risk 2',
    },
  ];
  constructor(private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.highRiskForm = this.fb.group({
      highRiskIndividual: [
        '',
        [Validators.maxLength(100), Validators.required],
      ],
      highRiskType: ['', [Validators.required]],
    });

    this.highRiskForm.statusChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(status => {
        const formObj: AgentFormObj = {
          formName: FormNames.HIGHRISK,
          values: this.highRiskForm.value,
          valid: status === 'VALID',
        };
        this.isHighRiskFormValid.next(formObj);
      });
  }

  ngOnDestroy(): void {
    this.destroySubject$.next('');
    this.destroySubject$.complete();
  }
}

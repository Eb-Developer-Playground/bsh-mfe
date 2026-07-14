import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, OnDestroy, Input } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentFormObj } from '@app/shared/models';
import { FormNames } from '@app/shared/models/agent.model';


@Component({
  selector: 'app-known-agent-limits',
  templateUrl: './known-agent-limits.component.html',
  styleUrls: ['./known-agent-limits.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    TranslatePipe,
    CurrencyMaskModule,
    DecimalPipe,
  ],
})
export class KnownAgentLimitsComponent implements OnInit, OnDestroy {

  limitForm!: UntypedFormGroup;
  limitMaxValue = 500000;
  limitMinValue = 100;
  @Input() limit: string = '';
  @Input() edit = true;
  @Output() isLimitFormValid: EventEmitter<any> = new EventEmitter();

  private destroySubject$ = new Subject();

  constructor(private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.limitForm = this.fb.group({
      limit: [
        null,
        [
          Validators.required /*, Validators.max(this.limitMaxValue)*/,
          Validators.min(this.limitMinValue),
        ],
      ],
    });

    this.listenFormStatus();
    this.setInitFormValue();

  }

  setInitFormValue() {
    if (this.limit) {
      this.limitForm.patchValue({
        limit: this.limit,
      });
    }
  }


  listenFormStatus() {
    this.limitForm.statusChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(status => {
        const formObj: AgentFormObj = {
          formName: FormNames.LIMITS,
          values: this.limitForm.value,
          valid: status === 'VALID',
        };
        this.isLimitFormValid.next(formObj);
      });
  }

  ngOnDestroy(): void {
    this.destroySubject$.next('');
    this.destroySubject$.complete();
  }
}

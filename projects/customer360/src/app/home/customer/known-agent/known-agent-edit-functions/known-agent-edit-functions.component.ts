import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentFormObj, FormNames } from '@app/shared/models/agent.model';
import { IKnownAgentFunctions } from '../models/known-agent.models';

@Component({
  selector: 'app-known-agent-edit-functions',
  templateUrl: './known-agent-edit-functions.component.html',
  styleUrls: ['./known-agent-edit-functions.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatDividerModule,
    TranslatePipe,
  ],
})
export class KnownAgentEditFunctionsComponent implements OnInit, OnDestroy {
  @Output() isFunctionFormValid: EventEmitter<any> = new EventEmitter();
  functionsForm!: UntypedFormGroup;
  effectiveDate: Date = new Date();
  today: Date = new Date();

  @Input() functionsArray: IKnownAgentFunctions[] = [];
  @Input() edit = true;
  @Input() isBshFunction = false;
  functionsAssignedArray: IKnownAgentFunctions[] = [];

  private destroySubject$ = new Subject();

  constructor(private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.functionsAssignedArray = this.functionsArray.filter(
      _fn => _fn.selected
    );

    this.functionsForm = this.fb.group({
      effectiveDate: [this.effectiveDate]
    });
    this.functionsArray.forEach(_function => {
      this.functionsForm.addControl(
        _function.name,
        this.fb.control(_function.selected, []),
      );
    });

    this.functionsForm.statusChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(status => {
        // if select a function and then unselect all the functions the valid true;
        // with this fix about that error
        const selectedFunction = Object.entries(this.functionsForm.value).some(
          ([key, value]) => value === true
        );

        const formObj: AgentFormObj = {
          formName: FormNames.FUNCTIONS,
          values: this.functionsForm.value,
          valid: (status === 'VALID' && selectedFunction) || false,
        };

        this.isFunctionFormValid.next(formObj);
      });
      
  }
  ngOnDestroy(): void {
    this.destroySubject$.next('');
    this.destroySubject$.complete();
  }
}

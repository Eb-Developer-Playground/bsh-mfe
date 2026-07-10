import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentFormObj, FormNames } from '@app/shared/models';
import { IknownAgentDetails } from '@app/shared/models/common/knownAgent.model';
import { validateKraPin } from '../../../directives/kra-pin-validator.directive';
import { ValidateFields } from '../../../validators';
import { SessionService } from '@app/shared/services';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-known-agent-details',
  templateUrl: './known-agent-details.component.html',
  styleUrls: ['./known-agent-details.component.scss'],
})
export class KnownAgentDetailsComponent implements OnInit, OnDestroy {
  @Input() knownAgentDetails!: IknownAgentDetails;
  @Input() editAgentNames = false;
  @Input() editKraPin = false;
  @Input() agentDetails!: any;
  @Input() photoUrl?: SafeUrl;
  @Input() signatureUrl?: SafeUrl;
  detailsForm!: UntypedFormGroup;
  detailskraPin!: UntypedFormGroup;
  regularDistribution = 100 / 4 + '%';
  private destroySubject$ = new Subject();
  public countryCode = ';';
  account: any;
  customerCif = '';

  @Output() isDetailsFormValid: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: UntypedFormBuilder,
    private session: SessionService
  ) {}

  ngOnInit(): void {
    this.countryCode = this.session.subsidiary.countryCode;
    if (this.knownAgentDetails?.customerId) {
      this.customerCif = this.knownAgentDetails.customerId;
    }
    if (this.agentDetails?.accountDetails) {
      this.account = this.agentDetails.accountDetails.accountNumber;
    } else if (
      this.agentDetails?.accounts &&
      this.agentDetails.accounts.length > 0
    ) {
      this.account = this.agentDetails.accounts[0].accountNumber;
    }
    this.detailskraPin = this.fb.group({
      kraPin: ['', [Validators.required, ValidateFields, validateKraPin]],
    });
    this.detailsForm = this.fb.group({
      firstName: ['', [Validators.required, ValidateFields]],
      middleName: [''],
      lastName: ['', [Validators.required, ValidateFields]],
      idSerialNumber: ['', [Validators.required, ValidateFields]],
      kraPin: ['', [Validators.required, ValidateFields, validateKraPin]],
    });

    this.detailsForm.statusChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(status => {
        const formObj: AgentFormObj = {
          formName: FormNames.ADDITIONALINFORMATION,
          values: this.detailsForm.value,
          valid: status === 'VALID',
        };
        this.isDetailsFormValid.next(formObj);
      });

    this.detailskraPin.statusChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(status => {
        const formObj: AgentFormObj = {
          formName: FormNames.ADDITIONALINFORMATION,
          values: this.detailskraPin.value,
          valid: status === 'VALID',
        };
        this.isDetailsFormValid.next(formObj);
      });
    this.countryCode = this.session.subsidiary.countryCode;
  }

  ngOnDestroy(): void {
    this.destroySubject$.next('');
    this.destroySubject$.complete();
  }

  getFormValidationErrors() {
    Object.keys(this.detailskraPin.controls).forEach(key => {
      const controlErrors = this.detailskraPin?.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          // console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
        });
      }
    });
  }
}

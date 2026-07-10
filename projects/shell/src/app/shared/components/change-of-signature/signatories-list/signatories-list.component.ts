import { Component,
  OnDestroy,
  OnInit,
  Input,
  ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { Subject, takeUntil } from 'rxjs';
import { AccountService } from 'src/app/core/services/account/account.service';
import { SessionService, ApiService } from '@app/shared/services';
import { MandateInqResponse } from 'src/app/shared/models/common/mandate.model'; // Import MandateInqResponse
import { ContextManager } from '@app/shared/modules/stepper';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';

import { Mandate } from 'src/app/shared/models/common/mandate.model';

@Component({
  selector: 'app-signatories-list',
  templateUrl: './signatories-list.component.html',
  styleUrls: ['./signatories-list.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class PhotoSignatoriesListComponent implements OnInit {
  @Input() mandateForm!: UntypedFormGroup;
  @Input() signatories: Mandate[] = [];

  ngOnInit(): void {}
}

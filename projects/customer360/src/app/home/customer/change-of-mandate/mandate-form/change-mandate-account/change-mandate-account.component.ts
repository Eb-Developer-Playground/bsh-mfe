import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { InfoDialogComponent } from '@app/shared/components/dialog/info-dialog/info-dialog.component';
import { ChangeMandateService } from '@app/core/services/change-mandate/change-mandate.service';
import { AccountService } from '@app/core/services/account/account.service';
import { IAccMngtObj } from '@app/home/customer/funds-transfer/funds-transfer.model';
import { IMandate, MandateResponse } from '../../models/change-madate.model';
import { ContextManager } from '@app/shared/modules/stepper';
import { SessionService } from '@app/shared/services';
import { Mandate } from '../current-mandate-signatories/signatory.interface';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-change-mandate-account',
  templateUrl: './change-mandate-account.component.html',
  styleUrls: ['./change-mandate-account.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    TranslatePipe,
  ],
})
export class ChangeMandateAccountComponent implements OnInit, OnDestroy {
  @Input() mandateForm!: UntypedFormGroup;
  signatory: Mandate[] = [];
  selectedSignatory: string | null = null;
  effectiveDate: Date | null = null;
  public translateService = inject(TranslateService);
  public signatoryKe = [
    {
      code: 'DIR',
      title: 'director/chief finance',
      description: '',
    },
    {
      code: 'AWITH',
      title: "'a' with any other",
      description: '',
    },
    {
      code: 'POA',
      title: 'power of attorney',
      description: '',
    },
    {
      code: '3RD',
      title: '3rd party mandate',
      description: '',
    },
    {
      code: 'BTS',
      title: 'both to sign',
      description: '',
    },
    {
      code: 'OTH',
      title: 'other',
      description: '',
    },
    {
      code: 'ANY',
      title: 'any two to sign',
      description: '',
    },
    {
      code: 'ADM',
      title: 'legal administr',
      description: '',
    },
    {
      code: 'ETS',
      title: 'either to sign',
      description: '',
    },
    {
      code: 'ALL',
      title: 'all to sign',
      description: '',
    },
    {
      code: 'Self',
      title: 'self',
      description: '',
    },
    {
      code: 'ABC',
      title: 'a alone or b and c jointly',
      description: '',
    },
    {
      code: 'TTS',
      title: 'three to sign',
      description: '',
    },
    {
      code: 'SPECIAL',
      title: this.translateService.instant('MANDATES.SPECIAL'),
      description: '',
    },
  ];

  public signatoryDrc = [
    {
      code: '3RD',
      title: this.translateService.instant('MANDATES.3RD'),
      description: '',
    },
    {
      code: 'ABC',
      title: this.translateService.instant('MANDATES.ABC'),
      description: '',
    },
    {
      code: 'ADM',
      title: this.translateService.instant('MANDATES.ADM'),
      description: '',
    },
    {
      code: 'ALL',
      title: this.translateService.instant('MANDATES.ALL'),
      description: '',
    },
    {
      code: 'ANY',
      title: this.translateService.instant('MANDATES.ANY'),
      description: '',
    },
    {
      code: 'AWITH',
      title: this.translateService.instant('MANDATES.AWITH'),
      description: '',
    },
    {
      code: 'BTS',
      title: this.translateService.instant('MANDATES.BTS'),
      description: '',
    },
    {
      code: 'DIR',
      title: this.translateService.instant('MANDATES.DIR'),
      description: '',
    },
    {
      code: 'ETS',
      title: this.translateService.instant('MANDATES.ETS'),
      description: '',
    },
    {
      code: 'GDN',
      title: this.translateService.instant('MANDATES.GDN'),
      description: '',
    },
    {
      code: 'OTH',
      title: this.translateService.instant('MANDATES.OTH'),
      description: '',
    },
    {
      code: 'POA',
      title: this.translateService.instant('MANDATES.POA'),
      description: '',
    },
    {
      code: 'SELF',
      title: this.translateService.instant('MANDATES.SELF'),
      description: '',
    },
    {
      code: 'TTS',
      title: this.translateService.instant('MANDATES.TTS'),
      description: '',
    },
    {
      code: 'SPECIAL',
      title: this.translateService.instant('MANDATES.SPECIAL'),
      description: '',
    },
  ];
  public signatories!: IMandate[];
  private customer: IAccMngtObj = JSON.parse(
    <string>localStorage.getItem('accMgntObj')
  );
  private destroy$ = new Subject();
  today = new Date();

  constructor(
    private _fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private mandateService: ChangeMandateService,
    private accountService: AccountService,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    this.mandateForm
      .get('account')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.setSignatories());

    if (this.sessionService.subsidiary.countryCode === 'CD') {
      this.signatory = this.signatoryDrc;
    } else {
      this.signatory = this.signatoryKe;
    }

    this.mandateForm
      .get('signatory')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.selectedSignatory = value;
        this.updateRequestValidator();
        this.storeSelectedSignatory();
      });
  }

  updateRequestValidator() {
    const requestControl = this.mandateForm.get('request');
    if (this.selectedSignatory === 'SPECIAL') {
      requestControl?.setValidators([Validators.required]);
    } else {
      requestControl?.clearValidators();
    }
    requestControl?.updateValueAndValidity();
  }

  storeSelectedSignatory() {
    const selectedSignatoryObject = this.signatory.find(
      (item: any) => item.code === this.selectedSignatory
    );
    if (selectedSignatoryObject) {
      localStorage.setItem(
        'selectedSignatory',
        JSON.stringify(selectedSignatoryObject)
      );
    }
  }

  openModal(val: string) {
    let newVal!: string;
    if (val == 'app-additional-details')
      newVal = '<app-additional-details></app-additional-details>';
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: 'auto',
      data: {
        selector: newVal,
        title: 'Types of Mandates',
        subtitle:
          'Please find more information on the types of mandates that are available and their requirements',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      } else {
      }
    });
  }

  private setSignatories() {
    const payload = {
      accountId: this.customer.accountsId,
      bankId: this.customer.bankID,
    };
    this.mandateService
      .getChangeMandateAccounts(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: MandateResponse) => {
        if (res.successful) {
          this.signatories = res.responseObject.mandates;
          this.checkAccountType();
          this.cdr.detectChanges();
        }
      });
  }

  checkAccountType() {
    const payload = {
      bankId: this.customer.bankID,
      customerId: this.customer.cif,
    };
    this.accountService
      .cifInquiryV2(true, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.responseObject) {
          localStorage.setItem('accountType', 'entity');
        } else {
          localStorage.setItem('accountType', 'joint');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { firstValueFrom, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { AccountService } from '@app/core/services/account/account.service';
import { ChangeMandateService } from '@app/core/services/change-mandate/change-mandate.service';
import { ICifInquiryResponse } from '@app/shared/models/common';
import {
  ContextManager,
  OnActive,
  OnSave,
  StepperChildComponent,
} from '@app/shared/modules/stepper';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import {
  ICreateChangeMandateTicketPayload,
  ITikectChangeMandateResponse,
} from '../models/change-madate.model';
import { SpecialCharacterValidator } from '@app/shared/directives/special-character-validator';
import { v4 as uuid } from 'uuid';
import { SessionService } from '@app/shared/services';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ActionTicketsService } from '@app/shared/services/actionTickets/action-tickets.service';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';
import { ChangeMandateSelectAccountComponent } from './change-mandate-select-account/change-mandate-select-account.component';
import { ChangeMandateAccountDetailComponent } from './change-mandate-account-detail/change-mandate-account-detail.component';
import { CurrentMandateSignatoriesComponent } from './current-mandate-signatories/current-mandate-signatories.component';
import { ChangeMandateAccountComponent } from './change-mandate-account/change-mandate-account.component';

interface ActionTicketPayload {
  actionFlow: string;
  associatedId: string;
  taskType: string;
  ParentTicket: string;
  CustomerId: string;
}

interface MandatePayload {
  CustomerDetails: {
    AccountId: string;
    FirstName: string;
    LastName: string;
    CustomerId: string;
    PreferredLanguage: string;
    PhoneDetails: {
      Id: string;
      Code: string;
      Number: string;
      PhoneType: string;
      Preferred: boolean;
    };
    EmailAddress: string;
  };
  MandateData: {
    MandateType: string;
    Remarks: string;
  };
  PreferredLanguage: string;
  IsCustomerPresent: boolean;
}

interface ActionTicketResponse {
  responseObject: {
    ticketId: string;
    actionFlowName: string;
  };
}

@Component({
  selector: 'app-mandate-form',
  templateUrl: './mandate-form.component.html',
  styleUrls: ['./mandate-form.component.scss'],
  imports: [
    ChangeMandateSelectAccountComponent,
    ChangeMandateAccountDetailComponent,
    CurrentMandateSignatoriesComponent,
    ChangeMandateAccountComponent,
  ],
})
export class MandateFormComponent
  extends StepperChildComponent
  implements OnInit, OnActive, OnDestroy, OnSave
{
  private _fb = inject(UntypedFormBuilder);
  private changeMandateService = inject(ChangeMandateService);
  private sessionService = inject(SessionService);

  mandateDetailsForm: UntypedFormGroup = this._fb.group({
    account: ['', Validators.required],
    signatory: ['', Validators.required],
    effectiveDate: [''],
    request: ['', SpecialCharacterValidator.containsSpecialCharacters],
  });
  fingerprintAccepted: boolean = false;
  customer!: any;
  ticket!: ITikectChangeMandateResponse | null;
  isPresent!: boolean;
  isBusiness!: boolean;
  selectedAccountData: any;
  isAccountSelected: boolean = false;

  private associatedTicketId!: string;
  private destroy$ = new Subject();
  shouldRenderDocuments: boolean = false;
  actionFlowData: any;
  useChangeMandateFlowV2 = this.changeMandateService.useChangeMandateFlowV2(
    this.sessionService.subsidiary.countryCode
  );

  constructor(
    public translateService: TranslateService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private accountService: AccountService,
    private ctxManager: ContextManager,
    private actionTicketsService: ActionTicketsService,
    private accountManagementService: AccountManagementService
  ) {
    super();
  }

  ngOnInit(): void {
    const context = this.ctxManager.currentContextData;
    const mandateContext = context?.mandateDetails;
    const selectedAccount = context?.selectedAccount;
    this.mandateDetailsForm.patchValue({
      account: selectedAccount?.accountNumber || '',
      signatory: mandateContext?.signatory || '',
      effectiveDate: new Date(),
      request: mandateContext?.request,
    });
    this.validateStep();
    this.mandateDetailsForm.valueChanges
      ?.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.validateStep());
    let customer: any = localStorage.getItem('accMgntObj');
    this.customer = JSON.parse(customer);
    this.isPresent = this.customer.isPresent;
    const businessCheck = localStorage.getItem('isBusiness');
    this.isBusiness = businessCheck === 'true';

    if (!this.isPresent) {
      this.associatedTicketId = JSON.parse(
        <string>localStorage.getItem('ticketId')
      );
    }

    const countryCode = this.sessionService.subsidiary.countryCode;
    this.shouldRenderDocuments =
      this.shouldRenderDocumentsComponent(countryCode);
  }

  onAccountSelected(account: any) {
    this.selectedAccountData = account;
    this.isAccountSelected = true;
  }

  onActive() {}

  onSave(): void {
    if (!this.useChangeMandateFlowV2) {
      if (this.ticket) {
        this.gotoNext();
        return;
      }
      this.createTicket();
    } else {
      const payload = {
        CustomerID: this.customer.cif,
        BankId: this.customer.bankID,
      };
      this.accountService
        .cifInquiryV2(this.isBusiness, payload)
        .pipe(
          switchMap((response: ICifInquiryResponse) => {
            return this.createMandateTicket(response);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: () => {
            this.gotoNext();
          },
        });
    }
  }

  private async createMandateTicket(response: ICifInquiryResponse) {
    try {
      const actionTicketResponse = await this.createActionTicket();

      if (!actionTicketResponse || !actionTicketResponse.responseObject) {
        throw new Error(
          'Invalid actionTicketResponse: responseObject is missing'
        );
      }

      await this.setDataMandateTicket(
        actionTicketResponse,
        response.responseObject
      );

      await this.validateMandateTicket(actionTicketResponse);
      localStorage.setItem(
        'selectedAccount',
        JSON.stringify(this.mandateDetailsForm.get('account')?.value)
      );
      localStorage.setItem(
        'effectiveDate',
        new Date(
          this.mandateDetailsForm.controls['effectiveDate'].value
        ).toISOString()
      );

      localStorage.setItem(
        'selectedAccountNumber',
        JSON.stringify(this.mandateDetailsForm.get('account')?.value)
      );

      localStorage.setItem(
        'effectiveDate',
        new Date(
          this.mandateDetailsForm.controls['effectiveDate'].value
        ).toISOString()
      );
      this.toastService.show(
        'Success',
        'Mandate ticket created successfully',
        MessageBoxType.SUCCESS,
        5000,
        undefined,
        undefined,
        false
      );
    } catch (error) {
      this.toastService.show(
        'Error',
        `Failed to create mandate ticket! Details: ${error}`,
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
    }
  }

  private async createActionTicket(): Promise<ActionTicketResponse> {
    const payload: ActionTicketPayload = {
      actionFlow: this.changeMandateService.getActionFlowName(
        this.sessionService.subsidiary.countryCode
      ),
      associatedId: uuid(),
      taskType: 'ChangeMandate',
      ParentTicket: this.associatedTicketId,
      CustomerId: this.customer.cif,
    };

    const response = await firstValueFrom(
      this.actionTicketsService.createActionTicket(payload)
    );

    this.actionFlowData = response;

    if (!response || !this.actionFlowData.responseObject) {
      throw new Error(
        'createActionTicket failed: response or responseObject is missing'
      );
    }

    localStorage.setItem(
      'runningTaskId',
      this.actionFlowData.responseObject.ticketId
    );
    localStorage.setItem(
      'runningActionFlow',
      this.actionFlowData.responseObject.actionFlowName
    );

    return this.actionFlowData;
  }

  private async setDataMandateTicket(
    actionTicketResponse: ActionTicketResponse,
    data: any
  ) {
    const { account, signatory, request } = this.mandateDetailsForm.value;
    const customer = this.accountManagementService.getCustomerCifData();
    const mandatePayload: MandatePayload = {
      CustomerDetails: {
        AccountId: account,
        FirstName: this.isBusiness
          ? data?.companyDetails.companyName
          : this.customer.firstName || '',
        LastName: this.customer.firstName || '',
        CustomerId: this.customer.cif,
        PreferredLanguage: !this.isBusiness
          ? customer?.personalDetails.prefferedLanguageCode
          : 'fr',
        PhoneDetails: {
          Id: data?.contactDetails?.phoneNumbers[0]?.id || '',
          Code: data?.contactDetails?.phoneNumbers[0]?.countryCode || '',
          Number: data?.contactDetails?.phoneNumbers[0]?.number || '',
          PhoneType: data?.contactDetails?.phoneNumbers[0]?.phoneType || '',
          Preferred: true,
        },
        EmailAddress:
          data?.contactDetails?.emailAddresses[0]?.emailAddress || '',
      },
      MandateData: {
        MandateType: signatory || '',
        Remarks: request || this.customer.cif || '',
      },
      PreferredLanguage: !this.isBusiness
        ? customer?.personalDetails.prefferedLanguageCode
        : 'fr',
      IsCustomerPresent: this.isPresent,
    };

    return await firstValueFrom(
      this.actionTicketsService.createActionTicketWithDetails(
        actionTicketResponse.responseObject.ticketId,
        actionTicketResponse.responseObject.actionFlowName,
        mandatePayload
      )
    );
  }

  private async validateMandateTicket(
    actionTicketResponse: ActionTicketResponse
  ) {
    await firstValueFrom(
      this.actionTicketsService.validateMandateTicket(
        actionTicketResponse.responseObject.ticketId,
        actionTicketResponse.responseObject.actionFlowName
      )
    );
  }

  success() {
    this.dialog.closeAll();
  }

  validateStep() {
    this.stepControl.patchValue(this.mandateDetailsForm?.valid ? true : null);
  }

  private createTicket() {
    const payload = {
      CustomerID: this.customer.cif,
      BankId: this.customer.bankID,
    };
    this.accountService
      .cifInquiryV2(this.isBusiness, payload)
      .pipe(
        tap(),
        switchMap((response: ICifInquiryResponse) => {
          const payloadTicket = this.setPayloadTicket(response);
          return this.changeMandateService.setChangeMandateTicket(
            payloadTicket
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((response: ITikectChangeMandateResponse) => {
        if (!response.responseObject) {
          this.toastService.show(
            'Error',
            response.statusMessage,
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
          return;
        }

        this.ticket = response;
        localStorage.setItem(
          'selectedAccount',
          JSON.stringify(this.mandateDetailsForm.get('account')?.value)
        );
        localStorage.setItem(
          'ticketId',
          JSON.stringify(this.ticket.responseObject.id)
        );
        localStorage.setItem(
          'effectiveDate',
          new Date(
            this.mandateDetailsForm.controls['effectiveDate'].value
          ).toISOString()
        );
        this.gotoNext();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  private setPayloadTicket(
    response: ICifInquiryResponse
  ): ICreateChangeMandateTicketPayload {
    const {
      value: { account, signatory, effectiveDate, request },
    } = this.mandateDetailsForm;
    const data = response.responseObject;
    let payloadTicket: ICreateChangeMandateTicketPayload;
    if (this.isBusiness) {
      payloadTicket = {
        ViewProfileTicketId: this.isPresent ? '' : `${this.associatedTicketId}`,
        associatedId: uuid(),
        mandateType: this.mandateDetailsForm.controls['signatory'].value,
        SpecialMandateRequest:
          this.mandateDetailsForm.controls['request'].value || '',
        startDate: this.formatDate(
          new Date(this.mandateDetailsForm.controls['effectiveDate'].value)
        ),
        bankId: data?.accountDetails.bankId,
        customerDetails: {
          accountId: account,
          firstName: data?.companyDetails?.companyName,
          middleName: '',
          lastName: '',
          customerId: this.customer.cif,
          phone: {
            id: data?.contactDetails.phoneNumbers[0]?.id,
            code: data?.contactDetails.phoneNumbers[0]?.code,
            number: data?.contactDetails.phoneNumbers[0]?.number,
            phoneType: data?.contactDetails.phoneNumbers[0]?.phoneType,
            preferred: true,
          },
          email: {
            id: data?.contactDetails.emailAddresses[0]?.id,
            emailAddress:
              data?.contactDetails.emailAddresses[0]?.emailAddress,
            emailType: data?.contactDetails.emailAddresses[0]?.emailType,
            preferred: true,
          },
        },
        CustomerPresent: this.isPresent,
      };
    } else {
      payloadTicket = {
        ViewProfileTicketId: this.isPresent ? '' : `${this.associatedTicketId}`,
        associatedId: uuid(),
        mandateType: this.mandateDetailsForm.controls['signatory'].value,
        SpecialMandateRequest:
          this.mandateDetailsForm.controls['request'].value || '',
        startDate: this.formatDate(
          new Date(this.mandateDetailsForm.controls['effectiveDate'].value)
        ),
        bankId: data?.accountDetails.bankId,
        customerDetails: {
          accountId: account,
          firstName: data?.personalDetails?.firstName,
          middleName: data?.personalDetails?.middleName,
          lastName: data?.personalDetails?.lastName,
          customerId: this.customer.cif,
          phone: {
            id: data?.contactDetails.phoneNumbers[0]?.id,
            code: data?.contactDetails.phoneNumbers[0]?.countryCode,
            number:
              data?.contactDetails.phoneNumbers[0]?.cityCode +
              data?.contactDetails.phoneNumbers[0]?.number,
            phoneType: data?.contactDetails.phoneNumbers[0]?.phoneType,
            preferred: true,
          },
          email: {
            id: data?.contactDetails.emailAddresses[0]?.id,
            emailAddress:
              data?.contactDetails.emailAddresses[0]?.emailAddress,
            emailType: data?.contactDetails.emailAddresses[0]?.emailType,
            preferred: true,
          },
        },
        CustomerPresent: this.isPresent,
      };
    }
    return payloadTicket;
  }

  private shouldRenderDocumentsComponent(countryCode: string): boolean {
    return this.useChangeMandateFlowV2;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

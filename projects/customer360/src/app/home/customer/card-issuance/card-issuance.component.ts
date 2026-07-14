import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ContextManager,
  OnSave,
  StepperParentComponent,
} from '@shared/modules/stepper';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CardIssuanceSubmitResponse,
  CardTypeT,
  InstantCardIssuanceFormKeysT,
  InstantCardIssuanceRequestDataT,
  IssuanceActiveAccountT,
  IssuanceCustomerDataT,
} from '@app/home/customer/card-issuance/card-issuance.models';
import { CardIssuanceApisService } from '@app/home/customer/card-issuance/services/card-issuance-apis.service';
import { CardIssuanceService } from '@app/home/customer/card-issuance/services/card-issuance.service';
import { Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';
import { ActionTicketsService } from '@app/shared/services/actionTickets/action-tickets.service';
import { v4 as uuid } from 'uuid';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { IUploadedDocument } from '@app/shared/modules/upload-docs';
import { AccountService, AccountManagementService } from '@app/core/services';
import { SessionService } from '@app/shared/services';
import { MatDialog } from '@angular/material/dialog';
import {
  BioVerificationConfig,
  BioVerificationUtil,
} from '@app/shared/utils/bioverification';
import { TranslateService } from '@ngx-translate/core';
import { CdkStep, CdkStepperModule } from '@angular/cdk/stepper';
import { StepperComponent } from '@shared/modules/stepper';
import { StepperContainerComponent } from '@app/home/customer/card-issuance/components/stepper-container/stepper-container.component';
import { CardSectionComponent } from '@app/home/customer/card-issuance/components/card-section/card-section.component';
import { CardInputComponent } from '@app/home/customer/card-issuance/components/card-input/card-input.component';
import { CardDetailsSectionComponent } from '@app/home/customer/card-issuance/smart-components/card-details-section/card-details-section.component';
import { CardChargesSectionComponent } from '@app/home/customer/card-issuance/smart-components/card-charges-section/card-charges-section.component';
import { CardReviewSectionComponent } from '@app/home/customer/card-issuance/smart-components/card-review-section/card-review-section.component';
import { CardUploadSectionComponent } from '@app/home/customer/card-issuance/smart-components/card-upload-section/card-upload-section.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { DocumentsUploadDrcComponent } from '@shared/modules/upload-docs';

@Component({
  selector: 'app-card-issuance',
  templateUrl: './card-issuance.component.html',
  styleUrl: './card-issuance.component.scss',
  imports: [
    StepperComponent,
    CdkStep,
    CdkStepperModule,
    CardReviewSectionComponent,
    CardUploadSectionComponent,
    StepperContainerComponent,
    CardSectionComponent,
    CardInputComponent,
    CardDetailsSectionComponent,
    CardChargesSectionComponent,
    ReactiveFormsModule,
    NgIf,
    NgTemplateOutlet,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    DocumentsUploadDrcComponent,
  ],
})
export class CardIssuanceComponent
  extends StepperParentComponent
  implements OnInit, OnSave
{
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild(CardUploadSectionComponent)
  cardUploadSectionComponent!: CardUploadSectionComponent;

  @ViewChild(CardReviewSectionComponent)
  cardReviewSectionComponent!: CardReviewSectionComponent;

  get activeActionFlow() {
    return this.IssueCardForm.get('activeActionFlow')?.value || '';
  }
  activeTicketNumber: any = '';
  activeStepperIndex: any = 1;

  issuanceType: 'INSTANT' | 'PREMIUM' | 'PREPAID' = 'INSTANT';

  IssueCardForm: FormGroup;
  DocumentsForm: FormGroup;
  issuanceTypActionFlowMapping: any = {
    INSTANT: 'InstantCardIssuance',
    PREMIUM: 'PremiumCardIssuance',
    PREPAID: 'PrepaidCardIssuance',
  };
  private subscriptions: Subscription = new Subscription();

  constructor(
    override router: Router,
    override route: ActivatedRoute,
    override fb: UntypedFormBuilder,
    private cardIssuanceApisService: CardIssuanceApisService,
    private cardIssuanceService: CardIssuanceService,
    private actionTicketsService: ActionTicketsService,
    private ctxManager: ContextManager,
    private toastService: ToastService,
    private accountService: AccountService,
    private session: SessionService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private accMgtService: AccountManagementService
  ) {
    super(router, route, fb);
    this.IssueCardForm = this.cardIssuanceService.initializeIssuanceForm();
    this.DocumentsForm = this.cardIssuanceService.initializeDocumentsForm();
    this.setupTransactingAccounts();
  }
  bankBranches: { solId: string; description: string }[] = [];

  cardTypeCharges: 'loading' | 'triggered' | 'n/a' = 'n/a';

  customerData: IssuanceCustomerDataT = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  activeAccount: IssuanceActiveAccountT = JSON.parse(
    <string>localStorage.getItem('accMgntObj')
  );
  accounts: {
    balance: string;
    accountCurrency: string;
    accountNumber: string;
    name: string;
    schemeCode: string;
    schemeType: string;
  }[] = [];
  accountsOptions: {
    value: string;
    label: string;
  }[] = [];
  branchesOptions: {
    value: string;
    label: string;
  }[] = [];
  cardTypes: CardTypeT[] = [];

  requiredDocuments: any[] = [
    {
      key: 'signature',
      name: 'Signature Photo',
      description: 'Signature Photo',
      fileTypes: ['image/png', 'image/jpeg'],
      maxSize: 100 * 1024,
      required: true,
    },
    {
      key: 'passport',
      name: 'Passport Photo',
      description: 'Passport Photo',
      fileTypes: ['image/png', 'image/jpeg'],
      maxSize: 100 * 1024,
      required: true,
    },
  ];

  get activeAccountBalance() {
    if (this.activeAccountNumber) {
      const accInfo = this.accounts.find(
        acc => acc.accountNumber === this.activeAccountNumber
      );
      return accInfo ? accInfo.balance : '0';
    }
    return '0';
  }
  get activeAccountNumber() {
    return this.IssueCardForm.get('accountNumber')?.value || '';
  }
  updateValidation($event: any[]) {}

  override onQuit() {}
  override onFinish(): void {}
  override ngOnInit() {
    try {
      const customerDetailsString = localStorage.getItem('customerDetails');
      if (customerDetailsString) {
        this.customerData = JSON.parse(customerDetailsString);
      }
    } catch (error) {
      console.error('Error parsing customerDetails from localStorage:', error);
    }

    try {
      const accMgntObjString = localStorage.getItem('accMgntObj');
      if (accMgntObjString) {
        this.activeAccount = JSON.parse(accMgntObjString);
      }
    } catch (error) {
      console.error('Error parsing accMgntObj from localStorage:', error);
    }

    this.setupIssuanceForm();
    if (this.ctxManager.currentContextData?.requiredDocuments) {
      this.requiredDocuments =
        this.ctxManager.currentContextData.requiredDocuments;
    }
  }
  setupIssuanceForm() {
    const data = this.cardIssuanceService.getItem('Cards-Issuance-FormData');

    this.subscriptions.add(
      this.IssueCardForm.get('cardType')?.valueChanges.subscribe(cardTypeId => {
        this.updateRequiredDocuments(cardTypeId);
      })
    );
  }

  private updateRequiredDocuments(cardTypeId: number | string) {
    if (this.ctxManager.currentContextData?.requiredDocuments) {
      this.requiredDocuments =
        this.ctxManager.currentContextData.requiredDocuments;
    } else {
      this.setDefaultRequiredDocuments();
    }
  }

  private setDefaultRequiredDocuments() {
    this.requiredDocuments = [
      {
        key: 'signature',
        name: 'Signature Photo',
        description: 'Signature Photo',
        fileTypes: ['image/png', 'image/jpeg'],
        maxSize: 100 * 1024,
        required: false,
        documentCode: '085',
      },
      {
        key: 'passport',
        name: 'Passport Photo',
        description: 'Passport Photo',
        fileTypes: ['image/png', 'image/jpeg'],
        maxSize: 100 * 1024,
        required: false,
        documentCode: '079',
      },
    ];
  }
  setupTransactingAccounts() {
    if (this.customerData?.accounts) {
      this.accounts = this.customerData.accounts.map(account => ({
        balance: account.availableBalance,
        accountCurrency: account.accountCurrency,
        accountNumber: account.accountNumber,
        name: account.accountName,
        schemeCode: account.schemeCode,
        schemeType: account.schemeType,
      }));
      this.accountsOptions =
        this.cardIssuanceService.convertListToDropdownFormat(
          this.accounts,
          'accountNumber',
          'accountNumber'
        );

      const name = `${this.customerData.firstName} ${this.customerData.lastName}`;
      this.updateForm('accountName', name);
      this.updateForm('cardEmbossingName', name || '');
      this.markAsDisabled('accountName');
    }
    if (this.activeAccount?.accountsId) {
      const activeAcc = this.accounts.find(
        acc => acc.accountNumber === this.activeAccount?.accountsId
      );
      this.updateForm('accountNumber', activeAcc?.accountNumber || '');
      this.updateForm('cardCurrency', activeAcc?.accountCurrency || '');
      this.markAsDisabled('cardCurrency');
    }
  }
  get accountNames() {
    const accName = this.getFormValue('accountName');
    const splitAccName = accName.split(' ');
    return {
      firstName: accName[0] || '',
      lastName: splitAccName[splitAccName.length - 1] || '',
    };
  }
  get selectedCardName() {
    const cardTypeId = this.getFormValue('cardType') || '14';
    if (cardTypeId) {
      const found =
        this.cardTypes.find(typ => String(typ.id) === cardTypeId)?.name || '';
      return found;
    }
    return '';
  }
  markAsDisabled(inputName: string) {
    this.IssueCardForm.get(inputName)?.disable();
  }

  getFormDetails() {
    this.submitData();
  }

  getFormValue(formKeys: keyof InstantCardIssuanceFormKeysT) {
    return this.IssueCardForm.get(formKeys)?.value || '';
  }

  override ngOnDestroy() {
    this.subscriptions.unsubscribe();
    super.ngOnDestroy();
  }
  override onActive(data: any) {}

  submitData() {
    if (this.activeActionFlow === 'InstantCardIssuance') {
      this.submitInstantIssuanceData();
    }
    if (this.activeActionFlow === 'PremiumCardIssuance') {
      this.submitPremiumIssuanceData();
    }
    if (this.issuanceType === 'PREPAID') {
      this.submitPrepaidIssuanceData();
    }
  }
  submitPrepaidIssuanceData() {}
  submitPremiumIssuanceData() {
    if (!this.customerData || !this.activeAccount) {
      console.error(
        'Missing customer data or active account for premium card issuance'
      );
      return;
    }

    const apiCall: Observable<CardIssuanceSubmitResponse> =
      this.cardIssuanceApisService.submitPremiumCardIssuanceData({
        AccountDetails: {
          AccountNumber: this.getFormValue('accountNumber'),
          AccountName: this.getFormValue('accountName'),
          AccountCurrency: this.getFormValue('cardCurrency'),
          FirstName: this.accountNames.firstName,
          LastName: this.accountNames.lastName,
          IdNumber: this.customerData.prefDocumentID,
          PhoneNumber: this.customerData.phoneNumber1,
          Cif: this.customerData.cif,
          RegNumber: this.customerData.prefDocumentID,
        },
        CardDetails: {
          EmbossingName: this.getFormValue('cardEmbossingName'),
          ProductTypeId: '52',
          CardType: 'MASTERCARD WORLD ELITE',
          CardCurrency: this.getFormValue('cardCurrency'),
          DailyCashWithdrawalLimit: this.getFormValue('withdrawalLimit') || '0',
          DailyEcommerceTransactionLimit:
            this.getFormValue('ecommerceLimit') || '0',
          Pan: this.cardIssuanceService.pansToTestWith[2],
        },
        Charges: {
          AccountToDebit: this.getFormValue('accountNumber'),
          Currency: this.getFormValue('cardCurrency'),
          ChargeAmount: this.getFormValue('chargeAmount'),
          TaxAmount: this.getFormValue('taxAmount'),
          WaiveCharges: !!this.getFormValue('charges'),
        },
        Info: {
          CollectionBranch: this.getFormValue('collectionBranch'),
          PhysicalPinRequired: !!this.getFormValue('physicalPin'),
          City: this.customerData.preferredAddress?.cityCode || '',
          PostalCode: this.customerData.preferredAddress?.pinCode || '',
          AddressLine1: this.customerData.preferredAddress?.address1 || '',
          BirthName: this.getFormValue('accountName'),
          BirthDate: this.activeAccount.dateOfBirth || '',
          ShortName: this.getFormValue('accountName'),
          Country: this.customerData.preferredAddress?.countryCode || '',
          Gender: this.customerData.gender || '',
          Language: 'en',
          MaritalStatus: this.customerData.maritalStatus || '',
        },
      });
    this.cardIssuanceService.callApi(apiCall, this.handleSubmitDataResponse);
  }
  submitInstantIssuanceData() {
    if (!this.customerData) {
      console.error('Missing customer data for instant card issuance');
      return;
    }

    const apiCall: Observable<CardIssuanceSubmitResponse> =
      this.cardIssuanceApisService.submitInstantCardIssuanceData({
        AccountDetails: {
          AccountNumber: this.getFormValue('accountNumber'),
          AccountName: this.getFormValue('accountName'),
          AccountCurrency: this.getFormValue('cardCurrency'),
          FirstName: this.accountNames.firstName,
          LastName: this.accountNames.lastName,
          IdNumber: this.customerData.prefDocumentID || '',
          PhoneNumber: this.customerData.phoneNumber1 || '',
          Cif: this.customerData.cif || '',
          RegNumber: this.customerData.prefDocumentID || '',
        },
        CardDetails: {
          EmbossingName: this.getFormValue('cardEmbossingName'),
          ProductTypeId: this.getFormValue('cardType') || '14',
          CardType: this.selectedCardName,
          CardCurrency: this.getFormValue('cardCurrency'),
          DailyCashWithdrawalLimit: this.getFormValue('withdrawalLimit') || '0',
          DailyEcommerceTransactionLimit:
            this.getFormValue('ecommerceLimit') || '0',
          Pan: this.cardIssuanceService.pansToTestWith[2],
        },
        Charges: {
          AccountToDebit: this.getFormValue('accountNumber'),
          Currency: this.getFormValue('cardCurrency'),
          ChargeAmount: this.getFormValue('chargeAmount'),
          TaxAmount: this.getFormValue('taxAmount'),
          WaiveCharges: !!this.getFormValue('charges'),
        },
      });
    this.cardIssuanceService.callApi(apiCall, this.handleSubmitDataResponse);
  }
  handleIssuanceTypeChange($event: any) {
    this.issuanceType = $event;
    this.IssueCardForm.get('activeActionFlow')?.setValue(
      this.issuanceTypActionFlowMapping[$event] || ''
    );

    const inputFieldControl = this.IssueCardForm.get('cardPANValid');
    if (this.activeActionFlow === 'INSTANT' && inputFieldControl) {
      inputFieldControl.setValidators([Validators.requiredTrue]);
    }
    if (this.issuanceType === 'PREPAID' && inputFieldControl) {
      inputFieldControl.setValidators([Validators.requiredTrue]);
      this.IssueCardForm.get('charges')?.setValue(true);
    }
    if (this.issuanceType === 'PREMIUM' && inputFieldControl) {
      inputFieldControl.clearValidators();
      this.IssueCardForm.get('charges')?.setValue(true);
    }
  }
  handleSubmitDataResponse = (
    isSuccessful: boolean,
    data: CardIssuanceSubmitResponse
  ) => {
    const info: any = {
      actionFlowName: this.activeActionFlow,
      ticketID: String(data.responseObject.ticketId),
      ...data.responseObject.requestModel,
    };
    this.cardIssuanceService.setItem('Cards-Issuance-RequestData', info);
    this.activeTicketNumber = data.responseObject.ticketId;
    this.stepper.next();
    this.cardUploadSectionComponent.setupDocCodes();
  };
  updateForm(
    formKeys: keyof InstantCardIssuanceFormKeysT,
    val: string | boolean
  ) {
    this.IssueCardForm.get(formKeys)?.setValue(val);
  }
  triggerFormUpdate(data: {
    formKey: keyof InstantCardIssuanceFormKeysT;
    value: any;
  }) {
    this.updateForm(data.formKey, data.value);
  }
  handleDisableInput(data: { inputName: string }) {
    this.IssueCardForm.get(data.inputName)?.disable();
  }
  get runningTaskId() {
    const ticket = this.ctxManager.contextData['card-issuance']?.ticket;
    return ticket?.ticketId || ticket?.id || '';
  }

  get runningActionFlow() {
    const ticket = this.ctxManager.contextData['card-issuance']?.ticket;
    return ticket?.actionFlow || 'PrepaidCardIssuance';
  }
  override onSave() {
    const ind = this.stepper.selectedIndex;
    if (ind === 1) {
      const selectedCardId = this.getFormValue('cardType');
      if (selectedCardId === 25) {
        const savedFormData = JSON.parse(
          localStorage.getItem('Cards-Issuance-FormData') || '{}'
        );
        const linkedCustomerDetails = JSON.parse(
          localStorage.getItem('linkedCustomerDetails') || '{}'
        );
        const cardPayload = {
          AccountDetails: {
            AccountNumber: savedFormData.accountNumber,
            AccountName: savedFormData.accountName,
            AccountCurrency: savedFormData.cardCurrency,
            FirstName: savedFormData.firstName,
            LastName: savedFormData.lastName,
            PhoneNumber: linkedCustomerDetails.phoneNumber,
            Cif: linkedCustomerDetails.cif,
          },
          CardDetails: {
            EmbossingName: savedFormData.cardEmbossingName,
            ProductTypeId: savedFormData.cardType,
            CardType: savedFormData.cardType,
            CardCurrency: savedFormData.cardCurrency,
            DailyCashWithdrawalLimit: savedFormData.withdrawalLimit,
            DailyEcommerceTransactionLimit: savedFormData.ecommerceLimit,
            Pan: savedFormData.cardPAN,
            PanValidated: savedFormData.cardPANValid,
          },
          Charges: {
            AccountToDebit: this.getFormValue('accountNumber'),
            Currency: this.getFormValue('cardCurrency'),
            ChargeAmount: this.getFormValue('chargeAmount'),
            TaxAmount: this.getFormValue('taxAmount'),
            WaiveCharges: true,
          },
        };
        this.actionTicketsService
          .createActionTicketWithDetails(
            this.runningTaskId,
            this.runningActionFlow,
            cardPayload
          )
          .subscribe({
            next: () => {
              this.actionTicketsService
                .ValidatePan(this.runningTaskId, this.runningActionFlow)
                .subscribe({
                  next: response => {
                    this.actionTicketsService
                      .getListOfDocumentsPartial(
                        this.runningTaskId,
                        this.runningActionFlow
                      )
                      .subscribe(
                        (docResp: any) => {
                          if (
                            docResp.successful &&
                            docResp.responseObject?.DocumentData?.Documents
                          ) {
                            const apiDocuments =
                              docResp.responseObject.DocumentData.Documents.map(
                                (doc: any) => ({
                                  key:
                                    doc.DocumentCode ||
                                    doc.FileName?.toLowerCase().replace(
                                      /\s+/g,
                                      '_'
                                    ),
                                  name: doc.FileName,
                                  description: doc.ShortDesc || doc.FileName,
                                  fileTypes: doc.FileExtensions?.map(
                                    (ext: string) => {
                                      const cleanExt = ext.toLowerCase();
                                      if (
                                        cleanExt === 'png' ||
                                        cleanExt === 'jpg' ||
                                        cleanExt === 'jpeg'
                                      ) {
                                        return `image/${cleanExt}`;
                                      } else if (cleanExt === 'pdf') {
                                        return 'application/pdf';
                                      }
                                      return `image/${cleanExt}`;
                                    }
                                  ) || [
                                    'image/png',
                                    'image/jpeg',
                                    'application/pdf',
                                  ],
                                  maxSize: 10024 * 1024,
                                  required: doc.Required === true,
                                  documentCode: doc.DocumentCode,
                                })
                              );

                            this.requiredDocuments = [...apiDocuments];

                            this.ctxManager.patchCurrentContextData({
                              requiredDocuments: this.requiredDocuments,
                            });

                            this.toastService.show(
                              null,
                              'Documents fetched successfully',
                              MessageBoxType.SUCCESS,
                              5000,
                              undefined,
                              undefined,
                              false
                            );
                          } else {
                            this.setDefaultRequiredDocuments();
                            this.toastService.show(
                              null,
                              'Unable to fetch required documents, using defaults',
                              MessageBoxType.WARNING,
                              5000,
                              undefined,
                              undefined,
                              false
                            );
                          }
                          this.stepper.next();
                        },
                        error => {
                          this.setDefaultRequiredDocuments();
                          this.toastService.show(
                            null,
                            'Error fetching required documents, using defaults',
                            MessageBoxType.WARNING,
                            5000,
                            undefined,
                            undefined,
                            false
                          );
                          this.stepper.next();
                        }
                      );
                  },
                  error: error => {
                    this.toastService.show(
                      null,
                      'Pan Validation failed',
                      MessageBoxType.DANGER,
                      5000,
                      undefined,
                      undefined,
                      false
                    );
                  },
                });
            },
            error: error => {
              console.error('Error setting ticket details:', error);
              this.toastService.show(
                null,
                'Failed to set ticket details',
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                false
              );
            },
          });
      } else {
        this.submitData();
      }
    } else if (ind === 2) {
      this.cardUploadSectionComponent.processDocumentsForSubmission();
    } else if (ind === 0) {
      const selectedCardId = this.getFormValue('cardType');
      if (selectedCardId === 25) {
        const newTicketPayload: any = {
          associatedId: uuid(),
          ActionFlow: 'PrepaidCardIssuance',
          TaskType: 'CardIssuance',
        };
        this.actionTicketsService
          .createActionTicket(newTicketPayload)
          .subscribe(resp => {
            if (resp.successful) {
              const ticket = resp.responseObject;
              this.ctxManager.context = 'card-issuance';
              this.ctxManager.patchCurrentContextData({
                ticket: ticket,
              });
            } else {
              this.toastService.show(
                null,
                resp?.statusMessage || 'Action ticket creation failed',
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                false
              );
            }
          });
      }
      this.cardIssuanceService.setItem(
        'Cards-Issuance-FormData',
        this.IssueCardForm.getRawValue()
      );
      this.cardReviewSectionComponent.setupCardTypeName();
      this.stepper.next();
    } else if (ind === 2) {
      this.cardUploadSectionComponent.triggerDocumentsUpload();
    }
  }
  loadingBranches = false;
  updateBranches() {
    this.cardIssuanceService.setupBranches(
      (loading: boolean, branches?: any[]) => {
        this.loadingBranches = loading;
        if (branches) {
          this.branchesOptions = branches.map(branch => ({
            value: branch.solId,
            label: branch.description,
          }));
        }
      }
    );
  }
  testTrigger() {}

  uploadDocs() {
    if (!this.customerData) {
      console.error('Missing customer data for document upload');
      return;
    }

    const apiCall = this.cardIssuanceApisService.uploadIssuanceDocs({
      Country: this.customerData.preferredAddress?.countryCode || '',
      Cif: this.customerData.cif || '',
      documents: this.DocumentsForm.value,
      Service: 'Blob',
      ticketNumber: this.activeTicketNumber,
    });
    this.cardIssuanceService.callApi(apiCall, this.handleDocUploadResponse);
  }
  handleDocUploadResponse(data: any) {
    this.router
      .navigate(['/services/card-issuance/success'], {
        state: { resolve: false },
      })
      .then(r => {});
  }

  triggerConfirmUpload() {
    const docIds: string[] = ['N1rZuhLvMoUA5Hmclgn9Ig=='];
    this.cardIssuanceApisService
      .submitTransactionDocumentsV3('89132', 'PremiumCardIssuance', {
        documentIds: docIds,
      })
      .subscribe();
  }
  goToSuccess() {
    this.router
      .navigate(['/services/card-issuance/success'], {
        state: { resolve: false },
      })
      .then(r => {});
  }
}

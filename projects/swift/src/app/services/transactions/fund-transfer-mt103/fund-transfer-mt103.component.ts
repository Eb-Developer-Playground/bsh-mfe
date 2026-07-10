import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { combineLatest, EMPTY, forkJoin, from, merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, map, mergeMap, startWith, takeUntil, tap } from 'rxjs/operators';
import { TransactionsService } from '../../../../core/services';
const IBANCOUNTRIES: any = {};
import { FIELD_TYPES } from '../../../../shared/dynamic-form';
import { MessageBoxType, ToastService } from '../../../../shared/modules/toast';
import { FilterSpecCharsPipe } from '../../../shared-stubs/pipes/special-chars.pipe';
import { AccountService, ApiService, SessionService } from '../../../shared-stubs/services';
import { COUNTRY_CODES, REQUIRED_DOCS } from '../../../../shared/static';
import { AdditionalFieldsComponent } from '../form-sections';
import { ChargesDialog } from './charges.dialog';
import { UpdateAddressDialog } from './update-address.dialog';
import {
  BankDetails,
  BranchDetails,
  DrcBranchDetails,
  TransactionDocValidators,
} from '../../../shared-stubs/documents-upload-drc/models';
import { validateBankCodeIban } from '../../../shared-stubs/validators/IBAN-Digits.validation';
import { instrumentNumberAsyncValidator } from '../../../shared-stubs/validators';
import { DRCBranchList } from '../../../shared-stubs/static/DRC-branch-list';
import { environment } from '../../../../environments/environment';
import {
  EXCHANGE_DETAILS_FIELDS,
  REMITTER_ACC_DETAILS_FIELDS,
  SENDER_TO_RECEIVER_INFORMATION_FIELDS,
  SUBSIDIARIES_WITH_PURPOSE_CODE,
} from './mt103-field-definitions';
import {
  getLicenseNumber1MaxLength,
  getRemittanceInfo1MaxLength,
  isCountrySpecificRequired,
  isLicenseRelatedError as isLicenseRelatedErrorHelper,
  isPurposeCodeRequired,
  mergeStringWithUnderscores,
} from './mt103-helpers';
import { getFilteredMt103Currencies } from './mt103-currency-rules';
import { getMt103InstrumentRuleDecision } from './mt103-instrument-rules';
import { getBeneficiaryCountryCodeByRoutingCode, getRoutingCodeOptionsByCurrency } from './mt103-routing-code-rules';
import { getRoutingCodeValueValidatorDecision } from './mt103-bic-routing-validators';
import { getDefaultChargeOptionByCountry, resolveChargeOption } from './mt103-charge-option-rules';
import { getCbkRemittanceDecision } from './mt103-cbk-remittances-rules';
import { findEapsDomesticReceiverBic } from './mt103-beneficiary-bic-rules';
import { applyBeneficiaryBankControlClear } from './mt103-beneficiary-bank-control-patcher';
import {
  getReturnedTicketPurposeValues,
  mapReturnedTicketLicenseDetails,
  mapSavedTicketPatchValue,
} from './mt103-returned-ticket-hydrator';
import {
  buildMergedReturnedTicketDocuments,
  buildReturnedTicketDocValidators,
  markLicenseDocumentsAsRequired,
  updateLicenseDocumentRequiredStatus,
} from './mt103-returned-ticket-document-initializer';
import {
  buildCongoUploadPayload,
  buildDefaultUploadPayload,
  buildKenyaUploadPayload,
  selectMt103UploadStrategy,
} from './mt103-upload-strategy';
import { buildMt103CongoCleanupPayload, extractMt103UploadedDocumentIds } from './mt103-congo-finalization';
import {
  buildMt103FinalizationPlan,
  resolveMt103CleanupFailureFeedback,
  shouldShowMt103UploadSuccessMessage,
} from './mt103-finalization-strategy';
import { resolveMt103SubmissionSuccessFeedback } from './mt103-submission-success';
import { restructureMt103FormData } from './mt103-form-restructurer';
import { buildMt103LicenseValidationRefresh } from './mt103-license-validation-refresh';
import { resolveMt103SubmissionErrorFeedback, resolveMt103UploadErrorFeedback } from './mt103-submission-feedback';
import { aggregateFailedDocuments, formatFailedDocumentsErrorMessage } from './mt103-upload-result-handler';
import {
  buildMt103SameCurrencyExchangeDetails,
  calculateMt103ConvertedAmount,
  calculateMt103SpecialConvertedAmount,
} from './mt103-exchange-rate-rules';
import {
  createAccountFormFields,
  createBeneficiaryBankDetailsFields,
  createBeneficiaryDetailsFields,
  createChargeDetailsFields,
  createHeadOfficeRemitterFields,
  createLicenseDetailsFields,
  createTransactionDetailsFields,
} from './mt103-field-factories';
import { createAdditionalFields } from './mt103-additional-fields-factory';
import { TranslatePipe } from '../../../shared-stubs/translate.pipe';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { DocumentsUploadComponent } from '../../../shared-stubs/documents-upload';

function createMt103DropdownDefaults() {
  return {
    headOffice: false,
    remittanceCurrencies: [],
    purposeCodes: [],
    routingCodes: [],
    field26T: [],
    chargeOptions: [],
    departments: [],
    creditAccountNumbers: [],
  };
}

function createDrcDropdownDefaults() {
  return {
    licensecode: [],
  };
}

function createDrcRegionDefaults() {
  return {
    drcRegions: [],
    drcStates: [],
  };
}

function createDrcCityDefaults() {
  return {
    cities: [],
  };
}

function createRequiredDocumentsDefaults() {
  return {
    taskData: {
      documentData: {
        documents: [],
      },
    },
  };
}

@Component({
  imports: [...COMPAT_IMPORTS, DocumentsUploadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-fund-transfer-mt103',
  templateUrl: './fund-transfer-mt103.component.html',
  styleUrls: ['./fund-transfer-mt103.component.scss'],
})
export class FundTransferMt103Component implements OnInit, OnDestroy, AfterViewInit {
  private _transService = inject(TransactionsService);
  private _route = inject(ActivatedRoute);
  private _sessionService = inject(SessionService);

  viewType = 'Maker';
  transferType = this._transService.contextData?.selectionForm?.transferType;
  transactionType = this._transService.contextData?.selectionForm?.transactionType;

  dropdownOptions: any = this._route.snapshot.data[1]?.responseObject ?? createMt103DropdownDefaults();
  dropdownOptionsDRC: any = this._route.snapshot.data[2]?.responseObject ?? createDrcDropdownDefaults();
  drcLicenseCategories: any = this._route.snapshot.data[7]?.responseObject?.swiftType ?? [];
  dataOptionsDRC: any = this._route.snapshot.data[3]?.responseObject ?? createDrcRegionDefaults();
  cityOptionsDRC: any = this._route.snapshot.data[4]?.responseObject ?? createDrcCityDefaults();
  requiredDocuments: any = this._route.snapshot.data[5]?.[0]?.responseObject ?? createRequiredDocumentsDefaults();
  returnedTicketDocuments: any = this._route.snapshot.data[5] ?? [];
  purposeCodeList: any = this._route.snapshot.data[6]?.responseObject ?? [];
  RTGSPurposeCodeList: any = [];
  subsidiariesWithPurposeCode = [...SUBSIDIARIES_WITH_PURPOSE_CODE];

  @ViewChild('accComp') AccComp!: AdditionalFieldsComponent;
  @ViewChild('remAccComp') RemAccComp!: AdditionalFieldsComponent;
  @ViewChild('transComp') TransComp!: AdditionalFieldsComponent;
  @ViewChild('excDetailComp') ExcDetailComp!: AdditionalFieldsComponent;
  @ViewChild('benComp') BenComp!: AdditionalFieldsComponent;
  @ViewChild('benBankComp') BenBankComp!: AdditionalFieldsComponent;
  @ViewChild('chargeDetailComp') ChargeDetailComp!: AdditionalFieldsComponent;
  @ViewChild('licenseDetailComp') LicenseDetailComp!: AdditionalFieldsComponent;
  @ViewChild('additionalComp') AdditionalComp!: AdditionalFieldsComponent;
  @ViewChild('senToRecComp') SenToRecComp!: AdditionalFieldsComponent;

  staticBankCodes: BankDetails[] = [];
  staticBranchCodes: BranchDetails[] = [];

  docValidators: any[] = [];
  uploads: {
    file: string;
    format: string;
    name: string;
    docCode: string;
  }[] = [];
  contextData!: any;
  taskData!: any;
  isReturnTicket!: boolean;
  fieldsForm!: UntypedFormGroup;
  RequiredDocumentsForm!: UntypedFormGroup;
  destroy$: Subject<any> = new Subject<any>();
  customerDetails = this._transService.contextData.accounts;
  userDetails: any;
  accountDetailsInfo!: any;
  isEntity!: boolean;
  countryCode: string = this._sessionService.userCountryCode || '';

  accountFormFields: any[] = createAccountFormFields(this.customerDetails, this.dropdownOptions.headOffice);
  remitterAccDetailsFields: any[] = REMITTER_ACC_DETAILS_FIELDS.map((field: any) => ({ ...field }));
  TransactionDetailsFields: any[] = createTransactionDetailsFields({
    transferType: this.transferType,
    transactionType: this.transactionType,
    countryCode: this.countryCode,
    userCountryCode: this._sessionService.userCountryCode,
    remittanceCurrencies: this.dropdownOptions.remittanceCurrencies,
    remittanceCurrencyOptions: this.getFilteredCurrencies(),
  });
  beneficiaryDetailsFields: any[] = createBeneficiaryDetailsFields(this.countryCode);
  beneficiaryBankDetailsFields: any[] = createBeneficiaryBankDetailsFields({
    countryCode: this.countryCode,
    transactionType: this.transactionType,
    routingCodes: this.dropdownOptions.routingCodes,
    field26TOptions: this.dropdownOptions.field26T,
    purposeCodeRequired: this.isPurposeCodeRequired(),
    countrySpecificForBankCode: this.isCountrySpecificRequired('CD'),
  });
  senderToReceiverInformationFields: any[] = SENDER_TO_RECEIVER_INFORMATION_FIELDS.map((field: any) => ({ ...field }));
  ChargeDetailsFields: any[] = createChargeDetailsFields(this.countryCode, this.dropdownOptions.chargeOptions);
  LicenseDetailsFields: any[] = [];
  ExchangeDetailsFields: any[] = EXCHANGE_DETAILS_FIELDS.map((field: any) => ({ ...field }));
  AdditionalFields: any[] = createAdditionalFields(this.RemittanceInfo1Validation());

  KeRequiredDocs: any[] = [];
  DRCRequiredDocs: any[] = [];
  documents: any[] = [];
  submitted!: boolean;
  actionForm!: UntypedFormGroup;

  customerAccountDetails: any = {};
  ticket: any;

  get uploadsToSendToServer() {
    return this.uploads.filter(upload => upload.file);
  }

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private toast: ToastService,
    private accountService: AccountService,
    private filterSpecChars: FilterSpecCharsPipe,
    private translate: TranslateService,
    private dialog: MatDialog,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.RequiredDocumentsForm = this.fb.group({
      documents: this.fb.array([]),
    });
    this.KeRequiredDocs = REQUIRED_DOCS;
    if (this.dropdownOptions.headOffice) {
      this.customerAccountDetails.accountNumber = this.customerDetails?.accountNumber;
      this.customerAccountDetails.accountCurrency = this.customerDetails?.currency;
      this.customerAccountDetails.accountName = this.customerDetails?.accountName;
    } else {
      this.customerDetails?.identifications.find(
        (identification: any) => identification.type === 'CompRegNo' && identification.id !== ''
      )
        ? (this.isEntity = true)
        : (this.isEntity = false);

      // create custom customer account details Object
      this.customerDetails?.accounts.forEach((i: any) => {
        this.customerAccountDetails.accountNumber = i.accountNumber;
        this.customerAccountDetails.accountCurrency = i.accountCurrency;
        this.customerAccountDetails.accountName = i.accountName;
        this.customerAccountDetails.accountBalance = i.availableBalance;
        this.customerAccountDetails.mandate = i.mandate;
      });
      this.customerDetails?.identifications.forEach((i: any) => {
        if (i.type === 'NationalID') this.customerAccountDetails.identificationNumber = i.id;
        if (i.type === 'PassportNo') this.customerAccountDetails.identificationPassportNumber = i.id;
      });
      this.customerAccountDetails.cif = this.customerDetails?.cif;
      this.customerAccountDetails.email = this.customerDetails?.email;
      this.customerAccountDetails.firstName = this.customerDetails?.firstName;
      this.customerAccountDetails.lastName = this.customerDetails?.lastName;
      this.customerAccountDetails.phoneNumber1 = this.customerDetails?.phoneNumber1;
      this.customerAccountDetails.phoneNumber2 = this.customerDetails?.phoneNumber2;
      this.customerAccountDetails.postalAddress = this.customerDetails?.preferredAddress.address1;
      this.customerAccountDetails.cityCodeDesc = this.customerDetails?.preferredAddress.cityCodeDesc;
    }
  }

  ngOnInit(): void {
    this.getRequiredDocsV3();

    // Initialize RTGSPurposeCodeList from dropdownOptions
    if (this.dropdownOptions?.purposeCodes) {
      this.RTGSPurposeCodeList = this.dropdownOptions.purposeCodes;
    }

    this.ticket = this._transService?.ticket;
    this.taskData = JSON.parse(this.ticket?.taskData);
    this.isReturnTicket = this.ticket?.status === 'Returned';

    // Set active ticket to ensure correct ticket-scoped data is loaded
    if (this.ticket?.id) {
      this._transService.setActiveTicket(this.ticket.id);
    }

    // Initialize transactionType from taskData (for return tickets) or contextData (for new tickets)
    this.transactionType =
      this.taskData?.TransactionType || this._transService.contextData?.selectionForm?.transactionType;

    this._transService.ticket = {
      ...this._transService.ticket,
      transactionType: this.transactionType,
    };

    // For return tickets, sync contextData from taskData (ground truth)
    if (this.isReturnTicket && this.taskData) {
      this._transService.patchContextData({
        formData: this.taskData,
        selectionForm: {
          transactionType: this.taskData.TransactionType,
          transferType: this.taskData.TransferType,
        },
      });
    }

    this.contextData = this._transService.contextData;

    if (this.dropdownOptions.headOffice) {
      this.remitterAccDetailsFields = [
        ...this.remitterAccDetailsFields,
        ...createHeadOfficeRemitterFields(this.dropdownOptions.departments, this.dropdownOptions.headOffice),
      ];
    } else {
      // account details information
      // For return tickets, set accountDetailsInfo from taskData
      // The account-details component will fetch fresh data via its own API call
      if (this.isReturnTicket && this.taskData?.AccountDetails) {
        // Set basic account info from taskData
        // The child component (account-details) will fetch complete data via getAccount()
        this.accountDetailsInfo = {
          ...this.taskData.AccountDetails,
          accountNumber: this.taskData.AccountDetails.AccountNumber,
        };

        // Update customerDetails with CIF from taskData if available
        if (this.taskData.RemitterAccountDetails?.CIF && (!this.customerDetails || !this.customerDetails.cif)) {
          this.customerDetails = {
            ...this.customerDetails,
            cif: this.taskData.RemitterAccountDetails.CIF,
          };
        }
      } else if (this.customerAccountDetails?.accountNumber) {
        // For NEW transactions, set accountDetailsInfo from customerAccountDetails
        // This ensures the account-details component can fetch fresh balance data
        this.accountDetailsInfo = {
          accountNumber: this.customerAccountDetails.accountNumber,
          accountCurrency: this.customerAccountDetails.accountCurrency,
          accountName: this.customerAccountDetails.accountName,
          accountBalance: this.customerAccountDetails.accountBalance,
          mandate: this.customerAccountDetails.mandate,
        };
      } else if (Array.isArray(this.customerDetails?.accounts)) {
        // Regular ticket flow - use customerDetails.accounts
        for (const acc of this.customerDetails.accounts) {
          this.accountDetailsInfo = acc;
        }
      }

      // Fetch CIF details if available
      if (this.customerDetails?.cif) {
        this.accountService
          .cifInquiryV2(this.customerDetails?.cif, this.isEntity)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            if (res.statusCode === '00') {
              this.userDetails = this.isEntity ? res.responseObject.companyDetails : res.responseObject.personalDetails;
            }
          });
      } else if (this.isReturnTicket && this.taskData?.RemitterAccountDetails?.CIF) {
        // For return tickets, try to use CIF from taskData
        this.accountService
          .cifInquiryV2(this.taskData.RemitterAccountDetails.CIF, this.isEntity)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: any) => {
            if (res.statusCode === '00') {
              this.userDetails = this.isEntity ? res.responseObject.companyDetails : res.responseObject.personalDetails;
            }
          });
      }
    }

    if (this.countryCode === 'CD') {
      this._transService.getBeneficiaryBankCode2(this.countryCode).subscribe(data => {
        this.staticBankCodes = data.responseObject.data;
      });

      this.TransactionDetailsFields = [
        ...this.TransactionDetailsFields,
        {
          id: 5,
          order: 5,
          key: 'IbanNumber',
          field_type: FIELD_TYPES.LINE,
          label: 'FIELDS.IBAN_NUMBER',
          value: '',
          readonly: true,
        },
        // {
        //     id: 20,
        //     order: 20,
        //     key: 'CentralBankCode',
        //     field_type: FIELD_TYPES.SELECT,
        //     label: 'FIELDS.CENTRAL_BANK_CODE',
        //     options: this.dropdownOptionsDRC.licensecode?.map((r: any) => {
        //         return { label: `${r.value} - ${r.text}`, value: r.value };
        //     }),
        //     value: '',
        //     required: true,
        // },
        // {
        //     id: 21,
        //     order: 21,
        //     key: 'CentralBankCodeDesc',
        //     field_type: FIELD_TYPES.LINE,
        //     label: 'FIELDS.CENTRAL_BANK_CODE_DESC',
        //     value: '',
        //     readonly: true,
        // },
        {
          id: 22,
          order: 22,
          key: 'TTCNumber',
          field_type: this.transactionType === 'RTGS' ? FIELD_TYPES.LINE : FIELD_TYPES.HIDDEN,
          label: 'FIELDS.TTC_NUMBER',
          value: this.transactionType === 'RTGS' ? '1103' : '',
          readonly: true,
        },
      ];

      if (this.transactionType !== 'RTGS') {
        this.LicenseDetailsFields = [
          ...this.LicenseDetailsFields,
          ...createLicenseDetailsFields({
            transactionType: this.transactionType,
            countryCode: this.countryCode,
            licenseCategories: this.drcLicenseCategories,
            licenseNumber1MaxLength: this.getLicenseNumber1MaxLength(),
            countrySpecificRequired: this.isCountrySpecificRequired('CD'),
          }),
        ];
      }

      // Charge options are configured inline in ChargeDetailsFields initialization
      // DRC: Only 'OUR' selectable, Other subsidiaries: All options selectable

      this.setInstrumentRules('OV');

      // get required documents
      this.RequiredDocumentsForm = this.fb.group({
        documents: this.fb.array([]),
      });
    }
  }

  ngAfterViewInit() {
    this.fieldsForm = this.fb.group({
      AccountDetails: this.AccComp?.form,
      RemitterAccountDetails: this.RemAccComp?.form,
      TransactionDetails: this.TransComp?.form,
      BeneficiaryDetails: this.BenComp?.form,
      BeneficiaryBankDetails: this.BenBankComp?.form,
      SenderToReceiverInformation: this.SenToRecComp?.form,
      ChargeDetails: this.ChargeDetailComp?.form,
      LicenseDetails: this.LicenseDetailComp?.form,
      ExchangeDetails: this.ExcDetailComp?.form,
      Additional: this.AdditionalComp?.form,
      RequiredDocuments: this.RequiredDocumentsForm,
    });

    if (this.isReturnTicket) {
      //
      this.fieldsForm.patchValue(this.taskData);

      const LicenseProductCodeForm = this.fieldsForm.controls['LicenseDetails'];
      const LicenseDetails = mapReturnedTicketLicenseDetails(this.taskData);
      LicenseProductCodeForm.setValue(LicenseDetails);
      this.checkReturnedTicketData(this.taskData);

      // Initialize purpose code fields if they exist in returned ticket data
      const returnedPurposeValues = getReturnedTicketPurposeValues(this.taskData);
      if (returnedPurposeValues.purposeCode) {
        this.fieldsForm.controls['BeneficiaryBankDetails']
          .get('PurposeCode')
          ?.setValue(returnedPurposeValues.purposeCode, { emitEvent: true });
      }
      if (returnedPurposeValues.purpose) {
        this.fieldsForm.controls['BeneficiaryBankDetails']
          .get('Purpose')
          ?.setValue(returnedPurposeValues.purpose, { emitEvent: true });
      }
      // Update form validation state and trigger change detection
      this.triggerFormValidation();
    } else {
      if (this.taskData.AccountDetails) {
        this.fieldsForm.patchValue(mapSavedTicketPatchValue(this.taskData));
      }

      if (this.dropdownOptions.headOffice) {
        this.populateGLAccDetailsData(this.customerAccountDetails, this.ticket);
      } else {
        this.populateAccDetailsInfoData(this.customerAccountDetails, this.ticket);
      }

      // Initialize purpose code fields if they exist in saved ticket data
      const savedPurposeValues = getReturnedTicketPurposeValues(this.taskData);
      if (savedPurposeValues.purposeCode) {
        this.fieldsForm.controls['BeneficiaryBankDetails']
          .get('PurposeCode')
          ?.setValue(savedPurposeValues.purposeCode, { emitEvent: true });
      }
      if (savedPurposeValues.purpose) {
        this.fieldsForm.controls['BeneficiaryBankDetails']
          .get('Purpose')
          ?.setValue(savedPurposeValues.purpose, { emitEvent: true });
      }

      // Update form validation state and trigger change detection after populating
      this.triggerFormValidation();
    }

    // Sync form data to contextData whenever form changes
    this.setupFormDataSync();

    // TODO: Check if country code is in banlist. If 'yes'

    //pass countryCode to filter BICs if Transaction Type/Product Code is RTGS
    if (this.fieldsForm.controls['TransactionDetails'].get('ProductCode')?.value === 'RTGS') {
      this.countryCode = this.fieldsForm.controls['RemitterAccountDetails'].get('CountryCode')?.value;
    }

    this.fieldsForm.controls['BeneficiaryBankDetails'].get('RoutingCodeValue')?.disable();
    this.fieldsForm.controls['BeneficiaryBankDetails'].get('RoutingCodeValue')?.updateValueAndValidity();
    this.fieldsForm.controls['BeneficiaryBankDetails'].get('CbkRemittances')?.disable();
    this.fieldsForm.controls['BeneficiaryBankDetails'].get('CbkRemittances')?.updateValueAndValidity();

    // Apply async validator to InstrumentNumber field (exclude UG, SS, RW, TZ)
    const instrumentNumberControl = this.fieldsForm.controls['TransactionDetails'].get('InstrumentNumber');
    const excludedCountriesForInstrumentValidation = ['UG', 'SS', 'RW', 'TZ'];
    if (instrumentNumberControl && !excludedCountriesForInstrumentValidation.includes(this.countryCode)) {
      instrumentNumberControl.setAsyncValidators(
        instrumentNumberAsyncValidator(
          this._transService,
          this.toast,
          () => this.fieldsForm.controls['TransactionDetails'].get('InstrumentType')?.value,
          () => this.fieldsForm.controls['TransactionDetails'].get('InstrumentDate')?.value,
          () => this.fieldsForm.value.AccountDetails.AccountNumber,
          () => this.ticket.bankId
        )
      );
      instrumentNumberControl.updateValueAndValidity();
    }

    this.fieldsForm.controls['TransactionDetails']
      .get('ChargeAccount')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(accNumber => this.getChargeAccount(accNumber, this.ticket.bankId));
    this.fieldsForm.controls['TransactionDetails']
      .get('CreditAccountNumber')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(creditAccountNumber => this.getCreditAccountName(creditAccountNumber, this.ticket.bankId));

    const remittanceCurrency$ =
      this.fieldsForm.controls['TransactionDetails'].get('RemittanceCurrency')?.valueChanges || EMPTY;
    const remittanceAmount$ =
      this.fieldsForm.controls['TransactionDetails'].get('RemittanceAmount')?.valueChanges || EMPTY;
    merge(
      remittanceCurrency$,
      remittanceAmount$.pipe(
        tap(value => {
          if (!value) {
            // if i don't have a value on RemittanceAmount
            this.clearCreditAccountValues();
          }
        })
      )
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: any) => {
        this.getExchangeRates();
        if (value) {
          this.fetchCreditAccountValues();
          // Use current charge option or subsidiary default instead of hardcoding 'OUR'
          const chargeOptionToUse = resolveChargeOption(
            this.fieldsForm.controls['ChargeDetails'].get('ChargeOption')?.value,
            this.countryCode
          );
          this.getCharges(chargeOptionToUse);
        }
      });

    // Setup subscription for future InstrumentType changes
    this.fieldsForm.controls['TransactionDetails']
      .get('InstrumentType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(type => this.setInstrumentRules(type));

    // Trigger immediately for existing value (handles returned/saved tickets)
    const currentInstrumentType = this.fieldsForm.controls['TransactionDetails'].get('InstrumentType')?.value;
    if (currentInstrumentType) {
      this.setInstrumentRules(currentInstrumentType);
    }

    // Instrument number validation is now handled by async validator
    // Re-validate when instrument date changes
    const instrumentDate$ = this.fieldsForm.controls['TransactionDetails'].get('InstrumentDate');

    if (instrumentDate$) {
      instrumentDate$.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        instrumentNumberControl?.updateValueAndValidity();
      });
    }

    this.fieldsForm.controls['TransactionDetails']
      .get('RemittanceCurrency')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (!value) {
          this.clearCreditAccountValues();
        }
      });

    // Enhancement for KE RTGS
    /* this.fieldsForm.controls['BeneficiaryBankDetails'].get('AccountWithInstitutionBic')?.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(
            value => {
                if (value === "CBKEKENXXXX" && this.countryCode == "KE" && this.contextData?.selectionForm?.transactionType === "RTGS") {
                    this.fieldsForm.controls['BeneficiaryDetails'].get('AccountNumber')?.addValidators(
                        LengthValidator(10)
                    )
                } else {
                    this.fieldsForm.controls['BeneficiaryDetails'].get('AccountNumber')?.removeValidators(
                        LengthValidator(10)
                    )
                }
                this.fieldsForm.controls['BeneficiaryDetails'].get('AccountNumber')?.updateValueAndValidity();
                this.fieldsForm.controls['BeneficiaryBankDetails'].updateValueAndValidity();
                this.fieldsForm.updateValueAndValidity();
            }
        ) */
    this.fieldsForm.controls['BeneficiaryBankDetails']
      .get('AccountWithInstitutionBic')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(bicCode => this.getBCCbyBIC(bicCode));
    this.fieldsForm.controls['BeneficiaryBankDetails']
      .get('RoutingCode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(routingCode => {
        if (!routingCode) {
          this.fieldsForm.controls['BeneficiaryBankDetails'].get('RoutingCodeValue')?.disable();
          this.fieldsForm.controls['BeneficiaryBankDetails'].get('RoutingCodeValue')?.updateValueAndValidity();
        } else {
          this.fieldsForm.controls['BeneficiaryBankDetails'].get('RoutingCodeValue')?.enable();
          this.fieldsForm.controls['BeneficiaryBankDetails'].get('RoutingCodeValue')?.updateValueAndValidity();
          this.getBCCbyRoutingCode(routingCode);
        }
      });

    // Subscribe to BeneficiaryBankCode changes to fetch branch codes
    this.fieldsForm.controls['BeneficiaryBankDetails']
      .get('BeneficiaryBankCode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(bankCode => {
        if (bankCode && this.countryCode === 'CD') {
          this.getBeneficiaryBranchCode(this.ticket?.bankId, bankCode);
        } else {
          // Clear branch codes if bank code is cleared
          this.staticBranchCodes = [];
        }
      });

    // Enhancement: Disable 2,3,4 for EAPS
    // if (this.contextData?.selectionForm?.transactionType === "EAPS") {
    //     this.fieldsForm.controls['Additional'].get('RemittanceInfo2')?.disable();
    //     this.fieldsForm.controls['Additional'].get('RemittanceInfo3')?.disable();
    //     this.fieldsForm.controls['Additional'].get('RemittanceInfo4')?.disable();
    //     this.fieldsForm.controls['SenderToReceiverInformation'].disable();
    //     this.fieldsForm.controls['Additional'].updateValueAndValidity()
    //     this.fieldsForm.controls['SenderToReceiverInformation'].updateValueAndValidity()
    // }

    this.fieldsForm.controls['BeneficiaryBankDetails']
      .get('BeneficiaryCountryCode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(beneficiaryCountryCode => {
        if (IBANCOUNTRIES.map((bank: any) => bank.CountryCode).includes(beneficiaryCountryCode)) {
          const countryName = IBANCOUNTRIES.find((bank: any) => bank.CountryCode === beneficiaryCountryCode)?.CountryName;
          this.toast.show(
            null,
            this.translate.instant('COMMON.ERROR.COUNTRY_IBAN_NUMBER_IN_BENEFICIARY_FIELD', {
              value1: countryName,
            }),
            MessageBoxType.INFO,
            6000
          );
        }
      });

    const currency = this.fieldsForm.controls['TransactionDetails'].get('AccountCurrency');
    if (currency) {
      currency.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(currency => {
        this.beneficiaryBankDetailsFields.forEach(field => {
          if (field.key === 'RoutingCode') {
            field.options = getRoutingCodeOptionsByCurrency(currency, this.dropdownOptions.routingCodes);
            this.beneficiaryBankDetailsFields = [...this.beneficiaryBankDetailsFields];
          }
        });
      });
    }

    if (this.dropdownOptions.headOffice) {
      this.fieldsForm.controls['RemitterAccountDetails']
        .get('RequestingDepartmentCode')
        ?.valueChanges.subscribe(value => {
          this.fieldsForm.controls['RemitterAccountDetails']
            .get('RequestingDepartment')
            ?.setValue(this.dropdownOptions.departments.find((department: any) => department.code === value).name);
        });
    }

    this.fieldsForm.controls['ChargeDetails']
      .get('ChargeOption')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(chargeOption => this.getCharges(chargeOption));

    if (this.countryCode === 'CD') {
      this.setInstrumentRules('OV');

      const debitAccountNumber = this.fieldsForm.controls['TransactionDetails'].get('DebitAccountNumber')?.value;
      if (debitAccountNumber) this.getDRCIbanNumberByAccount(debitAccountNumber);

      // this.fieldsForm.controls['TransactionDetails'].get('CentralBankCode')?.valueChanges.pipe(
      //     takeUntil(this.destroy$)
      // ).subscribe((value) => {
      //   this.fieldsForm.controls['TransactionDetails'].get('CentralBankCodeDesc')?.setValue(this.dropdownOptionsDRC.licensecode?.find((licenseCode: any) => licenseCode.value === value).text)
      // })

      this.fieldsForm.controls['LicenseDetails']
        .get('LicensePurposeCode')
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          const selectedLicensePurpose = this.dropdownOptionsDRC.licensecode?.find(
            (licenseCode: any) => licenseCode.value === value
          );

          this.fieldsForm.controls['LicenseDetails']
            .get('LicensePurpose')
            ?.setValue(selectedLicensePurpose?.text ?? '');
        });

      const accountWithInstitutionBic$ =
        this.fieldsForm.controls['BeneficiaryBankDetails'].get('AccountWithInstitutionBic');
      const remittanceCurrency$ = this.fieldsForm.controls['TransactionDetails'].get('RemittanceCurrency');

      // Fetch intermediary bank for all DRC transactions (including SWIFT LOCAL)
      if (accountWithInstitutionBic$ && remittanceCurrency$) {
        // Setup subscription for future changes
        merge(accountWithInstitutionBic$.valueChanges, remittanceCurrency$.valueChanges)
          .pipe(takeUntil(this.destroy$))
          .subscribe((value: any) => {
            if (value) {
              const bicCode =
                this.fieldsForm.controls['BeneficiaryBankDetails'].get('AccountWithInstitutionBic')?.value;
              const remittanceCurrency =
                this.fieldsForm.controls['TransactionDetails'].get('RemittanceCurrency')?.value;
              this.getDRCIntermediaryBank(bicCode, remittanceCurrency);
            }
          });

        // FIX: Trigger immediately for existing values (handles returned/saved tickets)
        const currentBic = accountWithInstitutionBic$.value;
        const currentCurrency = remittanceCurrency$.value;
        if (currentBic && currentCurrency) {
          this.getDRCIntermediaryBank(currentBic, currentCurrency);
        }
      }

      // Setup cross-section bank code IBAN validation for DRC
      this.setupBankCodeIbanValidation();
    }

    this.saveTicketData();

    // Setup transaction type listener for currency filtering
    this.setupTransactionTypeListener();
  }

  /**
   * Setup listener for transaction type changes to update currency options
   */
  private setupTransactionTypeListener(): void {
    try {
      // Listen to ProductCode changes (which affects transaction type)
      const productCodeControl = this.fieldsForm?.controls['TransactionDetails']?.get('ProductCode');
      if (productCodeControl) {
        productCodeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(productCode => {
          // Update transaction type based on product code
          if (productCode) {
            const oldTransactionType = this.transactionType;
            this.transactionType = productCode; // Update local transaction type

            // Update currency options based on new transaction type
            this.updateCurrencyOptions();
          }
        });
      }

      // Also listen to direct transaction type changes if available
      if (this._transService.contextData?.selectionForm) {
        const contextTransactionType = this._transService.contextData.selectionForm.transactionType;
        if (contextTransactionType && contextTransactionType !== this.transactionType) {
          this.transactionType = contextTransactionType;
          this.updateCurrencyOptions();
        }
      }

      // Initial currency update on setup
      this.updateCurrencyOptions();
    } catch (error) {
      // Error setting up transaction type listener - fallback to default behavior
    }
  }

  /**
   * Setup cross-section validation between BeneficiaryBankCode and AccountNumber (IBAN)
   * Validates that the first 5 digits of IBAN match the selected bank code
   * Only applies to RTGS and LOCALSWIFT (SWIFT LOCAL) transactions
   */
  private setupBankCodeIbanValidation(): void {
    // Only validate for RTGS and LOCALSWIFT transactions
    // Use this.transactionType which is correctly set for return tickets in ngOnInit
    if (
      this.transactionType !== 'RTGS' &&
      this.transactionType !== 'LOCALSWIFT' &&
      this.transactionType !== 'SWIFT LOCAL'
    ) {
      return;
    }

    const bankCodeControl = this.fieldsForm.controls['BeneficiaryBankDetails'].get('BeneficiaryBankCode');
    const ibanControl = this.fieldsForm.controls['BeneficiaryDetails'].get('AccountNumber');

    if (!bankCodeControl || !ibanControl) {
      return;
    }

    // Listen to both field changes and cross-validate
    combineLatest([
      bankCodeControl.valueChanges.pipe(startWith(bankCodeControl.value)),
      ibanControl.valueChanges.pipe(startWith(ibanControl.value)),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([bankCode, iban]) => {
        validateBankCodeIban(bankCode, iban, bankCodeControl);
      });
  }

  /**
   * Setup automatic syncing of form data to contextData
   * Ensures contextData is always up-to-date with form changes
   */
  private setupFormDataSync(): void {
    if (!this.fieldsForm) {
      return;
    }

    // Listen to form changes and sync to contextData
    this.fieldsForm.valueChanges
      .pipe(
        debounceTime(300), // Debounce to avoid excessive updates
        takeUntil(this.destroy$)
      )
      .subscribe(formValue => {
        // Update contextData with current form values
        this._transService.patchContextData({
          formData: formValue,
        });
      });
  }

  getDRCIbanNumberByAccount = (accountNumber: string) => {
    const bankId = this._sessionService.user.bankId;

    this._transService.getDRCIbanNumberByAccount(accountNumber, bankId).subscribe(res => {
      if (res.successful && res.responseObject) {
        if (res.responseObject.acctNumber === accountNumber) {
          this.fieldsForm.controls['TransactionDetails'].get('IbanNumber')?.setValue(res.responseObject.ibanNumber);
        }
      }
    });
  };

  getDRCIntermediaryBank = (bicCode: string, remittanceCurrency: string) => {
    if (bicCode && remittanceCurrency) {
      const data = [
        {
          Name: 'swiftintermediary',
          searchterm: '',
          ParentValue: `${bicCode}_${remittanceCurrency}`,
        },
      ];

      this._transService.getDRCDropdownData(data).subscribe(res => {
        if (res.successful && res.responseObject) {
          this.fieldsForm.controls['BeneficiaryBankDetails']
            .get('IntermediaryBankBic')
            ?.setValue(res.responseObject.swiftintermediary[0]?.value);
        }
      });
    }
  };

  getCharges = (chargeOption: string): void => {
    const beneficiaryCountryCode = this.fieldsForm.controls['BeneficiaryBankDetails']?.value.BeneficiaryCountryCode;
    const productCode =
      this.fieldsForm.controls['TransactionDetails']?.value.ProductCode === 'LOCALSWIFT'
        ? 'SWIFT LOCAL'
        : this.fieldsForm.controls['TransactionDetails']?.value.ProductCode;
    const remittanceAmount = this.fieldsForm.controls['TransactionDetails']?.value.RemittanceAmount;
    const remittanceCurrency = this.fieldsForm.controls['TransactionDetails']?.value.RemittanceCurrency;
    const accountNumber = this.fieldsForm.controls['AccountDetails']?.value.AccountNumber;
    if (!remittanceAmount || !remittanceCurrency || !beneficiaryCountryCode) {
      this.showToast(
        '',
        'Make sure you have selected Remittance Amount & Currency and Beneficiary Country Code is set',
        MessageBoxType.INFO
      );
      this.fieldsForm.patchValue(
        {
          ChargeDetails: {
            ChargeOption: '',
            Amount: 0,
            AmountCurrency: '',
            NormalCharge: 0,
            VatAmount: 0,
            RscAmount: 0,
            SumOfCharges: 0,
          },
        },
        { emitEvent: false }
      );
      return;
    }
    this._transService
      .getCharges(
        beneficiaryCountryCode,
        productCode,
        remittanceAmount,
        chargeOption,
        remittanceCurrency,
        accountNumber
      )
      .subscribe((res: any) => {
        if (res.successful && res.responseObject) {
          const chargeDetails = this.buildChargeDetailsValue(chargeOption, res.responseObject);

          if (chargeOption === 'SHA') {
            this.fieldsForm.patchValue(
              {
                ChargeDetails: {
                  ...chargeDetails,
                  ChargeOption: 'SHA',
                },
              },
              { emitEvent: false }
            );
            return;
          }

          const dialogRef = this.dialog.open(ChargesDialog, {
            minWidth: '250px',
            data: { ...res.responseObject, countryCode: this.countryCode },
          });
          dialogRef.afterClosed().subscribe(option => {
            const fallback = getDefaultChargeOptionByCountry(this.countryCode);
            if (option === 'SHA' && fallback === 'SHA') return this.getCharges('SHA');
            if (option === 'SHA') return;

            this.fieldsForm.patchValue(
              {
                ChargeDetails: { ...chargeDetails, ChargeOption: option },
              },
              { emitEvent: false }
            );
          });
        }
      });
  };

  private buildChargeDetailsValue(chargeOption: string, chargeResponse: any): Record<string, unknown> {
    const chargeBreakdown = Array.isArray(chargeResponse?.charges) ? chargeResponse.charges : [];

    const findChargeAmount = (type: string): number => {
      const matchingCharge = chargeBreakdown.find((charge: any) => charge?.type === type);
      return Number(matchingCharge?.amount ?? 0);
    };

    return {
      ChargeOption: chargeOption,
      Amount: Number(chargeResponse?.totalChargeAmount ?? 0).toFixed(2),
      AmountCurrency: chargeResponse?.totalChargeCurrency ?? '',
      NormalCharge: Number(chargeResponse?.additionalChargeAmount ?? 0).toFixed(2),
      VatAmount: findChargeAmount('VatAmount').toFixed(2),
      RscAmount: findChargeAmount('RscAmount').toFixed(2),
      SumOfCharges: Number(chargeResponse?.sumOfCharges ?? 0).toFixed(2),
    };
  }

  populateGLAccDetailsData = (data: any, ticket: any): void => {
    this.fieldsForm.patchValue({
      AccountDetails: {
        FullName: data.accountName,
        AccountNumber: data.accountNumber,
        AccountCurrency: data.accountCurrency,
        IsGlAccount: this.dropdownOptions.headOffice,
      },
      RemitterAccountDetails: {
        OneEquityNr: ticket?.id?.toString(),
        UserName: ticket.userId,
        RequestingBranch: ticket.branchId,
        CountryCode: COUNTRY_CODES.find(code => code.bankId === ticket.bankId)?.countryCode,
      },
      TransactionDetails: {
        TransferType: this.taskData?.TransferType || this.contextData?.selectionForm?.transferType,
        ProductCode: this.transactionType,
        DebitAccountNumber: data.accountNumber,
        AccountCurrency: data.accountCurrency,
        DebitAccountName: this.filterSpecChars.transform(data.accountName),
        ChargeAccount: data.accountNumber,
        RemittanceAmount: this.taskData?.TransactionDetails?.RemittanceAmount,
        RemittanceCurrency: this.taskData?.TransactionDetails?.RemittanceCurrency,
        RemitterAddress2:
          this.transactionType === 'RTGS' &&
          this._sessionService.userCountryCode === 'KE' &&
          this.dropdownOptions.headOffice
            ? 'KE NAIROBI'
            : this.taskData.TransactionDetails?.RemitterAddress2,
      },
    });
  };

  populateAccDetailsInfoData = (data: any, ticket: any): void => {
    this.fieldsForm.patchValue({
      AccountDetails: {
        FirstName: data.firstName,
        FullName: data.accountName,
        LastName: data.lastName,
        IdNumber: data.identificationNumber,
        Cif: data.cif,
        AccountNumber: data.accountNumber,
        AccountCurrency: data.accountCurrency,
        AccountBalance: data.accountBalance,
        MobileNumber: data.phoneNumber1,
        EmailAddress: data.email,
        PostalAddress: data.postalAddress,
        Mandate: data.mandate,
      },
      RemitterAccountDetails: {
        OneEquityNr: ticket?.id?.toString(),
        UserName: ticket.userId,
        RequestingBranch: ticket.branchId,
        CountryCode: COUNTRY_CODES.find(code => code.bankId === ticket.bankId).countryCode,
      },
      TransactionDetails: {
        TransferType: this.taskData?.TransferType || this.contextData?.selectionForm?.transferType,
        ProductCode: this.transactionType,
        DebitAccountNumber: data.accountNumber,
        AccountCurrency: data.accountCurrency,
        RemittanceAmount: this.taskData?.TransactionDetails?.RemittanceAmount,
        RemittanceCurrency: this.taskData?.TransactionDetails?.RemittanceCurrency,
        RemitterAddress1: (data?.postalAddress).length > 33 ? (data?.postalAddress).slice(0, 33) : data?.postalAddress,
        RemitterAddress2:
          this.transactionType === 'RTGS' && this._sessionService.userCountryCode === 'KE'
            ? `KE ${data?.cityCodeDesc.replace(/\s+/g, '').slice(0, 30)}`
            : (data?.postalAddress).length > 33
              ? (data?.postalAddress).slice(33)
              : this.taskData.TransactionDetails?.RemitterAddress2,
        DebitAccountName: this.filterSpecChars.transform(data.accountName),
        ChargeAccount: data.accountNumber,
      },
      ExchangeDetails: {
        SearchByCif: data.cif,
      },
    });
  };

  ngOnDestroy(): void {
    this.saveTicketData();

    // Clear contextData from localStorage for this ticket
    if (this.ticket?.id) {
      this._transService.clearContextData(this.ticket.id);
    }

    if (this.destroy$) {
      this.destroy$.next('');
      this.destroy$.complete();
    }
  }

  saveTicketData(): void {
    if (this._transService.ticket.status === 'New' && !this.submitted && this.fieldsForm) {
      const form = JSON.stringify(this.fieldsForm.getRawValue());
      this._transService.updateTicketData(this._transService.ticket.id, { data: form }).subscribe(res => {
        if (res.successful && res.responseObject) {
          this.showToast(
            '',
            `Saved... Ticket ID: ${this._transService.ticket.id} can be continued`,
            MessageBoxType.SUCCESS
          );
        }
      });
    }
  }

  checkReturnedTicketData = (taskData: any): void => {
    if (taskData.BeneficiaryBankDetails.RoutingCode) {
      this.fieldsForm.controls['BeneficiaryBankDetails'].get('AccountWithInstitutionBic')?.setValidators(null);
      this.fieldsForm.controls['BeneficiaryBankDetails'].get('AccountWithInstitutionBic')?.updateValueAndValidity();
    }

    if (taskData.TransactionDetails.InstrumentType?.trim()) {
      // Note: These enable calls are redundant as setInstrumentRules is now triggered immediately
      // in ngAfterViewInit for initial values. Keeping for safety/fallback.
      this.fieldsForm.controls['TransactionDetails'].get('InstrumentDate')?.enable();
      this.fieldsForm.controls['TransactionDetails'].get('InstrumentNumber')?.enable();
    }
  };

  clearCreditAccountValues = (): void => {
    this.fieldsForm.patchValue({
      TransactionDetails: {
        CreditAccountNumber: '',
        CreditAccountName: '',
        ReceiverBIC: '',
      },
    });
  };

  setInstrumentRules = (type: string): void => {
    const instrumentNumberControl = this.fieldsForm.controls['TransactionDetails'].get('InstrumentNumber');
    const instrumentDateControl = this.fieldsForm.controls['TransactionDetails'].get('InstrumentDate');

    // Preserve existing async validators
    const existingAsyncValidators = instrumentNumberControl?.asyncValidator;
    const ruleDecision = getMt103InstrumentRuleDecision(type, this.countryCode);

    if (ruleDecision.clearDate) {
      instrumentDateControl?.setValue('');
    } else if (!instrumentDateControl?.value) {
      instrumentDateControl?.setValue('');
    }

    if (ruleDecision.clearNumber) {
      instrumentNumberControl?.setValue('');
    }

    instrumentDateControl?.setValidators(ruleDecision.dateValidatorsRequired ? [Validators.required] : null);
    if (ruleDecision.dateEnabled) {
      instrumentDateControl?.enable();
    } else {
      instrumentDateControl?.disable();
    }

    instrumentNumberControl?.setValidators(ruleDecision.numberValidatorsRequired ? [Validators.required] : null);
    if (existingAsyncValidators) {
      instrumentNumberControl?.setAsyncValidators(existingAsyncValidators);
    }
    if (ruleDecision.numberEnabled) {
      instrumentNumberControl?.enable();
    } else {
      instrumentNumberControl?.disable();
    }

    instrumentDateControl?.updateValueAndValidity();
    instrumentNumberControl?.updateValueAndValidity();
  };

  getBCCbyBIC = (bicCode: string): void => {
    if (bicCode) {
      const countryCodeFromBIC = bicCode.slice(4, 6);
      const productCode = this.fieldsForm.controls['TransactionDetails'].get('ProductCode')?.value;
      const remittanceCurrency = this.fieldsForm.controls['TransactionDetails'].get('RemittanceCurrency')?.value;
      const countryCode = this.fieldsForm.controls['RemitterAccountDetails'].get('CountryCode')?.value;
      if (countryCodeFromBIC) {
        this.fieldsForm.controls['BeneficiaryBankDetails'].get('BeneficiaryCountryCode')?.setValue(countryCodeFromBIC);
        this.fieldsForm.controls['BeneficiaryBankDetails'].get('RoutingCode')?.setValue('');
        this.fieldsForm.controls['BeneficiaryBankDetails'].get('RoutingCodeValue')?.setValue('');
        this.fieldsForm.controls['BeneficiaryBankDetails'].get('RoutingCodeValue')?.setValidators(null);
        this.fieldsForm.controls['BeneficiaryBankDetails'].get('RoutingCodeValue')?.updateValueAndValidity();
      }

      const cbkRemittanceDecision = getCbkRemittanceDecision(bicCode, this.countryCode, productCode);
      applyBeneficiaryBankControlClear(
        this.fieldsForm.controls['BeneficiaryBankDetails'] as UntypedFormGroup,
        'onBicSelect',
        {
          cbkRemittance: cbkRemittanceDecision,
        }
      );

      if (productCode === 'RTGS') {
        this.fieldsForm.patchValue({
          TransactionDetails: {
            ReceiverBIC: bicCode,
          },
        });

        this.toast.show('', `Receiver BIC "${bicCode}" set successfully!`, MessageBoxType.SUCCESS, 5000);
      }

      const receiverBic = findEapsDomesticReceiverBic({
        productCode,
        countryCode,
        remittanceCurrency,
        countryCodeFromBic: countryCodeFromBIC,
        creditAccountNumbers: this.dropdownOptions.creditAccountNumbers,
      });

      if (productCode === 'EAPS' && countryCode === remittanceCurrency.slice(0, 2)) {
        if (!receiverBic) {
          this.fieldsForm.patchValue(
            {
              BeneficiaryBankDetails: {
                AccountWithInstitutionBic: '',
                BeneficiaryCountryCode: '',
              },
            },
            { emitEvent: false }
          );

          this.toast.show(
            '',
            'Selected Account with Institution is not on the list for EAPS domestic currency',
            MessageBoxType.WARNING,
            5000
          );
          return;
        }

        this.fieldsForm.patchValue({
          TransactionDetails: {
            ReceiverBIC: receiverBic,
          },
        });

        this.toast.show(
          '',
          `Receiver BIC "${this.fieldsForm.controls['TransactionDetails'].get('ReceiverBIC')?.value}" set successfuly!`,
          MessageBoxType.SUCCESS,
          5000
        );
      }

      // Use current charge option or subsidiary default instead of hardcoding 'OUR'
      const chargeOptionToUse = resolveChargeOption(
        this.fieldsForm.controls['ChargeDetails'].get('ChargeOption')?.value,
        this.countryCode
      );

      this.getCharges(chargeOptionToUse);
    }
  };

  getBCCbyRoutingCode = (routingCode: string): void => {
    if (routingCode) {
      const routingCodeValueDecision = getRoutingCodeValueValidatorDecision(routingCode);
      const beneficiaryCountryCode = getBeneficiaryCountryCodeByRoutingCode(routingCode);
      applyBeneficiaryBankControlClear(
        this.fieldsForm.controls['BeneficiaryBankDetails'] as UntypedFormGroup,
        'onRoutingCodeSelect',
        {
          routingCodeValue: routingCodeValueDecision,
          countryCode: beneficiaryCountryCode,
        }
      );
    }
  };

  /**
   * Get beneficiary branch codes based on selected bank code
   * Called when BeneficiaryBankCode changes (DRC only)
   * For production: Uses static DRCBranchList data (endpoint not ready)
   * For non-production: Calls API endpoint
   */
  getBeneficiaryBranchCode = (bankId: string, bankCode: string): void => {
    if (!bankId || !bankCode) {
      this.staticBranchCodes = [];
      return;
    }

    // Production: Use static DRCBranchList data (endpoint not ready)
    if (environment.production) {
      // Check if bank code exists in DRCBranchList
      if ((DRCBranchList as any)[bankCode]) {
        // Map DrcBranchDetails to BranchDetails format
        this.staticBranchCodes = (DRCBranchList as any)[bankCode].map((branch: any) => ({
          bankCode: bankCode,
          branchCode: branch.branchCode,
          name: branch.name,
          shortName: branch.shortName,
          cityCode: '',
          stateCode: '',
          address1: '',
          address2: '',
          label: branch.name,
          code: branch.branchCode,
        }));
      } else {
        // Bank code not found in static data
        this.staticBranchCodes = [];
        this.toast.show('', 'No branch codes found for the selected bank', MessageBoxType.WARNING);
      }
      return;
    }

    // Non-production: Call API endpoint
    this._transService
      .getBeneficiaryBranchCode(bankId, bankCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.successful && response.responseObject) {
            this.staticBranchCodes = response.responseObject.item3;
          } else {
            this.staticBranchCodes = [];
            this.toast.show('', 'No branch codes found for the selected bank', MessageBoxType.WARNING);
          }
        },
        error: (error: any) => {
          this.staticBranchCodes = [];
          this.toast.show('', 'Failed to load branch codes', MessageBoxType.WARNING);
        },
      });
  };

  getChargeAccount = (accNumber: any, bankId: any): void => {
    let uriString = `?Id=${accNumber}&bankId=${bankId}&idType=accountid`;

    this.accountService
      .getAccount(uriString)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: { successful: any; responseObject: { accounts: any[] } }) => {
          if (res.successful && res.responseObject) {
            try {
              let hasDormant;
              res.responseObject.accounts.forEach(v => {
                hasDormant = v.accountStatus === 'D' && (v.mandate === 'ETS' || v.mandate === 'SELF');
              });

              if (!hasDormant) {
                this.fieldsForm.controls['TransactionDetails']
                  .get('ChargeAccount')
                  ?.setValue(accNumber, { emitEvent: false });

                this.toast.show(
                  '',
                  `Account number ${accNumber} set as Charges Account successfuly!`,
                  MessageBoxType.SUCCESS,
                  5000
                );
              }
            } catch (e) {
              // Error setting charge account value
            }
          } else {
            this.fieldsForm.controls['TransactionDetails']
              .get('ChargeAccount')
              ?.setValue(this.fieldsForm.controls['TransactionDetails'].get('DebitAccountNumber')?.value, {
                emitEvent: false,
              });

            this.toast.show(
              '',
              `Account number doesn't exist or is Dormant. Charges Account defaulted to Debit Account!`,
              MessageBoxType.WARNING,
              5000
            );
          }
        },
        (err: { statusMessage: any }) => {
          this.toast.show('', err.statusMessage, MessageBoxType.DANGER, 7000);
        }
      );
  };

  getCreditAccountName = (creditAccountNumber: any, bankId: any): void => {
    if (creditAccountNumber) {
      this._transService
        .getCreditName(creditAccountNumber, bankId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: { successful: any; responseObject: { accountName: any }; statusMessage: any }) => {
            if (res.successful && res.responseObject) {
              const creditAccountName = res.responseObject.accountName.replace('&', 'AND');
              this.fieldsForm.controls['TransactionDetails']
                .get('CreditAccountName')
                ?.setValue(this.filterSpecChars.transform(creditAccountName), {
                  emitEvent: false,
                });

              this.toast.show(
                '',
                `Credit Account Number and Credit Account Name set successfully!`,
                MessageBoxType.SUCCESS,
                5000
              );
            } else {
              this.toast.show('', res.statusMessage, MessageBoxType.DANGER, 7000);
            }
          },
          (err: { statusMessage: any }) => {
            this.toast.show('', err.statusMessage, MessageBoxType.DANGER, 7000);
          }
        );
    }
  };

  updateRemitterAddress = (): void => {
    const dialogRef = this.dialog.open(UpdateAddressDialog, {
      minWidth: '250px',
      data: {
        regions: this.dataOptionsDRC.drcRegions,
        states: this.dataOptionsDRC.drcStates,
        townCities: this.cityOptionsDRC.cities,
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res?.data) {
        const data = {
          CustomerId: this.fieldsForm.controls['AccountDetails'].value.Cif,
          AddressCategory: 'Mailing',
          AddressLine1: res.data.RemitterAddressLine1,
          AddressLine2: `${res.data.StateName} ${res.data.TownCityName} ${res.data.CountryCode}`,
          AddressLine3: '',
          PreferredAddress: true,
          City: res.data.TownCity,
          Region: res.data.Region,
          State: res.data.State,
          Country: res.data.CountryCode,
        };

        this._transService.updateRemitterAddress(this.ticket.id.toString(), data).subscribe(updateRes => {
          if (updateRes.successful) {
            this.fieldsForm.patchValue({
              TransactionDetails: {
                RemitterAddress1: res.data.RemitterAddressLine1,
                RemitterAddress2: `${res.data.StateName} ${res.data.TownCityName} ${res.data.CountryCode}`,
              },
            });
          }
        });
      }
    });
  };

  fetchCreditAccountValues = (): void => {
    const countryCode = this.fieldsForm.controls['RemitterAccountDetails'].get('CountryCode')?.value;
    const remittanceCurrency = this.fieldsForm.controls['TransactionDetails'].get('RemittanceCurrency')?.value;
    const productCodeRaw = this.fieldsForm.controls['TransactionDetails'].get('ProductCode')?.value;
    const branchCode = this.fieldsForm.controls['RemitterAccountDetails'].get('RequestingBranch')?.value;

    // Transform productCode to match backend format (same as charges API)
    const productCode = productCodeRaw === 'LOCALSWIFT' ? 'SWIFT LOCAL' : productCodeRaw;

    const creditAccountValues = this.dropdownOptions.creditAccountNumbers.find(
      (creditAccountNumber: { countryCode: any; currency: any; productCode: any; branchCode: string }) =>
        creditAccountNumber.countryCode === countryCode &&
        creditAccountNumber.currency === remittanceCurrency &&
        creditAccountNumber.productCode === productCode &&
        (creditAccountNumber.branchCode === branchCode || creditAccountNumber.branchCode.toLocaleLowerCase() === 'all')
    );

    if (!creditAccountValues) {
      this.fieldsForm.patchValue({
        TransactionDetails: {
          CreditAccountNumber: '',
          CreditAccountName: '',
        },
      });

      this.toast.show(
        '',
        `Selected Remittance Currency is not supported for this Product Code, please select correct!`,
        MessageBoxType.WARNING,
        5000
      );
      return;
    }

    this.fieldsForm.patchValue({
      TransactionDetails: {
        CreditAccountNumber: creditAccountValues.accountNumber,
      },
    });

    this.setReceiverBIC();
  };

  setReceiverBIC = (): void => {
    const countryCode = this.fieldsForm.controls['RemitterAccountDetails'].get('CountryCode')?.value;
    const remittanceCurrency = this.fieldsForm.controls['TransactionDetails'].get('RemittanceCurrency')?.value;
    const productCode = this.fieldsForm.controls['TransactionDetails'].get('ProductCode')?.value;

    if (productCode === 'EAPS' && countryCode === remittanceCurrency.slice(0, 2)) {
      this.toast.show(
        '',
        ` Select Receiver BIC by selecting corresponding
            Account with Institution for EAPS`,
        MessageBoxType.WARNING,
        5000
      );

      return;
    }

    if (productCode !== 'RTGS') {
      const branchCode = this.fieldsForm.controls['RemitterAccountDetails'].get('RequestingBranch')?.value;
      const creditAccountNumber = this.fieldsForm.controls['TransactionDetails'].get('CreditAccountNumber')?.value;

      const receiverBics = this.dropdownOptions.creditAccountNumbers.find(
        (bics: { countryCode: any; currency: any; accountNumber: any; productCode: any; branchCode: string }) =>
          bics.countryCode === countryCode &&
          bics.currency === remittanceCurrency &&
          bics.accountNumber === creditAccountNumber &&
          (bics.productCode === productCode ||
            (bics.productCode === 'LOCALSWIFT' && productCode === 'SWIFT LOCAL') ||
            (bics.productCode === 'SWIFT LOCAL' && productCode === 'LOCALSWIFT')) &&
          (bics.branchCode === branchCode || bics.branchCode.toLocaleLowerCase() === 'all')
      );

      if (receiverBics && receiverBics.receiverBic) {
        this.fieldsForm.patchValue({
          TransactionDetails: {
            ReceiverBIC: receiverBics.receiverBic,
          },
        });

        this.toast.show(
          '',
          `Receiver BIC "${this.fieldsForm.controls['TransactionDetails'].get('ReceiverBIC')?.value}" set successfuly!`,
          MessageBoxType.SUCCESS,
          5000
        );
      }
    } else {
      // RTGS charge defaults by subsidiary: CD->OUR, KE->SHA, Others->no default
      let chargeDefault = '';
      if (this.countryCode === 'CD') {
        chargeDefault = 'OUR';
      } else if (this.countryCode === 'KE') {
        chargeDefault = 'SHA';
      }
      // Other subsidiaries (RW, UG, SS, TZ) have no default - user must select
      this.fieldsForm.controls['ChargeDetails'].get('ChargeOption')?.setValue(chargeDefault);
    }
  };

  getExchangeRates = (): void => {
    this.fieldsForm.controls['ExchangeDetails'].get('TicketNumber')?.setValue('');

    const data = {
      accountNumber: this.fieldsForm.controls['TransactionDetails'].get('DebitAccountNumber')?.value,
      fromCurrency: this.fieldsForm.controls['TransactionDetails'].get('AccountCurrency')?.value,
      toCurrency: this.fieldsForm.controls['TransactionDetails'].get('RemittanceCurrency')?.value,
      fromAmount: +this.fieldsForm.controls['TransactionDetails'].get('RemittanceAmount')?.value,
    };

    if (data.fromCurrency === data.toCurrency && data.fromAmount) {
      this.fieldsForm.patchValue(
        buildMt103SameCurrencyExchangeDetails(
          data.fromAmount,
          this.fieldsForm.controls['TransactionDetails'].get('AccountCurrency')?.value
        ),
        { emitEvent: false }
      );

      return;
    }

    if (data.toCurrency && data.fromAmount) {
      this._transService
        .getExchangeRates(data)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res.successful && res.responseObject) {
              let result = res.responseObject;
              const convertedAmount = calculateMt103ConvertedAmount({
                rateCode: result.rateCode,
                fromCurrency: data.fromCurrency,
                toCurrency: data.toCurrency,
                fromAmount: result.fromAmount,
                rate: result.rate,
              });

              this.fieldsForm.patchValue(
                {
                  TransactionDetails: {
                    RemittanceAmount: data.fromAmount.toFixed(2),
                  },
                  ExchangeDetails: {
                    RateCode: res.responseObject.rateCode,
                    ExchangeRate: res.responseObject.rate.toString(),
                    BaseExchangeRate: res.responseObject.rate.toString(),
                    ConvertedCurrency: this.fieldsForm.controls['TransactionDetails'].get('AccountCurrency')?.value,
                    ConvertedAmount: convertedAmount?.toString(),
                  },
                },
                { emitEvent: false }
              );
            } else {
              this.toast.show('', res.statusMessage, MessageBoxType.WARNING, 5000);
            }
          },
          (err: { statusMessage: any }) => {
            this.toast.show('', err.statusMessage, MessageBoxType.DANGER, 7000);
          }
        );

      // const above$10000 = {
      //   accountNumber: data.accountNumber,
      //   fromCurrency: data.fromCurrency,
      //   toCurrency: 'USD',
      //   fromAmount: data.fromAmount.toFixed(2),
      //   bankId: this.taskData.bankId,
      //
      // }
      // this.getTransactionAmountLimit(above$10000)
    }
  };

  getSpecialExchangeRates = (): void => {
    const data = {
      BankID: this.ticket.bankId,
      Cif: this.fieldsForm.controls['AccountDetails'].value.Cif,
      RefNo: this.fieldsForm.controls['ExchangeDetails'].value.TicketNumber, // ticket number
    };

    this._transService
      .getSpecialExchangeRates(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (res.successful && res.responseObject) {
            let result = res.responseObject;

            const rateCode = this.fieldsForm.controls['ExchangeDetails'].get('RateCode')?.value;
            const remittanceAmount = +this.fieldsForm.controls['TransactionDetails'].get('RemittanceAmount')?.value;
            const remittanceCurrency = this.fieldsForm.controls['TransactionDetails'].get('RemittanceCurrency')?.value;
            const convertedCurrency = this.fieldsForm.controls['TransactionDetails'].get('AccountCurrency')?.value;
            const dealAmount = +res.responseObject.dealAmmount;

            if (remittanceAmount !== dealAmount) {
              this.toast.show(
                '',
                `Specified Remittance Amount is not the same as Deal Amount,
                            please enter correct!`,
                MessageBoxType.WARNING,
                5000
              );

              this.fieldsForm.controls['ExchangeDetails'].get('TicketNumber')?.setValue('');

              return;
            }

            const convertedAmount = calculateMt103SpecialConvertedAmount({
              rateCode,
              remittanceCurrency,
              convertedCurrency,
              remittanceAmount,
              dealRate: result.dealRate,
            });

            this.fieldsForm.patchValue({
              ExchangeDetails: {
                ExchangeRate: result.dealRate.toString(),
                TreasuryRate: result.treasuryRate.toString(),
                ConvertedAmount: convertedAmount,
              },
            });
          } else {
            this.toast.show('', res.statusMessage, MessageBoxType.WARNING, 5000);

            this.fieldsForm.controls['ExchangeDetails'].get('TicketNumber')?.setValue('');
          }
        },
        (err: { statusMessage: string }) => {
          this.toast.show('', err.statusMessage, MessageBoxType.DANGER, 7000);
        }
      );
  };

  back = () => this.router.navigate(['/services/']);

  getSelectedDocuments = (event: any[]): void => {
    this.documents = event;
  };

  logErrors(fieldsForm: any): void {
    Object.keys(fieldsForm.controls).forEach(key => {
      const controlErrors: any = fieldsForm.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          // Form validation error: key, keyError, controlErrors[keyError]
        });
      }
    });
  }

  // Main submit function called by the button
  submit(): void {
    // Validate balance for non-head office
    if (!this.dropdownOptions.headOffice) {
      const selectedAccount = this.contextData.accounts.accounts.find(
        (account: any) => account.accountNumber === this.accountDetailsInfo?.accountNumber
      );

      if (selectedAccount) {
        const convertedAmount = +this.fieldsForm.controls['ExchangeDetails']?.get('ConvertedAmount')?.value;
        if (!isNaN(selectedAccount.availableBalance)) {
          const enoughBalanceToPayAmount = +selectedAccount.availableBalance > +convertedAmount;
          if (!enoughBalanceToPayAmount) {
            this.toast.show(null, this.translate.instant(`COMMON.ERROR.NOT_REQUIRED_BALANCE`), MessageBoxType.DANGER);
            return;
          }
        }
      }
    }

    // Check for required documents
    const requiredExists =
      this.uploads.some(doc => doc.name.toLowerCase() === 'customer instruction') ||
      this.documents.some(doc => doc.documentName.toLowerCase() === 'customer instruction');

    if (!requiredExists) {
      this.toast.show(null, `COMMON.ERROR.DOCUMENT_SELECTION`, MessageBoxType.INFO);
      return;
    }

    const ticketId = this.ticket.id.toString();
    this.completeSubmission(ticketId);
  }

  // Main submission orchestrator
  completeSubmission(ticketId: string): void {
    // Check if we need to upload documents
    const needsDocumentUpload = this.needsDocumentUpload();

    if (!needsDocumentUpload) {
      // No documents to upload, submit ticket directly
      this.submitTicket(ticketId);
      return;
    }

    // Upload documents based on country
    this.uploadDocumentsByCountry(ticketId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => this.handleUploadSuccess(response, ticketId),
        error: error => this.handleUploadError(error),
      });
  }

  private needsDocumentUpload(): boolean {
    // All subsidiaries support document upload
    const supportedCountries = ['KE', 'CD', 'RW', 'UG', 'SS', 'TZ'];
    const hasDocuments =
      (this.documents && this.documents.length > 0) ||
      (this.uploadsToSendToServer && this.uploadsToSendToServer.length > 0);

    return supportedCountries.includes(this.countryCode) && hasDocuments;
  }

  private uploadDocumentsByCountry(ticketId: string): Observable<any> {
    const strategy = selectMt103UploadStrategy(this.countryCode);

    switch (strategy) {
      case 'KE':
        return this.uploadDocumentsForKenya(ticketId);
      case 'CD':
        return this.uploadDocumentsForCongo(ticketId);
      default:
        return this.uploadDocumentsForOtherSubsidiaries(ticketId);
    }
  }

  private uploadDocumentsForKenya(ticketId: string): Observable<any> {
    const accountDetails = this.fieldsForm.controls['AccountDetails'];
    const remitterDetails = this.fieldsForm.controls['RemitterAccountDetails'];

    const payload = buildKenyaUploadPayload(
      {
        Cif: accountDetails?.get('Cif')?.value,
        AccountNumber: accountDetails?.get('AccountNumber')?.value,
        IdNumber: accountDetails?.get('IdNumber')?.value,
      },
      {
        CountryCode: remitterDetails?.get('CountryCode')?.value,
      },
      ticketId,
      this.documents
    );

    return this._transService.uploadDocuments(payload);
  }

  private uploadDocumentsForOtherSubsidiaries(ticketId: string): Observable<any> {
    const accountDetails = this.fieldsForm.controls['AccountDetails'];
    const remitterDetails = this.fieldsForm.controls['RemitterAccountDetails'];

    const payload = buildDefaultUploadPayload(
      {
        Cif: accountDetails?.get('Cif')?.value,
        AccountNumber: accountDetails?.get('AccountNumber')?.value,
        IdNumber: accountDetails?.get('IdNumber')?.value,
      },
      {
        CountryCode: remitterDetails?.get('CountryCode')?.value,
      },
      ticketId,
      this.documents
    );

    return this._transService.uploadDocuments(payload);
  }

  private uploadDocumentsForCongo(ticketId: string): Observable<any> {
    const accountDetails = this.fieldsForm.value['AccountDetails'];
    const payload = buildCongoUploadPayload(
      {
        Cif: accountDetails['Cif'],
        AccountNumber: accountDetails['AccountNumber'],
      },
      ticketId,
      this.uploadsToSendToServer
    );

    return this._transService.uploadDocumentsV3(payload);
  }

  private handleUploadSuccess(
    response: { successful: boolean; responseObject: any; statusMessage?: string },
    ticketId: string
  ): void {
    if (!response.successful || !response.responseObject) {
      this.toast.show('', 'Failed to upload documents', MessageBoxType.DANGER);
      return;
    }

    const uploadedDocs = response.responseObject;
    const failedDocs = aggregateFailedDocuments(uploadedDocs, this.documents);

    if (failedDocs.length > 0) {
      this.toast.show('', formatFailedDocumentsErrorMessage(failedDocs), MessageBoxType.DANGER);
      return;
    }

    // Show success message
    if (shouldShowMt103UploadSuccessMessage(this.documents.length)) {
      this.toast.show('', 'Documents uploaded successfully!', MessageBoxType.SUCCESS);
    }

    // Submit ticket with cleanup for CD, direct submit for others
    this.finalizeSubmission(uploadedDocs, ticketId);
  }

  private finalizeSubmission(uploadedDocs: any[], ticketId: string): void {
    const plan = buildMt103FinalizationPlan(this.countryCode, uploadedDocs);

    if (plan.requiresCongoCleanup) {
      this.cleanUpDocumentsForCongo(plan.documentIds, ticketId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.submitTicket(ticketId);
          },
          error: error => {
            const feedback = resolveMt103CleanupFailureFeedback();
            this.toast.show(feedback.title, feedback.message, feedback.type);
          },
        });
    } else {
      this.submitTicket(ticketId);
    }
  }

  private cleanUpDocumentsForCongo(documentIds: string[], ticketId: string): Observable<any> {
    const cif = this.fieldsForm.value['AccountDetails']['Cif'];

    const payload = buildMt103CongoCleanupPayload(cif, documentIds);

    return this._transService.cleanUpDocuments(payload, ticketId);
  }

  private handleUploadError(error: any): void {
    const feedback = resolveMt103UploadErrorFeedback(error);
    this.toast.show(feedback.title, feedback.message, feedback.type);
  }

  submitTicket(ticketId: any) {
    // Get raw form data and apply all restructuring transformations
    const rawFormData = this.fieldsForm.getRawValue();
    const formData = restructureMt103FormData(rawFormData, this.countryCode, this.transactionType);

    this._transService
      .submitTicket(ticketId, formData, 'mt103')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        res => {
          if (res.successful && res.responseObject) {
            const feedback = resolveMt103SubmissionSuccessFeedback(this._transService.ticket.id);
            this.submitted = true;
            this.toast.show(feedback.title, feedback.message, feedback.type);
            this.router.navigateByUrl(feedback.redirectUrl);
          }
        },
        err => {
          this.handleSubmissionError(err);
        }
      );
  }

  clear(): void {
    this.fieldsForm.reset();
    this.actionForm.reset();
    this.documents = [];
  }

  handleSubmissionError(error: any): void {
    const feedback = resolveMt103SubmissionErrorFeedback(error, this.countryCode);

    if (feedback.requiresLicenseDocumentUpdate) {
      this.updateLicenseDocumentValidation();
      this.toast.show(feedback.title, feedback.message, feedback.type);
    } else {
      this.toast.show(feedback.title, feedback.message, feedback.type);
    }
  }

  private updateLicenseDocumentValidation(): void {
    const { updatedDocuments, documents, docValidators } = buildMt103LicenseValidationRefresh(this.DRCRequiredDocs);

    if (updatedDocuments.length > 0) {
      this.docValidators = docValidators;

      this.DRCRequiredDocs = [...documents];

      // Rebuild the form validators
      this.initializeRequiredDocumentsForm();

      this.cdr.detectChanges();

      this.validateAllForms();

      // Also refresh currency options to ensure they're still correct
      this.updateCurrencyOptions();
    }
  }

  /**
   * Marks license documents as required for SWIFT transactions
   * This runs during document initialization, not just on error
   */
  private markLicenseDocumentsAsRequiredForSwift(): void {
    this.DRCRequiredDocs = markLicenseDocumentsAsRequired(this.DRCRequiredDocs, this.transactionType === 'SWIFT');
  }

  showToast(title: string, text: string, type: MessageBoxType): void {
    this.toast.show(title, text, type, 1500);
    this.toast
      .dismissed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});
  }

  /**
   * Checks if all forms are valid for submission
   * @returns boolean indicating if all forms are valid
   */
  get isFormValid(): boolean {
    try {
      // Early return if components aren't initialized yet
      if (!this.fieldsForm) {
        return false;
      }

      const formsToValidate = [
        { name: 'fieldsForm', form: this.fieldsForm },
        { name: 'RequiredDocumentsForm', form: this.RequiredDocumentsForm },
      ];

      // Check main forms
      for (const formGroup of formsToValidate) {
        if (!formGroup.form?.valid) {
          return false;
        }
      }

      // Check individual component forms
      const componentForms = [
        { name: 'AccountDetails', component: this.AccComp },
        { name: 'RemitterAccountDetails', component: this.RemAccComp },
        { name: 'TransactionDetails', component: this.TransComp },
        { name: 'BeneficiaryDetails', component: this.BenComp },
        { name: 'BeneficiaryBankDetails', component: this.BenBankComp },
        { name: 'SenderToReceiver', component: this.SenToRecComp },
        { name: 'ChargeDetails', component: this.ChargeDetailComp },
        { name: 'ExchangeDetails', component: this.ExcDetailComp },
        { name: 'Additional', component: this.AdditionalComp },
      ];

      // Add license details for DRC
      if (this.countryCode === 'CD' && this.transactionType !== 'RTGS') {
        componentForms.push({ name: 'LicenseDetails', component: this.LicenseDetailComp });
      }

      for (const compForm of componentForms) {
        if (compForm.component?.form && !compForm.component.form.valid) {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Force validation check and update UI
   */
  public validateAllForms(): void {
    // Mark all fields as touched to show validation errors
    if (this.fieldsForm) {
      this.fieldsForm.markAllAsTouched();
    }
    if (this.RequiredDocumentsForm) {
      this.RequiredDocumentsForm.markAllAsTouched();
    }

    // Trigger change detection
    this.cdr.detectChanges();
  }

  getRequiredDocsV3() {
    let finalList: any[] = [];

    if (this._transService.ticket.status.toLowerCase() === 'returned') {
      const currentDocuments = this.returnedTicketDocuments[0].responseObject;
      const requiredDocuments = this.returnedTicketDocuments[1].responseObject?.taskData.documentData.documents;

      // Create array of observables for documents that need blob data
      const blobRequests = requiredDocuments.map((requiredDoc: any) => {
        let matchingCurrentDoc = currentDocuments.find(
          (currentDoc: any) => currentDoc.filename.toLowerCase() === requiredDoc.fileName.toLowerCase()
        );

        if (matchingCurrentDoc?.id) {
          // Return observable that will fetch blob data and merge it
          return this.getDocumentsBlob(matchingCurrentDoc).pipe(
            map((b64: any) => {
              return {
                ...requiredDoc,
                ...matchingCurrentDoc,
                file: b64,
                filePresent: true,
              };
            })
          );
        } else {
          // Return observable with just the merged data (no blob needed)
          return of(
            matchingCurrentDoc
              ? { ...requiredDoc, ...matchingCurrentDoc, filePresent: true }
              : { ...requiredDoc, filePresent: false }
          );
        }
      });

      // Execute all blob requests and build final list
      forkJoin(blobRequests).subscribe({
        next: (results: any) => {
          finalList = results;
          this.DRCRequiredDocs = finalList;
          this.markLicenseDocumentsAsRequiredForSwift();
          this.buildDocValidators();
        },
        error: (error: any) => {
          // Fallback: build list without blob data
          this.buildFinalListWithoutBlob(requiredDocuments, currentDocuments);
        },
      });
    } else {
      // TODO:: handle null Check

      if (this.countryCode === 'CD') {
        // console.error('-------DRCRequiredDocs----------', this.countryCode)

        this.DRCRequiredDocs = this.requiredDocuments?.taskData?.documentData?.documents;
        this.markLicenseDocumentsAsRequiredForSwift();
      }
      this.buildDocValidators();
    }
  }

  private buildFinalListWithoutBlob(requiredDocuments: any[], currentDocuments: any[]) {
    const finalList = buildMergedReturnedTicketDocuments(requiredDocuments, currentDocuments);

    this.DRCRequiredDocs = finalList;
    this.markLicenseDocumentsAsRequiredForSwift();
    this.buildDocValidators();
  }

  private buildDocValidators() {
    this.docValidators = buildReturnedTicketDocValidators(this.DRCRequiredDocs);
    this.initializeRequiredDocumentsForm();
  }

  initializeRequiredDocumentsForm() {
    const documentArray = this.RequiredDocumentsForm.get('documents') as FormArray;
    documentArray.clear();
    documentArray.controls.forEach(control => {
      control.clearValidators();
      control.updateValueAndValidity();
    });
    this.DRCRequiredDocs.forEach(doc => {
      const validation = this.docValidators.find(v => v.fileName === doc.fileName);
      const validators = validation && validation.required ? [Validators.required] : [];

      const formName = this.mergeStringWithUnderscores(doc.fileName);
      documentArray.push(
        this.fb.group({
          name: [formName],
          value: ['', validators],
        })
      );
    });
  }

  updateDocuments(
    docData: {
      document: {
        data: string;
        docCode: string;
        filename: string;
        format: string;
      };
      file?: any;
    }[]
  ) {
    const docInfo = this.DRCRequiredDocs;
    const docArray = this.RequiredDocumentsForm.get('documents') as FormArray;
    const docValidators = this.docValidators;
    this.uploads = this._transService.updateRequiredTransactionDocs(docData, docInfo, docArray, docValidators);
  }

  mergeStringWithUnderscores(inputString: string) {
    return mergeStringWithUnderscores(inputString);
  }

  getDocumentsBlob(obj: any) {
    const data = {
      id: obj.id.toString(),
      service: 'Blob',
    };
    return this._transService.getTicketDocsV2(data).pipe(
      mergeMap((stream: any) => {
        return from(
          new Promise((resolve, _) => {
            // Extract file extension
            const extension = obj?.fileNameWithExtension?.split('.').pop()?.toLowerCase();

            // Map extensions to MIME types
            const mimeTypes: { [key: string]: string } = {
              pdf: 'application/pdf',
              png: 'image/png',
              jpg: 'image/jpeg',
              jpeg: 'image/jpeg',
            };

            // Get content type or default to octet-stream
            const contentType = mimeTypes[extension || ''] || 'application/octet-stream';

            // console.error('----------contentType-----------', contentType);

            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(new Blob([stream], { type: contentType }));
          })
        );
      }),
      takeUntil(this.destroy$)
    );
  }

  isPurposeCodeRequired(): boolean {
    return isPurposeCodeRequired(this.countryCode, this.subsidiariesWithPurposeCode);
  }

  /**
   * Triggers validation update for all form controls and nested form groups
   * Ensures validation states are properly reflected in the UI after form patching
   */
  private triggerFormValidation(): void {
    if (!this.fieldsForm) {
      return;
    }

    // Update all top-level form controls
    Object.keys(this.fieldsForm.controls).forEach(controlKey => {
      const control = this.fieldsForm.get(controlKey);
      if (control) {
        // For nested form groups, update all nested controls
        if (control instanceof UntypedFormGroup) {
          Object.keys(control.controls).forEach(nestedKey => {
            const nestedControl = control.get(nestedKey);
            nestedControl?.updateValueAndValidity({ emitEvent: false });
          });
        }
        // Update the control itself
        control.updateValueAndValidity({ emitEvent: false });
      }
    });

    // Update the entire form
    this.fieldsForm.updateValueAndValidity({ emitEvent: false });

    // Trigger change detection to update UI
    this.cdr.detectChanges();
  }

  isCountrySpecificRequired(countryCode: string | string[]): boolean {
    return isCountrySpecificRequired(this._sessionService.userCountryCode, countryCode);
  }

  getLicenseNumber1MaxLength(): number {
    return getLicenseNumber1MaxLength(this.countryCode, this.transactionType);
  }

  /**
   * Note: Charge options configuration is now handled inline in ChargeDetailsFields initialization.
   * For DRC: Only 'OUR' is selectable (other options disabled)
   * For other subsidiaries: All charge options are selectable
   */

  /**
   * Get filtered currency options based on transaction type
   * @returns Array of currency options for the current transaction type
   */
  private getFilteredCurrencies(): any[] {
    const currentTransactionType =
      this.transactionType || this._transService.contextData?.selectionForm?.transactionType;

    return getFilteredMt103Currencies(
      currentTransactionType,
      this._sessionService.userCountryCode,
      this.dropdownOptions.remittanceCurrencies
    );
  }

  /**
   * Update currency options based on current transaction type
   */
  private updateCurrencyOptions(): void {
    try {
      // Get the RemittanceCurrency field from TransactionDetailsFields
      const currencyField = this.TransactionDetailsFields.find(field => field.key === 'RemittanceCurrency');

      if (!currencyField) {
        console.warn('[CURRENCY_UPDATE] RemittanceCurrency field not found in TransactionDetailsFields');
        return;
      }

      const oldOptions = currencyField.options;
      const newOptions = this.getFilteredCurrencies();

      // Update the field options
      currencyField.options = newOptions;

      // console.log('[CURRENCY_UPDATE] Updated currency field options from',
      //   oldOptions?.length || 0, 'to', newOptions.length, 'currencies');

      // Check if current selection is still valid
      const currentCurrency = this.fieldsForm?.controls['TransactionDetails']?.get('RemittanceCurrency')?.value;
      const isCurrentCurrencyValid = newOptions.some(option => option.value === currentCurrency);

      // Clear invalid selection
      if (currentCurrency && !isCurrentCurrencyValid) {
        this.fieldsForm?.controls['TransactionDetails']?.get('RemittanceCurrency')?.setValue('');
      }

      // Trigger change detection to update UI
      this.cdr.detectChanges();
    } catch (error) {
      console.error('[CURRENCY_UPDATE] Error updating currency options:', error);
    }
  }

  RemittanceInfo1Validation() {
    return getRemittanceInfo1MaxLength(
      this._transService?.contextData.selectionForm?.transactionType,
      this._sessionService.userCountryCode
    );
  }
}

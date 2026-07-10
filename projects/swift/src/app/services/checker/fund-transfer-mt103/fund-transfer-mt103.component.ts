import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageBoxType, ToastService } from '@shared/modules/toast';
import { TransactionsService } from '../../../../core/services';
import { FIELD_TYPES } from '@shared/dynamic-form';
import { FIELDS, PROCESSES, REQUIRED_DOCS } from '@shared/static';
import { TransactionsStatusType, TransactionsUpdateTicketPayload } from '../../../../core/models/transactions.model';
import { SessionService } from '@shared/services';
import {
  ACCOUNT_DETAILS_FIELDS,
  ADDITIONAL_FIELDS,
  CHARGE_DETAILS_FIELDS,
  EXCHANGE_DETAILS_FIELDS,
  REMITTER_ACC_DETAILS_FIELDS,
  SENDER_TO_RECEIVER_INFORMATION_FIELDS,
} from '../../transactions/fund-transfer-mt103/mt103-field-definitions';
import { normalizeMt103CheckerChargeDetails } from './mt103-charge-details-normalizer';
import { filterMt103CheckerFieldsWithValues } from './mt103-field-filter';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  imports: [...COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-fund-transfer-mt103',
  templateUrl: './fund-transfer-mt103.component.html',
  styleUrls: ['./fund-transfer-mt103.component.scss'],
})
export class FundTransferMt103Component implements OnInit {
  actionForm!: UntypedFormGroup;
  accountFormFields: any[] = ACCOUNT_DETAILS_FIELDS.map(field => ({ ...field }));
  remitterAccDetailsFields: any[] = REMITTER_ACC_DETAILS_FIELDS.map(field => ({ ...field }));
  TransactionDetailsFields: any[] = [
    {
      id: 1,
      order: 1,
      key: 'TransferType',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.TRANSFER_TYPE',
      value: '',
      required: true,
      readonly: true,
    },
    {
      id: 2,
      order: 2,
      key: 'ProductCode',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.PRODUCT_CODE',
      value: '',
      readonly: true,
    },
    {
      id: 3,
      order: 3,
      key: 'RelatedRefNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.RELATED_REFERENCE_NUMBER',
      value: '',
      readonly: true,
    },
    {
      id: 4,
      order: 4,
      key: 'DebitAccountNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.DEBIT_ACCOUNT_NUMBER',
      value: '',
      readonly: true,
    },
    {
      id: 6,
      order: 6,
      key: 'AccountCurrency',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.ACCOUNT_CURRENCY',
      value: '',
      readonly: true,
    },
    {
      id: 7,
      order: 7,
      key: 'DebitAccountName',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.DEBIT_ACCOUNT_NAME',
      value: '',
      readonly: true,
    },
    {
      id: 8,
      order: 8,
      key: 'ChargeAccount',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.CHARGE_ACCOUNT_NUMBER',
      value: '',
      readonly: true,
    },
    {
      id: 9,
      order: 9,
      key: 'RemittanceCurrency',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.REMITTANCE_CURRENCY',
      value: '',
      required: true,
    },
    {
      id: 10,
      order: 10,
      key: 'RemittanceAmount',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.REMITTANCE_AMOUNT',
      value: '',
      required: true,
      autocomplete: 'off',
    },
    {
      id: 11,
      order: 11,
      key: 'DebitValueDate',
      field_type: FIELD_TYPES.DATETIME,
      label: 'FIELDS.DEBIT_VALUE_DATE',
      value: '',
      readonly: true,
      autocomplete: 'off',
    },
    {
      id: 12,
      order: 12,
      key: 'RemitterAddress1',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.REMITTERS_PHYSICAL_ADDRESS_1.LABEL',
      value: '',
      maximum: 33,
      required: true,
      autocomplete: 'off',
    },
    {
      id: 13,
      order: 13,
      key: 'RemitterAddress2',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.REMITTER_ADDRESS_2.LABEL',
      value: '',
      maximum: 33,
      required: true,
      autocomplete: 'off',
    },
    {
      id: 14,
      order: 14,
      key: 'InstrumentType',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.INSTRUMENT_TYPE',
      value: '',
    },
    {
      id: 15,
      order: 15,
      key: 'InstrumentDate',
      field_type: FIELD_TYPES.DATETIME,
      label: 'FIELDS.INSTRUMENT_DATE',
      value: '',
      autocomplete: 'off',
    },
    {
      id: 16,
      order: 16,
      key: 'InstrumentNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.INSTRUMENT_NUMBER',
      value: '',
      autocomplete: 'off',
    },
    {
      id: 17,
      order: 17,
      key: 'CreditAccountNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.CREDIT_ACCOUNT_NUMBER',
      value: '',
      readonly: true,
    },
    {
      id: 18,
      order: 18,
      key: 'CreditAccountName',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.CREDIT_ACCOUNT_NAME',
      value: '',
      readonly: true,
    },
    {
      id: 19,
      order: 19,
      key: 'ReceiverBIC',
      field_type: FIELD_TYPES.BIC_AUTOCOMPLETE_FIELD,
      label: 'FIELDS.RECEIVER_BIC',
      value: '',
      readonly: true,
    },
  ];
  beneficiaryDetailsFields: any[] = [
    {
      id: 1,
      order: 1,
      key: 'AccountNumber',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_ACCOUNT_NUMBER_IBAN',
      value: '',
      required: true,
      autocomplete: 'off',
    },
    {
      id: 2,
      order: 2,
      key: 'Name1',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_NAME_1',
      value: '',
      required: true,
      autocomplete: 'off',
    },
    {
      id: 3,
      order: 3,
      key: 'Name2',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_NAME_2',
      value: '',
      autocomplete: 'off',
    },
    {
      id: 4,
      order: 4,
      key: 'Name3',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_NAME_3',
      value: '',
      autocomplete: 'off',
    },
    {
      id: 5,
      order: 5,
      key: 'Name4',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_NAME_4',
      value: '',
      autocomplete: 'off',
    },
    {
      id: 6,
      order: 6,
      key: 'Address1',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_PHYSICAL_ADDRESS_1',
      value: '',
      required: true,
      autocomplete: 'off',
    },
    {
      id: 7,
      order: 7,
      key: 'Address2',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_PHYSICAL_ADDRESS_2',
      value: '',
      autocomplete: 'off',
    },
    {
      id: 8,
      order: 8,
      key: 'PurposeCode',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.PURPOSE_CODE',
      value: '',
      required: true,
      autocomplete: 'off',
    },
  ];
  beneficiaryBankDetailsFields: any[] = [
    {
      id: 1,
      order: 1,
      key: 'AccountWithInstitutionBic',
      field_type: FIELD_TYPES.BIC_AUTOCOMPLETE_FIELD,
      label: 'FIELDS.ACCOUNT_WITH_INSTITUTION_BIC',
      value: '',
      required: true,
      autocomplete: 'off',
      readonly: true,
    },
    {
      id: 2,
      order: 2,
      key: 'RoutingCode',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.ROUTING_CODE',
      value: '',
    },
    {
      id: 3,
      order: 3,
      key: 'RoutingCodeValue',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.ROUTING_CODE_VALUE',
      value: '',
      autocomplete: 'off',
    },
    {
      id: 4,
      order: 4,
      key: 'CbkRemittances',
      field_type: FIELD_TYPES.SELECT,
      label: 'FIELDS.FIELD_26T',
      value: '',
      readonly: true,
    },
    {
      id: 5,
      order: 5,
      key: 'IntermediaryBankBic',
      field_type: FIELD_TYPES.BIC_AUTOCOMPLETE_FIELD,
      label: 'FIELDS.INTERMEDIARY_BANK_BIC',
      value: '',
      autocomplete: 'off',
      readonly: true,
    },
    {
      id: 6,
      order: 6,
      key: 'BeneficiaryCountryCode',
      field_type: FIELD_TYPES.LINE,
      label: 'FIELDS.BENEFICIARY_COUNTRY_CODE',
      value: '',
      readonly: true,
    },
  ];
  senderToReceiverInformationFields: any[] = SENDER_TO_RECEIVER_INFORMATION_FIELDS.map(field => ({ ...field }));
  ChargeDetailsFields: any[] = CHARGE_DETAILS_FIELDS.map(field => ({ ...field }));
  LicenseDetailsFields: any[] = [];
  ExchangeDetailsFields: any[] = EXCHANGE_DETAILS_FIELDS.map(({ required, ...field }) => ({ ...field }));
  AdditionalFields: any[] = ADDITIONAL_FIELDS.map(field => ({ ...field }));
  requiredDocs: any[] = REQUIRED_DOCS;
  ticket!: any;
  data!: any;
  documents!: any[];
  dt = new Date();

  constructor(
    private fb: UntypedFormBuilder,
    private transService: TransactionsService,
    private toast: ToastService,
    private router: Router,
    public sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.ticket = this.transService.ticket;
    const taskData = JSON.parse(this.transService.ticket.taskData);
    this.data = {
      ...taskData,
      ChargeDetails: normalizeMt103CheckerChargeDetails(taskData?.ChargeDetails),
    };

    if (this.ticket.bankId === '43') {
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
          field_type: this.data.TransactionDetails.ProductCode === 'RTGS' ? FIELD_TYPES.LINE : FIELD_TYPES.HIDDEN,
          label: 'FIELDS.TTC_NUMBER',
          value: '',
          readonly: true,
        },
      ];

      this.LicenseDetailsFields = [
        ...this.LicenseDetailsFields,
        {
          id: 1,
          order: 1,
          key: 'Number1',
          field_type: FIELD_TYPES.LINE,
          label: 'FIELDS.LICENSE_NUMBER_1',
          value: '',
          readonly: true,
        },
        {
          id: 2,
          order: 2,
          key: 'Number2',
          field_type: FIELD_TYPES.LINE,
          label: 'FIELDS.LICENSE_NUMBER_2',
          value: '',
          readonly: true,
        },
        {
          id: 3,
          order: 3,
          key: 'Number3',
          field_type: FIELD_TYPES.LINE,
          label: 'FIELDS.LICENSE_NUMBER_3',
          value: '',
          readonly: true,
        },
        {
          id: 4,
          order: 4,
          key: 'PurposeCode',
          field_type: FIELD_TYPES.SELECT,
          label: 'FIELDS.LICENSE_PURPOSE_CODE',
          value: '',
          readonly: true,
        },
        {
          id: 5,
          order: 5,
          key: 'Purpose',
          field_type: FIELD_TYPES.LINE,
          label: 'FIELDS.LICENSE_PURPOSE',
          value: '',
          readonly: true,
        },
      ];
    }

    this.actionForm = this.fb.group({
      action: [null, Validators.required],
      comment: [''],
    });

    // Filter fields to only show those with values
    this.applyFieldFiltering();

    // Setup validation for comment field based on action selection
    this.setupActionBasedValidation();
    this.getDocuments();
  }

  getValue(f: any, k: any): string {
    const value = this.data?.[f]?.[k];

    if (value === null || value === undefined || value === '') {
      return '---';
    }

    return value;
  }

  /**
   * Apply filtering to all field sections
   */
  private applyFieldFiltering(): void {
    // Filter each section's fields based on data
    this.accountFormFields = filterMt103CheckerFieldsWithValues(this.accountFormFields, this.data, 'AccountDetails');
    this.remitterAccDetailsFields = filterMt103CheckerFieldsWithValues(
      this.remitterAccDetailsFields,
      this.data,
      'RemitterAccountDetails'
    );
    this.TransactionDetailsFields = filterMt103CheckerFieldsWithValues(
      this.TransactionDetailsFields,
      this.data,
      'TransactionDetails'
    );
    this.beneficiaryDetailsFields = filterMt103CheckerFieldsWithValues(
      this.beneficiaryDetailsFields,
      this.data,
      'BeneficiaryDetails'
    );
    this.beneficiaryBankDetailsFields = filterMt103CheckerFieldsWithValues(
      this.beneficiaryBankDetailsFields,
      this.data,
      'BeneficiaryBankDetails'
    );
    this.senderToReceiverInformationFields = filterMt103CheckerFieldsWithValues(
      this.senderToReceiverInformationFields,
      this.data,
      'SenderToReceiverInformation'
    );
    this.ChargeDetailsFields = filterMt103CheckerFieldsWithValues(this.ChargeDetailsFields, this.data, 'ChargeDetails');
    this.ExchangeDetailsFields = filterMt103CheckerFieldsWithValues(
      this.ExchangeDetailsFields,
      this.data,
      'ExchangeDetails'
    );
    this.AdditionalFields = filterMt103CheckerFieldsWithValues(this.AdditionalFields, this.data, 'Additional');

    // Filter license details if it exists and for DRC
    if (this.ticket.bankId === '43' && this.data.LicenseDetails) {
      this.LicenseDetailsFields = filterMt103CheckerFieldsWithValues(
        this.LicenseDetailsFields,
        this.data,
        'LicenseDetails'
      );
    }

    // console.log('[CHECKER_FILTER] Field filtering completed');
  }

  setupActionBasedValidation(): void {
    const actionControl = this.actionForm.get('action');
    const commentControl = this.actionForm.get('comment');

    if (actionControl && commentControl) {
      actionControl.valueChanges.subscribe(action => {
        // Clear existing validators
        commentControl.clearValidators();

        // Add required validator for refer back and reject actions
        if (action === 'refer back' || action === 'reject') {
          commentControl.setValidators([Validators.required]);
        }

        // Update validity
        commentControl.updateValueAndValidity();
      });
    }
  }

  submit(): void {
    const ticketId = this.transService.ticket.id.toString();
    const payload: TransactionsUpdateTicketPayload = {
      ticketId,
      stage: 'OMNI_CHECKER', // mandatory by NewGen so pass any string
      status: this.actionForm.controls['action'].value, // "submit", "refer back", "reject"
      performedBy: 'hsahkl', // mandatory if you send comment
      comments: this.actionForm.controls['comment'].value, // optional
    };
    this.transService.submitTicketToNewGen(payload).subscribe((res: any) => {
        if (res.successful) {
          switch (payload['status']) {
            case TransactionsStatusType.SUBMIT:
              this.toast.show(
                'Success',
                `Ticket ${ticketId} submitted to NewGen successfully!`,
                MessageBoxType.SUCCESS
              );
              break;
            case TransactionsStatusType.RETURN:
              this.toast.show('Success', `Ticket ${ticketId} returned to Branch Maker!`, MessageBoxType.SUCCESS);
              break;
            case TransactionsStatusType.REJECT:
              this.toast.show('Success', `Ticket ${ticketId} rejected by Branch Checker!`, MessageBoxType.WARNING);
              break;

            default:
              break;
          }
        }
        this.router.navigateByUrl('/dashboard/tickets');
      },
      error => {}
    );
  }

  getDocuments(): void {
    let service = '';
    if (this.sessionService.userCountryCode.toLowerCase() === 'cd') {
      service = 'Blob';
    } else {
      service = 'NewGenSwift';
    }
    const data = {
      ticketNumber: this.transService.ticket.id.toString(),
      service: service,
      Cif: '', // this.data.PersonalDetails.CustomerId || this.data.personalDetails.CustomerId
    };
    this.transService.getTicketDocs(data).subscribe(
      (res: { responseObject: any }) => {
        this.documents = res.responseObject;
      },
      (err: any) => console.log(err)
    );
  }
}

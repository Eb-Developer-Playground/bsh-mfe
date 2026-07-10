import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
//import 'src/test/test-helpers.ts';
import { RouterTestingModule } from '@angular/router/testing';

import { ChangeOfSignatureService } from '../../../../core/services/change-of-signature/change-of-signature.service';
import { ContextManager } from '../../../modules/stepper';
import { ToastService } from '../../../modules/toast';

import { AccountService } from '../../../../core/services/account/account.service';
import { DialogConfirmComponent } from '../../dialog/dialog-confirm/dialog-confirm.component';

import { SignatoriesService } from '../../../../home/customer/change-of-signatories/signatories.service';
import { ChangeOfSignatureStakeholderDetailComponent } from './change-of-signature-stakeholder-detail.component';
import { Account } from '../../../../home/customer/change-of-signature/change-of-signature.model';
import { AccountManagementService } from '../../../../core/services/account-management/account-management.service';

localStorage.setItem(
  'selectedAccount',
  JSON.stringify({
    cif: '54300020254',
    accountCurrency: 'USD',
    accountName: 'JOHN MACHARIA MUGANE',
    accountNumber: '1460163307620',
    accountOpeningDate: '2014-10-22T12:00:00.000',
    accountStatus: 'A',
    availableBalance: '19803371.02',
    disbursedAmount: null,
    disbursementAmountSpecified: false,
    ecoCode: null,
    effectiveBalance: '0.00',
    flowAmmount: null,
    freezeCode: '',
    freezeReasonCode: null,
    lienAmmount: '30405.78',
    mandate: 'POA',
    nextDueDate: null,
    nextPaymentDueInNumOfDays: 0,
    percentCompleted: 0,
    remainingNumberOfInstalments: null,
    sanctionLimit: '0.00',
    scheduleNo: null,
    schemeCode: 'SB100',
    schemeType: 'SBA',
    shortName: null,
    iban: null,
  })
);

localStorage.setItem(
  'customerDetails',
  JSON.stringify({
    accounts: [
      {
        accountCurrency: 'USD',
        accountName: 'JOHN MACHARIA MUGANE',
        accountNumber: '1460163307620',
        accountOpeningDate: '2014-10-22T12:00:00.000',
        accountStatus: 'A',
        availableBalance: '19803371.02',
        disbursedAmount: null,
        disbursementAmountSpecified: false,
        ecoCode: null,
        effectiveBalance: '0.00',
        flowAmmount: null,
        freezeCode: '',
        freezeReasonCode: null,
        lienAmmount: '30405.78',
        mandate: 'POA',
        nextDueDate: null,
        nextPaymentDueInNumOfDays: 0,
        percentCompleted: 0,
        remainingNumberOfInstalments: null,
        sanctionLimit: '0.00',
        scheduleNo: null,
        schemeCode: 'SB100',
        schemeType: 'SBA',
        shortName: null,
        iban: null,
      },
      {
        accountCurrency: 'KES',
        accountName: 'JOHN MACHARIA MUGANE',
        accountNumber: '1460177455807',
        accountOpeningDate: '2018-07-18T12:00:00.000',
        accountStatus: 'A',
        availableBalance: '499069.29',
        disbursedAmount: null,
        disbursementAmountSpecified: false,
        ecoCode: null,
        effectiveBalance: '0.00',
        flowAmmount: null,
        freezeCode: '',
        freezeReasonCode: null,
        lienAmmount: '0.00',
        mandate: 'SELF',
        nextDueDate: null,
        nextPaymentDueInNumOfDays: 0,
        percentCompleted: 0,
        remainingNumberOfInstalments: null,
        sanctionLimit: '0.00',
        scheduleNo: null,
        schemeCode: 'SB100',
        schemeType: 'SBA',
        shortName: null,
        iban: null,
      },
      {
        accountCurrency: 'KES',
        accountName: 'THE HYRAX SEWERAGE PROJECT S H G',
        accountNumber: '0310190049553',
        accountOpeningDate: '2005-12-29T12:00:00.000',
        accountStatus: 'D',
        availableBalance: '2831.30',
        disbursedAmount: null,
        disbursementAmountSpecified: false,
        ecoCode: null,
        effectiveBalance: '0.00',
        flowAmmount: null,
        freezeCode: '',
        freezeReasonCode: null,
        lienAmmount: '0.00',
        mandate: 'BTS',
        nextDueDate: null,
        nextPaymentDueInNumOfDays: 0,
        percentCompleted: 0,
        remainingNumberOfInstalments: null,
        sanctionLimit: '0.00',
        scheduleNo: null,
        schemeCode: 'SB100',
        schemeType: 'SBA',
        shortName: null,
        iban: null,
      },
      {
        accountCurrency: 'KES',
        accountName: 'JOHN MACHARIA MUGANE',
        accountNumber: '0620173169623',
        accountOpeningDate: '2017-06-12T12:00:00.000',
        accountStatus: 'A',
        availableBalance: '27219.00',
        disbursedAmount: null,
        disbursementAmountSpecified: false,
        ecoCode: null,
        effectiveBalance: '0.00',
        flowAmmount: null,
        freezeCode: '',
        freezeReasonCode: null,
        lienAmmount: '0.00',
        mandate: 'SELF',
        nextDueDate: null,
        nextPaymentDueInNumOfDays: 0,
        percentCompleted: 0,
        remainingNumberOfInstalments: null,
        sanctionLimit: '0.00',
        scheduleNo: null,
        schemeCode: 'SB100',
        schemeType: 'SBA',
        shortName: null,
        iban: null,
      },
    ],
    alienIdExpDate: '',
    bankID: '54',
    cif: '54300020254',
    dateOfBirth: '1959-01-01T12:00:00.000',
    email: '',
    firstName: 'JOHN',
    gender: 'M',
    identifications: [
      {
        expiryDate: null,
        id: '1768170',
        type: 'NationalID',
      },
      {
        expiryDate: null,
        id: '',
        type: 'PassportNo',
      },
      {
        expiryDate: null,
        id: '',
        type: 'CompRegNo',
      },
    ],
    kraPin: 'A002666388Z',
    retCorpFlg: 'Retail',
    lastName: 'MACHARIA MUGANE',
    maritalStatus: '002',
    memo: null,
    passportExpDate: '',
    phoneNumber1: '000000',
    phoneNumber2: '000000',
    postalCode: null,
    preferredAddress: {
      address1: 'P.O.BOX 12676',
      address2: '',
      cityCode: '230',
      cityCodeDesc: 'NAKURU',
      countryCode: 'KE',
      pinCode: '20100',
      stateCode: 'RIF',
    },
    preferredDocDesc: 'NATIONAL I.D',
    preferredDocExpDate: '',
    relatedAccounts: [
      {
        cif: '54300646176',
        signatory: 'A',
        accountCurrency: 'KES',
        accountName: 'NAKURU BAPTIST CHURCH',
        accountNumber: '0310290878888',
        accountOpeningDate: '07-04-2007',
        accountStatus: 'A',
        availableBalance: '46088.40',
        disbursedAmount: null,
        disbursementAmountSpecified: false,
        ecoCode: null,
        effectiveBalance: null,
        flowAmmount: null,
        freezeCode: '',
        freezeReasonCode: null,
        lienAmmount: null,
        mandate: 'ANY',
        nextDueDate: null,
        nextPaymentDueInNumOfDays: 0,
        percentCompleted: 0,
        remainingNumberOfInstalments: null,
        sanctionLimit: null,
        scheduleNo: null,
        schemeCode: 'CA217',
        schemeType: 'CAA',
        shortName: null,
        iban: null,
      },
      {
        cif: '54303585059',
        signatory: 'J',
        accountCurrency: 'KES',
        accountName: 'RAINO AUTO SPARES',
        accountNumber: '0130193382030',
        accountOpeningDate: '13-01-2009',
        accountStatus: 'A',
        availableBalance: '62454.55',
        disbursedAmount: null,
        disbursementAmountSpecified: false,
        ecoCode: null,
        effectiveBalance: null,
        flowAmmount: null,
        freezeCode: '',
        freezeReasonCode: null,
        lienAmmount: null,
        mandate: 'SELF',
        nextDueDate: null,
        nextPaymentDueInNumOfDays: 0,
        percentCompleted: 0,
        remainingNumberOfInstalments: null,
        sanctionLimit: null,
        scheduleNo: null,
        schemeCode: 'SB100',
        schemeType: 'SBA',
        shortName: null,
        iban: null,
      },
      {
        cif: '54308596852',
        signatory: 'A',
        accountCurrency: 'KES',
        accountName: 'RHINNOS AUTO JAPAN LIMITED',
        accountNumber: '1460262215710',
        accountOpeningDate: '19-03-2014',
        accountStatus: 'A',
        availableBalance: '836830.83',
        disbursedAmount: null,
        disbursementAmountSpecified: false,
        ecoCode: null,
        effectiveBalance: null,
        flowAmmount: null,
        freezeCode: '',
        freezeReasonCode: null,
        lienAmmount: null,
        mandate: 'ETS',
        nextDueDate: null,
        nextPaymentDueInNumOfDays: 0,
        percentCompleted: 0,
        remainingNumberOfInstalments: null,
        sanctionLimit: null,
        scheduleNo: null,
        schemeCode: 'CA200',
        schemeType: 'CAA',
        shortName: null,
        iban: null,
      },
    ],
    shortName: 'JOHN',
    title: 'MR',
  })
);
const ACCOUNT: Account = {
  cif: '54300020254',
  accountCurrency: 'USD',
  accountName: 'JOHN MACHARIA MUGANE',
  accountNumber: '1460163307620',
  accountOpeningDate: '2014-10-22T12:00:00.000',
  accountStatus: 'A',
  availableBalance: '19803371.02',
  disbursedAmount: '',
  disbursementAmountSpecified: false,
  ecoCode: '',
  effectiveBalance: '0.00',
  flowAmmount: '',
  freezeCode: '',
  freezeReasonCode: '',
  lienAmmount: '30405.78',
  mandate: 'POA',
  nextDueDate: '',
  nextPaymentDueInNumOfDays: 0,
  percentCompleted: 0,
  remainingNumberOfInstalments: '',
  sanctionLimit: '0.00',
  scheduleNo: '',
  schemeCode: 'SB100',
  schemeType: 'SBA',
  shortName: '',
  iban: '',
};

describe('ChangeOfSignatureStakeholderDetailComponent', () => {
  let component: ChangeOfSignatureStakeholderDetailComponent;
  let fixture: ComponentFixture<ChangeOfSignatureStakeholderDetailComponent>;

  let accountServiceMock = {
    fetchPhoto: jest.fn(),
  };
  let accountServiceSpy: AccountService;

  let toastServiceMock = {
    show: jest.fn(),
  };

  let toastServiceSpy: ToastService;

  let changeOfSignatureServiceMock = {
    submitIndividual: jest.fn(),
    uploadChangeOfSignatureDocuments: jest.fn(),
  };

  let changeOfSignatureServiceSpy: ChangeOfSignatureService;

  let signatoriesServiceMock = {
    getOrCreateTicket: jest.fn(),
  };
  let signatoriesServiceSpy: SignatoriesService;

  let contextManagerMock = {
    patchCurrentContextData: jest.fn(),
    currentContextData: {
      selectedAccount: '123456789',
    },
  };

  let contextManagerSpy: ContextManager;

  let activatedRouteMock = {
    params: of({ id: 123 }),
  };

  let mockDatePipe = {
    transform(value: any, format: string): string {
      // Implement a mock behavior if needed
      return 'yyyy-MM-dd';
    },
  };

  let routerSpy: Router;

  let matDialogMock = {
    result: true,

    setResult(val: boolean) {
      this.result = val;
    },

    open() {
      return { afterClosed: () => of(this.result) };
    },
  };

  let accountManagementServiceMock = {
    setCustomerImages: jest.fn(),
    getCustomerDetails: jest.fn(),
  };

  let accountManagementServiceSpy: AccountManagementService;

  let dialogSpy: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ChangeOfSignatureStakeholderDetailComponent,
        DialogConfirmComponent,
      ],
      imports: [
        RouterTestingModule.withRoutes([
          {
            path: 'services/change-of-signatories',
            component: ChangeOfSignatureStakeholderDetailComponent,
          },
          {
            path: 'services/customer-360',
            component: ChangeOfSignatureStakeholderDetailComponent,
          },
          {
            path: 'services/change-of-signature/success',
            component: ChangeOfSignatureStakeholderDetailComponent,
          },
        ]),
        MatDialogModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        TranslateService,
        Router,
        {
          provide: AccountManagementService,
          //useValue: accountManagementServiceMock
        },
        { provide: MatDialog, useValue: matDialogMock },
        {
          provide: ChangeOfSignatureService,
          useValue: changeOfSignatureServiceMock,
        },
        {
          provide: ContextManager,
          useValue: contextManagerMock,
        },
        {
          provide: SignatoriesService,
          useValue: signatoriesServiceMock,
        },

        {
          provide: AccountService,
          //useValue: accountServiceMock,
        },
        {
          provide: ToastService,
          useValue: toastServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
        {
          provide: DatePipe,
          useValue: mockDatePipe,
        },
      ],
    }).compileComponents();

    // @ts-ignore
    fixture = TestBed.createComponent(
      ChangeOfSignatureStakeholderDetailComponent
    );
    component = fixture.componentInstance;

    accountServiceSpy = fixture.debugElement.injector.get(AccountService);
    signatoriesServiceSpy =
      fixture.debugElement.injector.get(SignatoriesService);
    contextManagerSpy = fixture.debugElement.injector.get(ContextManager);

    changeOfSignatureServiceSpy = fixture.debugElement.injector.get(
      ChangeOfSignatureService
    );
    toastServiceSpy = fixture.debugElement.injector.get(ToastService);
    accountManagementServiceSpy = fixture.debugElement.injector.get(
      AccountManagementService
    );
    routerSpy = fixture.debugElement.injector.get(Router);
    dialogSpy = fixture.debugElement.injector.get(MatDialog);

    component.account = ACCOUNT;
    fixture.detectChanges();
  });

  it('should create app component', () => {
    expect(component).toBeTruthy();
  });

  // Fetches customer images successfully when all parameters are valid
  it('should fetch customer images successfully when all parameters are valid', () => {
    // Mock dependencies
    const customerDetails = { cif: '1234567890' };
    const account = { accountNumber: '1234567890' };
    const result = {
      successful: true,
      responseObject: [
        {
          acctIdField: '1234567890',
          returnedPhotographFiels: 'photo1',
          returnedSignatureField: 'signature1',
          signatureField: 'field1',
          isActive: true,
          isExpired: false,
          effectiveDateField: '2022-01-01',
          mandateEndDateField: '2023-01-01',
        },
        {
          acctIdField: '1234567890',
          returnedPhotographFiels: 'photo2',
          returnedSignatureField: 'signature2',
          signatureField: 'field2',
          isActive: true,
          isExpired: false,
          effectiveDateField: '2022-01-01',
          mandateEndDateField: '2023-01-01',
        },
      ],
    };

    const fetchPhotoSpy = jest
      .spyOn(accountServiceSpy, 'fetchPhoto')
      .mockReturnValue(of(result));

    const setCustomerImagesSpy = jest.spyOn(
      accountManagementServiceSpy,
      'setCustomerImages'
    );

    // Create instance of the component

    // Set input values
    component.customerDetails = customerDetails;
    component.account = ACCOUNT;

    // Call the method
    component.fetchCustomerImages();

    // Assertions
    expect(fetchPhotoSpy).toHaveBeenCalled();
    expect(setCustomerImagesSpy).toHaveBeenCalled();
    // expect(domSanitizer.bypassSecurityTrustUrl).toHaveBeenCalledTimes(4);
    // expect(toastService.show).not.toHaveBeenCalled();
  });

  // Emits the selected signature field value through the 'selectedSignatureField' EventEmitter
  it('should emit the selected signature field value', () => {
    // Arrange
    const change: any = { value: 'signatureField' };
    const emitSpy = jest.spyOn(component.selectedSignatureField, 'emit');

    // Act
    component.onMatRadioChange(change);

    // Assert
    expect(emitSpy).toHaveBeenCalledWith('signatureField');
  });
});

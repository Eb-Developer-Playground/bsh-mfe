import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityInformationComponent } from './entity.component';

import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ToastService } from '../../../modules/toast';
import { ApiService, SessionService, UIService } from '../../../services';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AccountManagementService } from '../../../../core/services/account-management/account-management.service';
import { AccountService } from '../../../../core/services/account/account.service';
import { AuditService } from '../../../../core/services/audit/audit.service';
import { ChannelsService } from '../../../../core/services/channels/channels.service';
import {
  Channel,
  ChannelsResponse,
} from '../../../../home/customer/channels/channels.model';
import { ChannelCommentDialogComponent } from '../../../../home/customer/channels/channels-components/channel-comment-dialog/channel-comment-dialog.component';

const customerDetails = {
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
};
localStorage.setItem('customerDetails', JSON.stringify(customerDetails));

const customerCifData = {
  branchId: null,
  accountDetails: {
    accountId: null,
    accountManager: 'PK00413',
    bankId: '54',
    branchId: '031',
    isSuspended: false,
  },
  companyDetails: {
    businessType: 'string',
    registrationNumber: 'string',
    documentsUploaded: true,
    customerId: '54300020254',
    countryOfResidence: '',
    companyName: 'NEW COMPANY',
    krapInNumber: 'A002666388Z',
    registrationDate: 'string',
    highRiskCategory: null,
    politicallyExposed: false,
    pepDesc: 'string',
  },
  additionalInformation: {
    eddCompletionDate: null,
    highRiskCategory: null,
    kycDate: null,
    kycReviewDate: null,
    minor: false,
    nextReviewDate: null,
    pepDescription: null,
    politicallyExposed: false,
    riskProfileScore: '12',
    riskRating: 'LOW',
    secondaryRMId: null,
    staffEmployeeId: '',
    staffMember: false,
    submitForKYC: 'N',
  },
  contactDetails: {
    addresses: [
      {
        addressId: '10102666',
        addressStartDate: '12/29/2005 12:00:00 AM',
        addressType: 'Mailing',
        building: null,
        city: '230',
        cityCode: '230',
        comment: null,
        constituency: '',
        country: 'KE',
        county: 'RIF',
        currentPlaceOfResidence: null,
        district: 'P.O.BOX',
        division: null,
        estate: null,
        location: '',
        poBox: null,
        postalAddress: 'P.O.BOX 12676',
        postalCode: '20100',
        preferred: true,
        stateProvince: null,
        subLocation: null,
        toBeDeleted: false,
        village: '',
        addressText: null,
        state: null,
        subCounty: '12676',
        parish: '',
        region: null,
      },
    ],
    emailAddresses: [],
    phoneNumbers: [
      {
        fullNumber: '000000000',
        cityCode: '',
        comment: null,
        countryCode: '000',
        id: '3696538',
        number: '000000',
        phoneType: 'COMMPH1',
        preferred: true,
        toBeDeleted: false,
      },
    ],
  },
  currencyDetails: [
    {
      currencyCode: 'KES',
      dbFloat1: '0.0',
      dbFloat2: '0.0',
      dbFloat3: '15.0',
      dbFloat4: '0.0',
      dbFloat5: '0.0',
      dtDate1: '12/31/2099 12:00:00 AM',
      miscellaneousID: '15220660',
      type: 'CURRENCY',
    },
    {
      currencyCode: 'USD',
      dbFloat1: '0.0',
      dbFloat2: '0.0',
      dbFloat3: '0.0',
      dbFloat4: '0.0',
      dbFloat5: '0.0',
      dtDate1: '12/31/2099 12:00:00 AM',
      miscellaneousID: '15220661',
      type: 'CURRENCY',
    },
  ],
  identificationDetails: [
    {
      countryOfIssue: 'KE',
      desc: 'IDENTIFICATION PROOF FOR INDIVIDUALS',
      docCode: 'DOC03',
      docType: 'INDIV',
      expiryDt: null,
      idIssuedOrganisation: null,
      issueDt: '1/1/2000 12:00:00 AM',
      placeOfIssue: '223',
      preferredUniqueId: false,
      prefUniqueId: false,
      referenceNum: '1768170',
      typeCode: null,
      typeDesc: null,
    },
  ],
  nextOfKin: {
    firstName: null,
    idNumber: null,
    idType: null,
    lastName: null,
    middleName: null,
    phoneNumber: null,
    relation: null,
  },
  personalDetails: {
    birthDate: '1/1/1959 12:00:00 AM',
    countryOfResidence: '',
    customerId: '54300020254',
    firstName: 'JOHN',
    gender: 'M',
    idNumber: '1768170',
    idSerialNumber: null,
    idType: 'ID',
    krapInNumber: 'A002666388Z',
    lastName: 'MACHARIA MUGANE',
    maritalStatus: '002',
    middleName: '',
    nationality: 'KE',
    nre: false,
    religion: 'CHRIS',
    staffEmployeeId: null,
    fatca: false,
    socialSecurityNumber: null,
    qualification: null,
    institutionName: null,
    dependants: 0,
    name: 'JOHN MACHARIA MUGANE',
    shortName: 'JOHN M',
    titlePrefix: 'MR',
    salutation: 'MR',
  },
  physicalAddress: null,
  sourceOfIncome: {
    climateCategory: null,
    demandISIC1: null,
    demandISIC2: null,
    ecosystemCategory: null,
    employed: null,
    employerContactNumber: null,
    employerName: '',
    employmentStatus: 'Employed',
    environmentalCategory: null,
    industry: 'TRADE',
    isicLevel1: 'TRADE',
    isicLevel2: '',
    isicLevel3: null,
    isicLevel4: null,
    jobTitle: '',
    miscellaneousId: '83062127',
    monthlyIncome: null,
    natureOfBusiness: null,
    occupation: 'BNESS',
    profession: null,
    secondaryDemandISIC1: null,
    secondaryDemandISIC2: null,
    secondaryISICLevel1: null,
    secondaryISICLevel2: null,
    secondaryISICLevel3: null,
    secondaryISICLevel4: null,
    secondaryLevel: true,
    sector: '',
    selfEmployed: null,
    vertical1: 'RETAIL',
    vertical2: 'MASS',
    hasSegmentData: true,
    incomeFrom: null,
    incomeTo: null,
    natureOfIncome: null,
    employerId: null,
  },
};
localStorage.setItem('customerCifData', JSON.stringify(customerCifData));

localStorage.setItem(
  'accMgntObj',
  JSON.stringify({
    cif: '54300020254',
    bankID: '54',
    idNumber: '1768170',
    accountsId: '1460163307620',
    firstName: 'JOHN',
    lastName: 'MACHARIA MUGANE',
    dateOfBirth: '1959-01-01T12:00:00.000',
    idType: 'NationalID',
    mandate: 'SELF',
    accountType: 'SBA',
    isPresent: true,
  })
);

localStorage.setItem('isBusiness', 'true');

describe('EntityInformationComponent', () => {
  let component: EntityInformationComponent;
  let fixture: ComponentFixture<EntityInformationComponent>;

  const ApiServiceMock = {
    get: () => of({}),
  };
  let apiSpy: ApiService;

  let toastServiceMock = {
    show: jest.fn(),
  };
  let toastServiceSpy: ToastService;

  let matDialogMock = {
    result: true,

    setResult(val: boolean) {
      this.result = val;
    },

    open() {
      return { afterClosed: () => of(this.result) };
    },
  };

  let dialogSpy: MatDialog;

  let matDialogRefMock = {
    close: jest.fn(),
  };
  let dialogRefSpy: MatDialogRef<EntityInformationComponent>;

  const uIServiceMock = {
    toBase64: jest.fn(),
  };

  let uIServicespy: UIService;

  const AccountServiceMock = {
    getCustomer: () => {},
    getAccDetails: () => of({}),
    cifInquiryV2: () => of({}),
    getCustomerStatistics: () =>
      of({
        successful: true,
        responseObject: {
          statusMessage: 'Success',
          statusCode: '00',
          successful: true,
          responseObject: [{ personalDetails: { krapInNumber: '12345' } }],
        },
      }),
  };

  let accountServiceSpy: AccountService;

  const SessionServiceMock = {
    routeToUrl: () => jest.fn(),
    hasFeatureRole: () => jest.fn(),
  };
  let sessionServiceSpy: SessionService;
  const AccountManagementServiceMock = {
    getCustomerCifData: () => customerCifData,
    getIsCustomerBusiness: () => false,
    getCustomerDetails: () => customerDetails,
    getCustomer: () => ({}),
  };

  let accountManagementServiceSpy: AccountManagementService;

  const AuditServiceMock = {
    auditLog: () => of({}),
  };

  let auditServiceSpy: AuditService;

  const ChannelsServiceMock = {
    getCustomerChannels: () => of({}),
  };

  let channelsServiceSpy: ChannelsService;

  let routerSpy: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityInformationComponent],
      imports: [
        MatDialogModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          {
            path: 'services/omnichannel-profile',
            component: EntityInformationComponent,
          },
          { path: '**', redirectTo: '' },
        ]),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: ApiService, useValue: ApiServiceMock },
        Router,
        TranslateService,
        SessionService,

        { provide: ChannelsService, useValue: ChannelsServiceMock },
        { provide: AuditService, useValue: AuditServiceMock },
        {
          provide: AccountManagementService,
          useValue: AccountManagementServiceMock,
        },
        { provide: AccountService, useValue: AccountServiceMock },
        { provide: UIService, useValue: uIServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: matDialogRefMock,
        },
        {
          provide: MatDialog,
          useValue: matDialogMock,
        },
        {
          provide: ToastService,
          useValue: toastServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityInformationComponent);
    component = fixture.componentInstance;
    toastServiceSpy = fixture.debugElement.injector.get(ToastService);
    dialogSpy = fixture.debugElement.injector.get(MatDialog);
    dialogRefSpy = fixture.debugElement.injector.get(MatDialogRef);
    uIServicespy = fixture.debugElement.injector.get(UIService);
    accountServiceSpy = fixture.debugElement.injector.get(AccountService);
    sessionServiceSpy = fixture.debugElement.injector.get(SessionService);
    accountManagementServiceSpy = fixture.debugElement.injector.get(
      AccountManagementService
    );
    auditServiceSpy = fixture.debugElement.injector.get(AuditService);
    channelsServiceSpy = fixture.debugElement.injector.get(ChannelsService);
    routerSpy = fixture.debugElement.injector.get(Router);
    apiSpy = fixture.debugElement.injector.get(ApiService);

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should create app component', () => {
    expect(component).toBeTruthy();
  });

  // API call returns a successful response with a valid responseObject
  it('should set types and type correctly when API call returns a valid responseObject', () => {
    const businessTypeSpy = jest.spyOn(apiSpy, 'get').mockReturnValue(
      of({
        responseObject: [
          { businessId: 1, bType: 'Type1' },
          { businessId: 2, bType: 'Type2' },
        ],
      })
    );

    component.cifInquiryObj = { companyDetails: { businessType: 1 } };
    component.getTypes();

    expect(businessTypeSpy).toHaveBeenCalled();

    expect(component.types).toEqual([
      { businessId: 1, bType: 'Type1' },
      { businessId: 2, bType: 'Type2' },
    ]);
    expect(component.type).toBe('Type1');
  });

  // correctly extracts middle name when fullName contains firstName, middleName, and lastName
  it('should correctly extract middle name when fullName contains firstName, middleName, and lastName', () => {
    component.customerDetails = {
      firstName: 'John',
      fullName: 'John Michael Doe',
      lastName: 'Doe',
    };

    component.getMiddleName();

    expect(component.customerDetails.middleName).toBe('Michael');
  });

  // successfully fetches customer data when valid bankId and customerId are provided
  it('should fetch customer data successfully when valid bankId and customerId are provided', () => {
    const getCustomerspy = jest
      .spyOn(accountManagementServiceSpy, 'getCustomer')
      .mockReturnValue({ bankID: '123', cif: '456' });
    const cifInquiryV2Spy = jest
      .spyOn(accountServiceSpy, 'cifInquiryV2')
      .mockReturnValue(
        of({
          statusMessage: 'Success',
          statusCode: '00',
          successful: true,
          responseObject: {
            personalDetail1s: { krapInNumber: '12345' },
            companyDetails: { krapInNumber: '12345' },
          },
        })
      );
    component.isBusiness = true;
    component.getCifInquiry();

    expect(getCustomerspy).toHaveBeenCalled();
    expect(cifInquiryV2Spy).toHaveBeenCalledWith(true, {
      bankId: '123',
      customerId: '456',
    });
    expect(component.kraPin).toBe('12345');
  });

  // log is successfully created with valid EventName, EventDescription, and AuditData
  it('should create log successfully with valid EventName, EventDescription, and AuditData', () => {
    const auditLogSpy = jest
      .spyOn(auditServiceSpy, 'auditLog')
      .mockReturnValue(of({ success: '', error: '' }));

    const eventName = 'UserLogin';
    const eventDescription = 'User logged in successfully';
    const auditData = {
      username: 'john_doe',
      role: 'admin',
      timestamp: new Date(),
    };

    component.logAudit(eventName, eventDescription, JSON.stringify(auditData));

    expect(auditLogSpy).toHaveBeenCalledWith(
      {
        EventName: eventName,
        EventDescription: eventDescription,
        AuditData: JSON.stringify(auditData),
      },
      true
    );
  });

  // Return the full phone number when all parts (countryCode, cityCode, number) are present
  it('should return the concatenated phone number when countryCode, cityCode, and number are provided', () => {
    component.cifInquiryObj = {
      contactDetails: {
        phoneNumbers: [
          {
            number: '1234567890',
            preferred: true,
            countryCode: '1',
            cityCode: '123',
          },
        ],
      },
    };
    const result = component.preferredPhoneNumber;
    expect(result).toEqual('11231234567890');
  });

  it('should update customer status and channels when API response is successful', () => {
    const getCustomerChannelsSpy = jest
      .spyOn(channelsServiceSpy, 'getCustomerChannels')
      .mockImplementation(() =>
        of({
          successful: true,
          responseObject: {
            status: 'Active',
            profileCreatedOn: 'string',
            channels: [{ channel: 'Mobile', status: 'Active' }],
          },
          statusCode: '200',
          statusMessage: 'true',
        } as ChannelsResponse)
      );

    component.bankId = '123456';
    component.customerId = '78901234';
    component.getCustomerChannels();
    expect(component.profileFound).toBeTruthy();
    expect(component.customerStatus).toEqual('Active');
    expect(component.channels).toBeDefined();
  });

  // Update existing channels with new status, block reason, and created date from the response
  it('should update channel details correctly when provided with new channel information', () => {
    const channelsResponse = [
      {
        channel: 'Mobile',
        status: 'Active',
        createdDate: '2022-01-01',
        blockReason: '',
        subChannel: '',
      },
      {
        channel: 'Email',
        status: 'Inactive',
        createdDate: '2022-01-02',
        blockReason: 'User request',
        subChannel: '',
      },
    ];

    component.channels = [
      {
        channel: 'Mobile',
        status: 'Inactive',
        createdDate: '2021-12-01',
        blockReason: 'Device lost',
        subChannel: '',
      },
      {
        channel: 'Email',
        status: 'Active',
        createdDate: '2021-12-31',
        blockReason: '',
        subChannel: '',
      },
    ];

    component.updateChannels(channelsResponse);

    expect(component.channels[0].status).toBe('Active');
    expect(component.channels[1].blockReason).toBe('User request');
  });

  it('should call getAccDetails with correct parameters', () => {
    const getAccDetailsSpy = jest.spyOn(accountServiceSpy, 'getAccDetails');

    component.customerId = '123456789';
    component.customerInformation = { bankID: '789', accountsId: '987654321' };
    //(component as any).preferredPhoneNumber = '1234567890';
    component.getProfileDetails();

    expect(getAccDetailsSpy).toHaveBeenCalledWith(
      '123456789',
      '987654321',
      '000000000',
      true
    );
  });

  it('should return all channels unchanged when no "Mobile" channel exists', () => {
    const channels: Channel[] = [
      {
        channel: 'Email',
        status: 'Active',
        createdDate: '2022-03-01',
        blockReason: '',
        subChannel: '',
        level: 3,
        id: 'email',
      },
    ];
    const result = component.setDisplayChannels(channels);
    expect(result).toEqual(channels);
  });

  it('should sort accounts by opening date in ascending order', () => {
    const routeToUrlSpy = jest
      .spyOn(sessionServiceSpy, 'routeToUrl')
      .mockReturnValue();

    localStorage.setItem(
      'accounts',
      JSON.stringify([
        { accountOpeningDate: '2023-01-01' },
        { accountOpeningDate: '2023-01-01' },
        { accountOpeningDate: '2023-01-02' },
      ])
    );

    component.updateProfile();
    expect(
      JSON.parse(localStorage.getItem('accounts') as string)[0]
        .accountOpeningDate
    ).toBe('2023-01-01');
  });

  // Verify that goToSearch navigates to '/services/omnichannel-profile' when customerStatus is not 'InActive'
  it('should navigate to omnichannel profile when customerStatus is not "InActive"', () => {
    const navigateSpy = jest.spyOn(routerSpy, 'navigateByUrl');

    component.customerStatus = 'Active';
    component.goToSearch();
    expect(navigateSpy).toHaveBeenCalledWith('/services/omnichannel-profile');
  });

  // Verify that blockedInformation is set when response is successful and non-empty
  it('should set blockedInformation when response is successful and has data', () => {
    const getCustomerStatisticsSpy = jest
      .spyOn(accountServiceSpy, 'getCustomerStatistics')
      .mockReturnValue(
        of({
          successful: true,
          responseObject: [
            {
              taskData:
                '{"Comment":"Account is blocked due to policy violation."}',
            },
          ],
        })
      );

    component.customerId = '1234567890';
    component.getBlockedAccountInfo();
    expect(component.blockedInformation).toBeDefined();
    expect(component.blockReason).toEqual(
      'Account is blocked due to policy violation.'
    );
  });

  // Verify that the method returns true when the user has the 'SoftDelete.Maker' role
  it('should return true when user has SoftDelete.Maker role', () => {
    const hasRolespy = jest
      .spyOn(sessionServiceSpy, 'hasRole')
      .mockReturnValue(true);

    expect(component.canAccessSoftDelete()).toBe(true);
  });
});

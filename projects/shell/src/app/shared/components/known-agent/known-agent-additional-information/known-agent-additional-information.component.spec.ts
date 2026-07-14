import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormArray } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../../home/customer/material.module';
import { ContactDetails } from '../../../models/common/cifinquiry.model';
import { ICountryCode } from '../../../modules/localization/models';
import { ToastService } from '../../../modules/toast';
import { KnownAgentAdditionalInformationComponent } from './known-agent-additional-information.component';

describe('KnownAgentAdditionalInformationComponent', () => {
  let component: KnownAgentAdditionalInformationComponent;
  let fixture: ComponentFixture<KnownAgentAdditionalInformationComponent>;
  //let accountService: AccountService;
  //let router: Router;
  //let toastService: ToastService;
  //  let activatedRoute: ActivatedRoute;

  //const cif: string = '54316559231';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        KnownAgentAdditionalInformationComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        MaterialModule,
        //MatIconTestingModule,
        // HttpClientTestingModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        //KnownAgentService,
        ToastService,
        Router,
        // {
        //   provide: ApiService,
        //   useValue: apiServiceMock
        // }, //mocking Services
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(KnownAgentAdditionalInformationComponent);

    // accountService = fixture.debugElement.injector.get(AccountService);
    // router = fixture.debugElement.injector.get(Router);
    // toastService = fixture.debugElement.injector.get(ToastService);
    //knownAgentService = fixture.debugElement.injector.get(KnownAgentService);
    //activatedRoute = fixture.debugElement.injector.get(ActivatedRoute);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize informationForm', () => {
    //arrange

    const items = component.informationForm.get('items') as UntypedFormArray;

    //act
    //component.ngOnInit();

    //assert
    expect(component.informationForm.get('items')).toBeDefined();
    expect(component.informationForm.get('items')).toBeInstanceOf(
      UntypedFormArray
    );
    expect(items.length).toBe(1);
  });

  it('should autopopulate primary contact info when contactDetails is provided', () => {
    //arrange

    const contactDetails: ContactDetails = {
      emailAddresses: [
        {
          id: '',
          emailAddress: 'test1@example.com',
          emailType: '',
          comment: null,
          preferred: true,
          toBeDeleted: false,
        },
      ],
      phoneNumbers: [
        {
          id: '1',
          cityCode: '2',
          countryCode: '3',
          number: '4567890',
          comment: '3',
          phoneType: '3',
          preferred: true,
          toBeDeleted: false,
          code: '1',
        },
      ],
      addresses: [
        {
          addressId: '',
          county: '',
          constituency: '',
          district: '',
          division: '',
          location: '',
          subLocation: '',
          postalAddress: '',
          cityCode: '',
          city: '',
          village: '',
          estate: '',
          poBox: '',
          postalCode: '',
          stateProvince: '',
          addressType: '',
          preferred: false,
          building: '',
          currentPlaceOfResidence: '',
          addressStartDate: '',
          toBeDeleted: false,
        },
      ],
    };

    component.contactDetails = contactDetails;

    //act
    (component as any).fillInfoFromContactDetails();

    //assert
    //@ts-ignore
    expect(component.items.controls[0].get('email').value).toBe(
      'test1@example.com'
    );
    //@ts-ignore
    expect(component.items.controls[0].get('code').value).toBe('+3');
    //@ts-ignore
    expect(component.items.controls[0].get('mobileNumber').value).toBe(
      '24567890'
    );
  });

  it('should return correct icon for country code', () => {
    //arrange

    const countryCode: ICountryCode = {
      countryCode: 'KE',
      icon: 'ic-flag-ke',
      countryName: '',
      currency: null,
      currencySymbol: null,
      nationality: '',
      dialCode: '',
      flagPath: '',
      operatingCountry: false,
      countryCode3Chars: null,
    };

    //act
    const icon = component.getIcon(countryCode);

    //assert
    expect(icon).toBe('ic-flag-ke');
  });
});

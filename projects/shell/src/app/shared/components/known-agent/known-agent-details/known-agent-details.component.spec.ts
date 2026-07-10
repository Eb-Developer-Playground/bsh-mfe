import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KnownAgentDetailsComponent } from './known-agent-details.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastService } from '../../../modules/toast';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AgentFormObj, FormNames } from '../../../models';

describe('KnownAgentDetailsComponent', () => {
  let component: KnownAgentDetailsComponent;
  let fixture: ComponentFixture<KnownAgentDetailsComponent>;
  //let accountService: AccountService;
  //let router: Router;
  //let toastService: ToastService;
  //  let activatedRoute: ActivatedRoute;

  //const cif: string = '54316559231';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KnownAgentDetailsComponent],
      imports: [
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        //MaterialModule,
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

    fixture = TestBed.createComponent(KnownAgentDetailsComponent);
    component = fixture.componentInstance;
    // accountService = fixture.debugElement.injector.get(AccountService);
    // router = fixture.debugElement.injector.get(Router);
    // toastService = fixture.debugElement.injector.get(ToastService);
    //knownAgentService = fixture.debugElement.injector.get(KnownAgentService);
    //activatedRoute = fixture.debugElement.injector.get(ActivatedRoute);

    fixture.detectChanges();
  });

  // afterEach(() => {
  //   jest.clearAllMocks();
  // });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the isDetailsFormValid event with the correct form object when the form status changes to valid', () => {
    component.ngOnInit();

    component.detailsForm.controls.firstName.setValue('John');
    component.detailsForm.controls.lastName.setValue('Doe');
    component.detailsForm.controls.idSerialNumber.setValue('123456');
    component.detailsForm.controls.kraPin.setValue('ABC123456DEF');

    const formObj: AgentFormObj = {
      formName: FormNames.ADDITIONALINFORMATION,
      values: component.detailsForm.value,
      valid: true,
    };
    component.isDetailsFormValid.subscribe(obj => {
      expect(obj).toEqual(formObj);
    });
  });
});

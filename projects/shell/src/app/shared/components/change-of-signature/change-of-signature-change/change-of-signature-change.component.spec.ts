import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AccountManagementService } from '../../../../core/services/account-management/account-management.service';
import { ChangeOfSignatureService } from '../../../../core/services/change-of-signature/change-of-signature.service';
import { SignatoriesService } from '../../../../home/customer/change-of-signatories/signatories.service';
import { ContextManager } from '../../../modules/stepper';
import { ToastService } from '../../../modules/toast';
import { AccountService } from '../../../services';
import { DialogConfirmComponent } from '../../dialog/dialog-confirm/dialog-confirm.component';
import { ChangeOfSignatureChangeComponent } from './change-of-signature-change.component';
describe('ChangeOfSignatureChangeComponent', () => {
  let component: ChangeOfSignatureChangeComponent;
  let fixture: ComponentFixture<ChangeOfSignatureChangeComponent>;

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
      declarations: [ChangeOfSignatureChangeComponent, DialogConfirmComponent],
      imports: [
        RouterTestingModule.withRoutes([
          {
            path: 'services/change-of-signatories',
            component: ChangeOfSignatureChangeComponent,
          },
          {
            path: 'services/customer-360',
            component: ChangeOfSignatureChangeComponent,
          },
          {
            path: 'services/change-of-signature/success',
            component: ChangeOfSignatureChangeComponent,
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
    fixture = TestBed.createComponent(ChangeOfSignatureChangeComponent);
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

    fixture.detectChanges();
  });

  it('should create app component', () => {
    expect(component).toBeTruthy();
  });

  // Initializes 'changeForm' with default values and validators
  it('should initialize changeForm with default values and validators', () => {
    component.ngOnInit();
    expect(component.changeForm.controls['effectiveDate'].value).toEqual(
      component.maxDate
    );
    expect(component.changeForm.controls['reasonForChanging'].value).toEqual(
      ''
    );
  });
});

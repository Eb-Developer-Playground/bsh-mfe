import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { of } from 'rxjs';

import { StatementDetailsComponent } from './statement-details.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../../../shared/modules/toast/toast.service';
import { AccountStatementService } from '../../../../core/services/account-statement/account-statement.service';
import { SessionService } from '../../../../shared/services/session/session.service';
import { ISubsidiary } from '../../../../shared/services/session/session.service';
import { MatRadioChange } from '@angular/material/radio';
import { HttpClientTestingModule } from '@angular/common/http/testing';


class MatDialogMock {
  open = jest.fn().mockReturnValue({
    afterClosed: () => of(true),
  });
}

class RouterMock {
  getCurrentNavigation = jest.fn(() => ({ extras: { state: { taskId: 'task-123' } } }));
}

class ToastServiceMock {
  show = jest.fn();
}

class TranslateServiceMock {
  instant = jest.fn((k: string) => k);
}

class AccountStatementServiceMock {
  submitIndividual = jest.fn(() => of({ responseObject: { id: '1', taskData: '{}', actions: [{ taskId: 't1' }] } }));
  updateData = jest.fn(() => of({ responseObject: { id: '1', taskData: '{}', actions: [{ taskId: 't1' }] } }));
  getStatementRequest = jest.fn(() => of({ responseObject: { statementFee: 5, statementDuty: 3, certificationFee: 10, currency: (JSON.parse(localStorage.getItem('selectedAccount') as string)?.accountCurrency || '') } }));
  getStatementPageCount = jest.fn(() => of({ responseObject: 2 }));
  calculateCharge = jest.fn(() => of({ responseObject: { totalCharge: 20, currency: (JSON.parse(localStorage.getItem('selectedAccount') as string)?.accountCurrency || '') } }));
  getAccountBalance = jest.fn(() => of({ responseObject: { balance: '100' } }));
  calculateChargeV2 = jest.fn(() => of({ responseObject: { item1: 0, item2: (JSON.parse(localStorage.getItem('selectedAccount') as string)?.accountCurrency || ''), item3: true } }));
  verifyBio = jest.fn(() => of({ successful: true }));
  invokeActions = jest.fn((name: string) => {
    const currency = JSON.parse(localStorage.getItem('selectedAccount') as string)?.accountCurrency || '';
    if (name === 'GetAccountStatementPageCount') {
      return of({ responseObject: { item1: true, item2: 'OK', item3: 3 } });
    }
    if (name === 'GetAccountBalance') {
      return of({ responseObject: { item1: true, item2: 'OK', item3: { message: 'OK', date: '2020-01-01', balance: '200' } } });
    }
    return of({ responseObject: { charges: { totalCharge: 15, currency, canPay: true } } });
  });
}

describe('StatementDetailsComponent', () => {
  let component: StatementDetailsComponent;
  let fixture: ComponentFixture<StatementDetailsComponent>;
  let accountService: AccountStatementServiceMock;
  let dialog: MatDialogMock;
  let sessionService: SessionService;

  const seedLocalStorage = () => {
    const accMgntObj = {
      currentFlow: 'present',
      bankID: 'BANK1',
      cif: 'CIF123',
      customerIdType: 'customerid',
      firstName: 'John',
      lastName: 'Doe',
      accessProfileTicket: { id: 'APT-1' },
    };

    const selectedAccount = {
      accountName: 'John Main',
      accountNumber: '1234567890',
      accountOpeningDate: new Date(2020, 0, 1).toISOString(),
      cif: 'CIF123',
      mandate: 'SELF',
      schemeCode: 'S123',
      accountCurrency: '',
      availableBalance: '1000',
    };

    const accounts = [selectedAccount];

    const customerCifData = {
      accountDetails: { branchId: 'BR-1' },
      contactDetails: {
        emailAddresses: [{ emailAddress: 'john@doe.com' }],
        phoneNumbers: [{ id: '1', countryCode: '+254', number: '700000000', phoneType: 'MOBILE', preferred: true }],
      },
    };

    const customerDetails = { firstName: 'John', lastName: 'Doe' };

    localStorage.setItem('accMgntObj', JSON.stringify(accMgntObj));
    localStorage.setItem('selectedAccount', JSON.stringify(selectedAccount));
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('customerCifData', JSON.stringify(customerCifData));
    localStorage.setItem('customerDetails', JSON.stringify(customerDetails));
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    seedLocalStorage();

    await TestBed.configureTestingModule({
      declarations: [StatementDetailsComponent],
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        UntypedFormBuilder,
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: Router, useClass: RouterMock },
        { provide: ToastService, useClass: ToastServiceMock },
        { provide: TranslateService, useClass: TranslateServiceMock },
        { provide: AccountStatementService, useClass: AccountStatementServiceMock },
        SessionService
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    TestBed.overrideTemplate(StatementDetailsComponent, '');

    fixture = TestBed.createComponent(StatementDetailsComponent);
    component = fixture.componentInstance;

    accountService = TestBed.inject(AccountStatementService) as unknown as AccountStatementServiceMock;
    dialog = TestBed.inject(MatDialog) as unknown as MatDialogMock;
    sessionService = TestBed.inject(SessionService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnInit should fetch and set charge texts from getStatementRequest', () => {
    const selected = JSON.parse(localStorage.getItem('selectedAccount') as string);
    const currency = selected?.accountCurrency || selected?.currency || '';

    accountService.getStatementRequest = jest.fn(() => of({
      responseObject: { statementFee: 5, statementDuty: 3, certificationFee: 10, currency },
    }));

    fixture.detectChanges();

    expect(accountService.getStatementRequest).toHaveBeenCalled();
    expect(component.printingChargePerPageText).toContain(`${currency} 8`);
    expect(component.printCertifyChargeText).toContain(`${currency} 8`);
  });

  it('warningTitle should reflect delivery mode', () => {
    component.delivery = 'PrintStatement';
    expect(component.warningTitle).toBe('Charges associated with printing');

    component.delivery = 'EmailStatement';
    expect(component.warningTitle).toBe('Charges associated with printing and certifying');
  });

  it('checkValidity should set isFormValid when statement core fields are present', () => {
    component.statement.actionName = 'Generate';
    component.statement.statementType = 1 as any;
    component.statement.fromDate = '2023-01-01';
    component.statement.toDate = '2023-01-31';

    component.checkValidity();
    expect(component.isFormValid).toBe(true);
  });

  it('showDialog should open dialog and route to verifyBio when present flow', () => {
    fixture.detectChanges();

    const verifyBioSpy = jest.spyOn(component, 'verifyBio').mockImplementation(() => {});

    component.delivery = 'PrintStatement';
    component.selectedAccount = JSON.parse(localStorage.getItem('selectedAccount') as string);
    component.period = 'Current Month';
    component.statement.fromDate = '2023-01-01';
    component.statement.toDate = '2023-01-31';
    component.delivery_Mode = 'Print';
    component.NofPages = 2;
    component.accountCharged = component.selectedAccount.accountNumber;
    component.totalCharge = 50;
    component.balance = 100;

    component.showDialog();

    expect(dialog.open).toHaveBeenCalled();
    expect(verifyBioSpy).toHaveBeenCalled();
  });

  it('showDialog should call verifyBio in customerNotPresentFlow for non-privileged and non-RW/UG', () => {
    fixture.detectChanges();

    const verifyBioSpy = jest
      .spyOn(component as any, 'verifyBio')
      .mockImplementation(() => {});

    component['customerNotPresentFlow'] = true;

    component.delivery = 'EmailStatement';
    component.selectedAccount = JSON.parse(localStorage.getItem('selectedAccount') as string);
    component.period = 'Current Month';
    component.statement.fromDate = '2023-01-01';
    component.statement.toDate = '2023-01-31';
    component.delivery_Mode = 'Email';
    component.NofPages = 2;
    component.accountCharged = component.selectedAccount.accountNumber;

    component.showDialog();

    expect(dialog.open).toHaveBeenCalled();
    expect(verifyBioSpy).toHaveBeenCalled();
  });

  it('showDialog should call onVerifyGenerateStatement for privileged UG user in customerNotPresentFlow', () => {
    // Mock as Uganda user with privileged work class
    Object.defineProperty(sessionService, 'subsidiary', {
      get: jest.fn(() => ({ countryCode: 'UG' })),
      configurable: true,
    });
    Object.defineProperty(sessionService, 'userWorkClass', {
      get: jest.fn(() => '50'), // Privileged role
      configurable: true,
    });
    component.subsidiary = { countryCode: 'UG' } as ISubsidiary;
    component.userInfo = { bankID: '56' };

    fixture.detectChanges();

    // Set component state for the test
    component['customerNotPresentFlow'] = true;
    component.delivery = 'EmailStatement';
    component.selectedAccount = JSON.parse(localStorage.getItem('selectedAccount') as string);
    component.period = 'Current Month';
    component.statement.fromDate = '2023-01-01';
    component.statement.toDate = '2023-01-31';
    component.delivery_Mode = 'Email';
    component.NofPages = 2;
    component.accountCharged = component.selectedAccount.accountNumber;
    component.taskId = 'task-123'; // Mock taskId

    const verifyBioSpy = jest.spyOn(accountService, 'verifyBio').mockReturnValue(of({ successful: true }));

    component.showDialog();

    expect(dialog.open).toHaveBeenCalled();
    expect(verifyBioSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        bioModels: expect.arrayContaining([
          expect.objectContaining({ skipBio: true, reason: 'customer experience staff' }),
        ]),
      }),
      'task-123',
      true
    );
  });

  it('verifyBio should open signatories dialog when mandate !== SELF', () => {
    fixture.detectChanges();

    const openSignatoriesDialogSpy = jest
      .spyOn(component as any, 'openSignatoriesDialog')
      .mockImplementation(() => {});

    component.selectedAccount = {
      ...(JSON.parse(localStorage.getItem('selectedAccount') as string)),
      mandate: 'JOINT',
    };

    component.customerData = { accounts: [] } as any;
    component.accountNumbers = [component.selectedAccount];

    component.verifyBio();
    

    expect(openSignatoriesDialogSpy).toHaveBeenCalled();
  });

  describe('Waiver Functionality (Uganda)', () => {
    beforeEach(() => {
      // Mock as Uganda user
      Object.defineProperty(sessionService, 'subsidiary', {
        get: jest.fn(() => ({ countryCode: 'UG' })),
        configurable: true,
      });
      component.subsidiary = { countryCode: 'UG' } as ISubsidiary;
      component.userInfo = { bankID: '56' };
      component.selectedAccount = { ...component.selectedAccount, accountCurrency: 'UGX' };
    });

    it('should allow waiver for eligible UG user (role 150)', () => {
      // Arrange
      Object.defineProperty(sessionService, 'userWorkClass', {
        get: jest.fn(() => '150'),
        configurable: true,
      });
      fixture.detectChanges(); // ngOnInit
      const event = { value: 'WaiveCharges' } as MatRadioChange;
      const reasonControl = component.waiverForm.get('reason');
      const markAsTouchedSpy = jest.spyOn(reasonControl!, 'markAsTouched');

      // Act
      component.paymentMode(event);

      // Assert
      expect(component.waiveCharges).toBe(true);
      expect(markAsTouchedSpy).toHaveBeenCalled();
    });

    it('should allow waiver for eligible UG user (role 200)', () => {
      // Arrange
      Object.defineProperty(sessionService, 'userWorkClass', {
        get: jest.fn(() => '200'),
        configurable: true,
      });
      fixture.detectChanges();
      const event = { value: 'WaiveCharges' } as MatRadioChange;
      const reasonControl = component.waiverForm.get('reason');
      const markAsTouchedSpy = jest.spyOn(reasonControl!, 'markAsTouched');

      // Act
      component.paymentMode(event);

      // Assert
      expect(component.waiveCharges).toBe(true);
      expect(markAsTouchedSpy).toHaveBeenCalled();
    });

    it('should NOT allow waiver for ineligible UG user and show toast', () => {
      // Arrange
      Object.defineProperty(sessionService, 'userWorkClass', {
        get: jest.fn(() => '100'), // Ineligible role
        configurable: true,
      });
      const toastService = TestBed.inject(ToastService);
      fixture.detectChanges();
      const event = { value: 'WaiveCharges' } as MatRadioChange;

      // Act
      component.paymentMode(event);

      // Assert
      expect(component.waiveCharges).toBe(false);
      expect(toastService.show).toHaveBeenCalledWith(expect.any(String), 'COMMON.UNAUTHORIZED', expect.any(String), expect.any(Number), undefined, undefined, false);
    });

    it('should propagate waiveReason to dialog payload when waiving charges', () => {
      // Arrange
      Object.defineProperty(sessionService, 'userWorkClass', {
        get: jest.fn(() => '150'),
        configurable: true,
      });
      fixture.detectChanges();
      component.waiveCharges = true;
      component.waiverForm.get('reason')?.setValue('Test waiver reason');

      // Act
      component.showDialog();

      // Assert
      const dialogConfig = dialog.open.mock.calls[0][1];
      expect(dialogConfig.data.payload.waiveCharges).toBe(true);
      expect(dialogConfig.data.payload.waiveReason).toBe('Test waiver reason');
    });

    it('should not propagate waiveReason when not waiving charges', () => {
      // Arrange
      fixture.detectChanges();
      component.waiveCharges = false;

      // Act
      component.showDialog();

      // Assert
      const dialogConfig = dialog.open.mock.calls[0][1];
      expect(dialogConfig.data.payload.waiveCharges).toBe(false);
      expect(dialogConfig.data.payload.waiveReason).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should open an error dialog for UG users on validation failure', () => {
      // Arrange
      Object.defineProperty(sessionService, 'subsidiary', {
        get: jest.fn(() => ({ countryCode: 'UG' })),
        configurable: true,
      });
      component.subsidiary = { countryCode: 'UG' } as ISubsidiary;
      fixture.detectChanges();

      const errorResponse = {
        error: {
          responseObject: 'Validation failed: Invalid date range.',
        },
      };

      // Act
      (component as any).handleValidationError(errorResponse);

      // Assert
      expect(dialog.open).toHaveBeenCalledWith(expect.any(Function), {
        width: '500px',
        data: expect.objectContaining({ isErrorDialog: true, message: 'Validation failed: Invalid date range.' }),
      });
    });
  });
});
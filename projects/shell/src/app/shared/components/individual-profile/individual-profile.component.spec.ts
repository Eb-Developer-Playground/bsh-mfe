import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ISignature } from '../../models/customer/shared';
import { ContextManager } from '../../modules/stepper';
import { MessageBoxType, ToastService } from '../../modules/toast';
import { AccountService } from '../../services';
import { IndividualProfileComponent } from './individual-profile.component';

class ToastServiceMock {
  show = jest.fn();
}

class AccountServiceMock {
  getAccount = jest.fn().mockReturnValue(
    of({
      responseObject: {
        cif: '54317855337',
        accounts: [
          {
            accountNumber: '0510000000000',
            accountName: 'Main Acc',
            accountCurrency: 'KES',
            accountStatus: 'A',
          },
        ],
      },
    })
  );

  fetchPhoto = jest.fn().mockReturnValue(
    of({
      statusCode: '00',
      responseObject: [
        {
          returnedPhotographFiels: 'AAA',
          returnedSignatureField: 'BBB',
        },
      ],
    })
  );
}

class ContextManagerMock {
  currentContextData: {
    stakeholdersUploadedDocsByCif: { [cif: string]: any[] }[] | null;
  } = {
    stakeholdersUploadedDocsByCif: null,
  };
}

class ChangeDetectorMock {
  detectChanges = jest.fn();
  markForCheck = jest.fn();
}
describe('IndividualProfileComponent', () => {
  let component: IndividualProfileComponent;
  let fixture: ComponentFixture<IndividualProfileComponent>;
  let toastService: ToastServiceMock;
  let accountService: AccountServiceMock;
  let ctxManager: ContextManagerMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IndividualProfileComponent,
        HttpClientModule,
        TranslateModule.forRoot(),
        NoopAnimationsModule,
      ],
      providers: [
        TranslateService,
        DatePipe,
        provideNativeDateAdapter(),
        { provide: ToastService, useClass: ToastServiceMock },
        { provide: AccountService, useClass: AccountServiceMock },
        { provide: ContextManager, useClass: ContextManagerMock },
        { provide: ChangeDetectorRef, useClass: ChangeDetectorMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IndividualProfileComponent);
    component = fixture.componentInstance;

    toastService = TestBed.inject(ToastService) as any;
    accountService = TestBed.inject(AccountService) as any;
    ctxManager = TestBed.inject(ContextManager) as any;

    component.stakeholderlDetails = {
      cif: '54317855337',
      firstName: 'Musa',
      middleName: 'M',
      lastName: 'Doe',
    } as any;

    component.subsidiary = { bankId: '051' } as any;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchDetailsByCif() when isReviewStep = false', () => {
    component.isReviewStep = false;
    const spyFetch = jest.spyOn(component, 'fetchDetailsByCif');

    component.ngOnInit();
    expect(spyFetch).toHaveBeenCalled();
  });

  it('should NOT call getSignatureAndPhoto() when isReviewStep = false', () => {
    const spyGet = jest.spyOn(component, 'getSignatureAndPhoto');

    component.isReviewStep = false;
    component.ngOnInit();
    expect(spyGet).not.toHaveBeenCalled();
  });

  it('should call getSignatureAndPhoto() when isReviewStep = true', () => {
    const spyGet = jest
      .spyOn(component, 'getSignatureAndPhoto')
      .mockReturnValue([]);

    component.isReviewStep = true;
    component.ngOnInit();
    expect(spyGet).toHaveBeenCalled();
  });

  it('should set signatureAndPhoto from returned value', () => {
    const mockValue: ISignature[] = [{ passport: 'X', signature: 'Y' }];
    jest.spyOn(component, 'getSignatureAndPhoto').mockReturnValue(mockValue);

    component.isReviewStep = true;
    component.ngOnInit();
    expect(component.signatureAndPhoto).toEqual(mockValue);
  });

  it('should build fullName correctly and handle missing or undefined stakeholder details', () => {
    component.stakeholderlDetails = {
      firstName: 'Musa',
      middleName: 'M',
      lastName: 'Doe',
    } as any;
    component.ngOnChanges();
    expect(component.fullName).toBe('Musa M Doe');

    component.stakeholderlDetails.middleName = '';
    component.ngOnChanges();
    expect(component.fullName).toBe('Musa Doe');

    component.stakeholderlDetails = undefined as any;
    expect(() => component.ngOnChanges()).not.toThrow();
  });

  it('should show error toast if CIF is missing', () => {
    const toastSpy = jest.spyOn(component['toastService'], 'show');

    component.stakeholderlDetails = { cif: '' } as any;
    component.fetchDetailsByCif();

    expect(toastSpy).toHaveBeenCalledWith(
      'Missing CIF',
      'Customer ID is required.',
      MessageBoxType.DANGER,
      5000,
      undefined,
      undefined,
      false
    );
  });

  it('should call accountService.getAccount() with correct params', () => {
    const spyGet = jest
      .spyOn(component['accountService'], 'getAccount')
      .mockReturnValue(
        of({
          responseObject: {
            accounts: [{ accountNumber: '051000000000', accountName: 'Test' }],
          },
        })
      );

    component.fetchDetailsByCif();

    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyGet).toHaveBeenCalledWith(
      `?Id=54317855337&bankId=051&idType=customerid&reloadFromCache=false`,
      true
    );
  });

  it('should populate accountList and call onAccountSelect()', () => {
    jest.spyOn(component['accountService'], 'getAccount').mockReturnValue(
      of({
        responseObject: {
          accounts: [
            {
              accountNumber: '0510000000000',
              accountName: 'Test',
              accountCurrency: 'KES',
              accountStatus: 'A',
            },
          ],
        },
      })
    );

    const spySelect = jest.spyOn(component, 'onAccountSelect');

    component.fetchDetailsByCif();
    expect(component.accountList.length).toBe(1);
    expect(component.accountList[0].accountNumber).toBe('0510000000000');
    expect(spySelect).toHaveBeenCalledWith({
      customerId: '54317855337',
      accountid: '0510000000000',
    });
  });
  it('should assign photoReuse & signatuReuse and call detectChanges()', () => {
    const spy = jest.spyOn((component as any).changeDetector, 'detectChanges');

    component.handleApply([
      { name: 'Passport', data: 'AAA' },
      { name: 'Signature', data: 'BBB' },
    ]);

    expect(component.photoReuse.data).toBe('AAA');
    expect(component.signatuReuse.data).toBe('BBB');
    expect(spy).toHaveBeenCalled();
  });

  it('should emit valid=true and uploadedDocsByCif', () => {
    const spyValid = jest.spyOn(component.isStep2ValidChange, 'emit');
    const spyUpload = jest.spyOn(component.uploadedDocsByCif, 'emit');

    const docs = [{ required: true, success: true, file: {} }] as any;

    component.updateDocuments(docs);

    expect(spyValid).toHaveBeenCalledWith(true);
    expect(spyUpload).toHaveBeenCalled();
  });

  it('should emit valid=false when missing required docs', () => {
    const spyValid = jest.spyOn(component.isStep2ValidChange, 'emit');

    const docs = [{ required: true, success: false, file: null }] as any;

    component.updateDocuments(docs);

    expect(spyValid).toHaveBeenCalledWith(false);
  });

  it('should call fetchDetailsByCif if no context data', () => {
    ctxManager.currentContextData.stakeholdersUploadedDocsByCif = null;

    const spyFetch = jest.spyOn(component, 'fetchDetailsByCif');

    component.getSignatureAndPhoto();

    expect(spyFetch).toHaveBeenCalled();
  });

  it('should return [] if no match found', () => {
    ctxManager.currentContextData.stakeholdersUploadedDocsByCif = [
      { '999': [] },
    ];

    const result = component.getSignatureAndPhoto();

    expect(result).toEqual([]);
  });

  it('should update reusePhotoSignature', () => {
    component.onReuseToggle(true);
    expect(component.reusePhotoSignature).toBe(true);
  });

  it('should call destroy$.next and destroy$.complete', () => {
    const nextSpy = jest.spyOn(component.destroy$, 'next');
    const compSpy = jest.spyOn(component.destroy$, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(compSpy).toHaveBeenCalled();
  });
});

import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flushMicrotasks,
} from '@angular/core/testing';
import { ChangeOfSignatureSupportingDocumentsComponent } from './change-of-signature-supporting-documents.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageBoxType, ToastService } from '../../../modules/toast';

const mkFile = (name: string, size: number, type = 'image/png') => {
  const blob = new Blob([new ArrayBuffer(size)], { type });
  return new File([blob], name, { type });
};

describe('ChangeOfSignatureSupportingDocumentsComponent', () => {
  let component: ChangeOfSignatureSupportingDocumentsComponent;
  let fixture: ComponentFixture<ChangeOfSignatureSupportingDocumentsComponent>;
  const toast = { show: jest.fn() } as unknown as ToastService;

  beforeEach(async () => {
    // Mock createObjectURL used by component
    (globalThis as any).URL = (globalThis as any).URL || {};
    (globalThis as any).URL.createObjectURL = jest.fn(() => 'blob://test');

    // Mock FileReader for base64 conversion
    const fileReaderMock: any = function () {} as any;
    fileReaderMock.prototype.readAsDataURL = function (file: any) {
      this.result = 'data:image/png;base64,AAAA';
      if (this.onload) {
        this.onload({} as any);
      }
    };
    fileReaderMock.prototype.onload = null;
    fileReaderMock.prototype.onerror = null;
    (globalThis as any).FileReader = fileReaderMock;

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ChangeOfSignatureSupportingDocumentsComponent],
      providers: [
        { provide: ToastService, useValue: toast },
        { provide: MatDialog, useValue: { open: jest.fn() } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ChangeOfSignatureSupportingDocumentsComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reject customerSigFormObj > 5MB', () => {
    const input = {
      files: [mkFile('big.pdf', 5_000_001, 'application/pdf')],
    } as any as HTMLInputElement;
    component.onDefaultFileChange(input, 'customerSigFormObj');
    expect(toast.show).toHaveBeenCalledWith(
      'Error',
      'Document too large',
      MessageBoxType.DANGER,
      5000,
      undefined,
      undefined,
      false
    );
  });

  it('should reject newSignature/profilePhoto > 200KB', () => {
    const input = {
      files: [mkFile('big.jpg', 200_001, 'image/jpeg')],
    } as any as HTMLInputElement;
    component.onDefaultFileChange(input, 'newSignatureObj');
    expect(toast.show).toHaveBeenCalled();

    component.onDefaultFileChange(input, 'profilePhotoObj');
    expect(toast.show).toHaveBeenCalled();
  });

  it('should emit base64 doc on valid upload for customerSigFormObj', fakeAsync(() => {
    const smallPng = mkFile('small.png', 10_000, 'image/png');
    const input = { files: [smallPng] } as any as HTMLInputElement;

    const sigSpy = jest.fn();
    component.customerSigFormEmitter.subscribe(sigSpy);

    // Bypass FileReader by mocking toBase64 to resolve immediately
    jest.spyOn(component as any, 'toBase64').mockResolvedValue('AAAA');

    component.onDefaultFileChange(input, 'customerSigFormObj');

    // Allow Promise microtask to flush
    flushMicrotasks();

    expect(sigSpy).toHaveBeenCalled();
    const arg = sigSpy.mock.calls.pop()?.[0];
    expect(arg).toEqual({
      Filename: 'small.png',
      Format: 'image/png',
      data: 'AAAA',
    });
  }));

  it('deleteDefaultFileUpload should clear and emit undefined', () => {
    const sigSpy = jest.fn();
    component.customerSigFormEmitter.subscribe(sigSpy);

    const obj: any = {
      uploadedFile: 'x',
      fileName: 'y',
      fileSize: '1kb',
      Url: 'z',
      icon: 'ic-delete',
    };
    component.deleteDefaultFileUpload(obj, 'customerSigFormObj');

    expect(obj.uploadedFile).toBeNull();
    expect(obj.icon).toBe('ic-upload');
    expect(sigSpy).toHaveBeenCalledWith(undefined);
  });
});

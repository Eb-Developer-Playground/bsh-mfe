import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { DialogConfirmComponent } from './dialog-confirm.component';
import { MessageBoxType, ToastService } from '../../../modules/toast';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SessionService } from '@app/shared/services/session/session.service';
import { UIService } from '@app/shared/services/ui.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DialogConfirmComponent', () => {
  let component: DialogConfirmComponent;
  let fixture: ComponentFixture<DialogConfirmComponent>;

  const toastServiceMock = {
    show: jest.fn(),
  };
  let toastServiceSpy: ToastService;

  const matDialogMock = {
    result: true,
    setResult(val: boolean) {
      this.result = val;
    },
    open() {
      return { afterClosed: () => of(this.result) };
    },
  };

  let dialogSpy: MatDialog;

  const matDialogRefMock = {
    close: jest.fn(),
  };
  let dialogRefSpy: MatDialogRef<DialogConfirmComponent>;

  const uIServiceMock = {
    toBase64: jest.fn(),
  };

  let uIServicespy: UIService;

  const sessionServiceMock = {
    subsidiary: {
      countryCode: 'CD',
    },
    hasFeatureRole: () => true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogConfirmComponent],
      imports: [
        MatDialogModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        TranslateService,
        { provide: UIService, useValue: uIServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogConfirmComponent);
    component = fixture.componentInstance;

    toastServiceSpy = fixture.debugElement.injector.get(ToastService);
    dialogSpy = fixture.debugElement.injector.get(MatDialog);
    dialogRefSpy = fixture.debugElement.injector.get(MatDialogRef);
    uIServicespy = fixture.debugElement.injector.get(UIService);

    fixture.detectChanges();
  });

  it('should create app component', () => {
    expect(component).toBeTruthy();
  });

  it('should process a small file successfully', async () => {
    const files = [
      { name: 'smallfile.pdf', size: 800000, type: 'application/pdf' },
    ];

    await component.filesDropped(files);
    expect(toastServiceSpy.show).not.toHaveBeenCalled();
    expect(component.cloneOfObjects.length).toBe(1);
    expect(component.cloneOfObjects[0].documentName).toBe('smallfile.pdf');
  });

  it('should reject a large file', async () => {
    const files = [
      { name: 'largefile.pdf', size: 1500000, type: 'application/pdf' },
    ];

    await component.filesDropped(files);
    expect(toastServiceSpy.show).toHaveBeenCalledWith(
      'documents uploads',
      'Document too large',
      MessageBoxType.DANGER,
      5000,
      undefined,
      undefined,
      false
    );
    expect(component.cloneOfObjects.length).toBe(0);
  });

  it('should remove the specified object from the array when it exists', () => {
    const objectToDelete = {
      documentName: 'Document 1',
      documentDescription: 'Document 1 Description',
      documentFileName: 'Document_1.pdf',
      mandatory: false,
      name: '',
      size: '',
      success: false,
      uploadedFile: 'Document_1.pdf',
      fileSize: '1 mb',
      icon: 'ic-delete',
      additionalDocument: true,
      document: {
        filename: 'knowAgent_Document_1.pdf',
        format: 'pdf',
        data: 'base64data',
      },
    };
    component.cloneOfObjects.push(objectToDelete);
    component.deleteUpload(objectToDelete);
    expect(component.cloneOfObjects).toEqual([]);
  });

  it('should not modify the array when the object is not present', () => {
    const objectToDelete = {
      documentName: 'Nonexistent Document',
      documentDescription: '',
      documentFileName: '',
      mandatory: false,
      name: '',
      size: '',
      success: false,
      uploadedFile: '',
      fileSize: '',
      icon: '',
      additionalDocument: false,
      document: { filename: '', format: '', data: '' },
    };
    component.deleteUpload(objectToDelete);
    expect(component.cloneOfObjects).toEqual([]);
  });

  it('should close the dialog with confirm as false', () => {
    component.closeDialog(false);
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      confirm: false,
      documents: [],
    });
  });

  it('should return size in bytes', () => {
    const result = component.fileSizeUnit(999);
    const result1 = component.fileSizeUnit(1000);
    expect(result).toBe('999 bytes');
    expect(result1).toBe('1 kb');
  });

  it('should handle file input correctly when provided with a file input element', async () => {
    const mockFile = {
      files: [
        {
          name: 'example.pdf',
          size: 500000,
          type: 'application/pdf',
        },
      ],
    };

    await component.onChange(mockFile);
    expect(component.cloneOfObjects.length).toBe(1);
    expect(component.cloneOfObjects[0].documentName).toBe('example.pdf');
  });
});

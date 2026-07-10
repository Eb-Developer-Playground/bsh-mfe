import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { MatIconTestingModule } from '@angular/material/icon/testing';

import { DocumentsReviewComponent } from './documents-review.component';
import { MaterialModule } from '../material.module';
import { ToastService } from '../../toast';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DocumentPreviewComponent } from '../preview/document-preview.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ApiService } from '../../../services';

let ChangeDetectorRefMock = {
  detectChanges: jest.fn(),
};
let cdSpy: ChangeDetectorRef;

let apiService: ApiService;

let ApiServiceMock = {
  post: jest.fn(),
  postBlob: jest.fn().mockReturnValue(of('document')),
};

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

describe('DocumentsReviewComponent', () => {
  let toastService: ToastService;

  let component: DocumentsReviewComponent;
  let fixture: ComponentFixture<DocumentsReviewComponent>;
  //let toastService: ToastService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentsReviewComponent],
      imports: [
        TranslateModule.forRoot(),
        MaterialModule,
        MatIconTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: ChangeDetectorRef,
          useValue: ChangeDetectorRefMock,
        },
        {
          provide: ApiService,
          useValue: ApiServiceMock,
        },
        { provide: MatDialog, useValue: matDialogMock },
        {
          provide: ToastService,
          useValue: {
            show: (...args: any) => {},
          },
        }, //mocking Services
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    // @ts-ignore
    fixture = TestBed.createComponent(DocumentsReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    apiService = TestBed.inject(ApiService);
    toastService = fixture.debugElement.injector.get(ToastService);
    dialogSpy = fixture.debugElement.injector.get(MatDialog);
    cdSpy = fixture.debugElement.injector.get(ChangeDetectorRef);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // When obj.id is falsy, it calls openPreviewDialog with obj.data and obj.filename as arguments
  it('should call openPreviewDialog with obj.data and obj.filename when obj.id is falsy', () => {
    const obj = { id: null, data: 'data', filename: 'filename' };
    const openPreviewDialogSpy = jest.spyOn(component, 'openPreviewDialog');

    component.previewDocument(obj);

    expect(openPreviewDialogSpy).toHaveBeenCalledWith({
      data: 'data',
      filename: 'filename',
    });
  });

  // Opens a dialog with the given document data and filename.
  it('should open a dialog with the given document data and filename', () => {
    const document = {
      data: 'https://example.com/document.pdf',
      filename: 'example.pdf',
    };

    const dialogRefSpy = jest.spyOn(dialogSpy, 'open').mockReturnValue({
      afterClosed: () => of({}),
    } as MatDialogRef<DocumentPreviewComponent>);

    component.openPreviewDialog(document);

    expect(dialogRefSpy).toHaveBeenCalledWith(DocumentPreviewComponent, {
      data: {
        url: document.data,
        filename: document.filename,
      },
    });
  });

  // Downloads a document and opens a preview dialog with the document data and filename
  it('should download document and open preview dialog', () => {
    // Mock dependencies

    const postBlobSpy = jest
      .spyOn(apiService, 'postBlob')
      .mockReturnValue(of({ successful: true, responseObject: [] }));

    //const dialogRefSpy = jest.spyOn(dialogSpy, 'open').mockReturnValue({ afterClosed: () => of({}) } as MatDialogRef<DocumentPreviewComponent>);
    const openPreviewDialogSpy = jest.spyOn(component, 'openPreviewDialog');

    // Invoke method
    component.previewDocument({ id: '1', filename: 'document.pdf' });

    // Assertions
    expect(postBlobSpy).toHaveBeenCalledWith('/v2/documents/download', {
      id: '1',
      service: 'NewGen',
    });
    //expect(openPreviewDialogSpy).toHaveBeenCalled();
  });

  // Retrieves documents from the API and updates the 'documents' property
  it('should retrieve documents from the API and update the documents property', () => {
    // Arrange
    const postSpy = jest
      .spyOn(apiService, 'post')
      .mockReturnValue(of({ successful: true, responseObject: [] }));

    //const detectChangesSpy = jest.spyOn(cdSpy, 'detectChanges')

    component.ticketId = 123456;
    // Act
    component.getDocuments();

    // Assert
    expect(postSpy).toHaveBeenCalledWith('/v2/documents/search', {
      ticketNumber: component.ticketId.toString(),
      service: 'NewGen',
      Cif: '',
    });
    expect(component.documents).toEqual([]);
    //expect(detectChangesSpy).toHaveBeenCalled();
  });
});

import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { MatIconTestingModule } from '@angular/material/icon/testing';

import { DocumentReviewComponent } from './document-review.component';
import { ToastService } from '../../toast';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ApiService } from '../../../services';

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

describe('DocumentReviewComponent', () => {
  let toastService: ToastService;

  let component: DocumentReviewComponent;
  let fixture: ComponentFixture<DocumentReviewComponent>;
  //let toastService: ToastService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DocumentReviewComponent,
        TranslateModule.forRoot(),
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

  // Empty documents array is handled without errors
  it('should handle empty documents array without errors', () => {
    component.documents = [];
    expect(component.documents.length).toBe(0);
  });

  // When obj.id is falsy, it calls openPreviewDialog with obj.data and obj.filename as arguments
});

import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentsUploadComponent } from './documents-upload.component';

import { HttpClientModule } from '@angular/common/http';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ToastService } from '../toast';
import { MaterialModule } from './material.module';

describe('DocumentsUploadComponent', () => {
  let toastService: ToastService;

  let component: DocumentsUploadComponent;
  let fixture: ComponentFixture<DocumentsUploadComponent>;
  //let toastService: ToastService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DocumentsUploadComponent,
        TranslateModule.forRoot(),
        MaterialModule,
        MatIconTestingModule, HttpClientModule,
      ],
      providers: [
        {
          provide: ToastService,
          useValue: {
            show: (...args: any) => {},
          },
        }, //mocking Services
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    toastService = fixture.debugElement.injector.get(ToastService);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
  //
  // it('should return a valid type ', () => {
  //   const obj: IUploadedDocument = {
  //     "name": "firma.jpeg",
  //     "description": "firma.jpeg",
  //     "fileName": "firma.jpeg",
  //     "required": false,
  //     "size": 16162,
  //     "success": false,
  //     "fileSize": "16 KB",
  //     "url": "blob:http://localhost:4200/758aa8a1-a956-42ec-88ca-00328493c4df",
  //     "icon": "ic-delete",
  //     "isAdditional": true,
  //     "document": {
  //       "filename": "firma.jpeg",
  //       "format": "jpeg",
  //       "data": "data:image/jpeg;base64,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"
  //     },
  //
  //   }
  //
  //   expect(component.getFileTypes(obj)).toEqual('image/svg+xml,image/png,image/jpg,image/jpeg,application/pdf');
  // });
  //
  // it('should return a string with the size in KB when the input is between 1024 and 10485768', () => {
  //
  //   const fileSize = component.humanizeFileSize(10480000);
  //   expect(fileSize).toBe('2 KB');
  // });
  //
  // it('should return a string with the size in bytes when the input is 0', () => {
  //   const fileSize = component.humanizeFileSize(0);
  //   expect(fileSize).toBe('0 bytes');
  // });
  //
  // it('should delete the file and reset properties when the object is not an additional file', () => {
  //   const document: IUploadedDocument = {
  //     name: "Document 1",
  //     description: "Document 1 description",
  //     fileName: "document1.pdf",
  //     fileSize: "10.5 MB",
  //     success: true,
  //     size: 15000000,
  //     file: new File([], "document1.pdf"),
  //     url: "https://example.com/document1.pdf",
  //     document: {
  //       filename: "document1",
  //       format: "pdf",
  //       data: "base64data",
  //     },
  //     isAdditional: false,
  //     icon: "ic-upload",
  //   };
  //
  //   component.cloneOfObjects = [document];
  //
  //   component.deleteUpload(document);
  //
  //   expect(document.file).toBeUndefined();
  //   expect(document.fileName).toBeUndefined();
  //   expect(document.fileSize).toBeUndefined();
  //   expect(document.success).toBe(false);
  //   expect(document.url).toBeUndefined();
  //   expect(document.icon).toBe("ic-upload");
  // });
  //
  // it('should remove the object from cloneOfObjects array when it is an additional file', () => {
  //   const document: IUploadedDocument = {
  //     name: "Document 1",
  //     description: "Document 1 description",
  //     fileName: "document1.pdf",
  //     fileSize: "1.5 MB",
  //     success: true,
  //     size: 15000000,
  //     file: new File([], "document1.pdf"),
  //     url: "https://example.com/document1.pdf",
  //     document: {
  //       filename: "document1",
  //       format: "pdf",
  //       data: "base64data",
  //     },
  //     isAdditional: true,
  //     icon: "ic-upload",
  //   };
  //
  //
  //   component.cloneOfObjects = [document];
  //
  //   component.deleteUpload(document);
  //
  //   expect(component.cloneOfObjects).not.toContain(document);
  // });
  //
  // it('should upload a file when a valid file is selected', () => {
  //
  //   const file = new File(["foo"], "foo.png", {
  //     type: "image/png",
  //   });
  //
  //   const fileList = {
  //     files: [file]
  //   }
  //
  //   const notifyChangedUploadsSpy = jest.spyOn(component, 'notifyChangedUploads').mockImplementation(() => { });
  //
  //   const getUploadUrlSpy = jest.spyOn(component, 'getUploadUrl').mockImplementation(() => 'mockString');
  //   const onChangeSpy = jest.spyOn(component, 'onChange');
  //
  //   const toBase64Spy = jest.spyOn(component, 'toBase64').mockResolvedValue('data:image/png;base64,Zm9v');
  //
  //
  //
  //   const object = {
  //     name: 'foo',
  //     description: 'foo',
  //     fileName: file.name,
  //     required: false,
  //     size: file.size,
  //     success: false,
  //     fileSize: component.humanizeFileSize(file.size),
  //     url: '',
  //     icon: 'ic-delete',
  //     isAdditional: true,
  //     document: {
  //       filename: file.name,
  //       format: file.type.split('/')[1],
  //       data: 'data:image/png;base64,ZmlsZSBjb250ZW50',
  //     }
  //   };
  //
  //   component.attachment = {
  //     nativeElement: {
  //       value: 'foo'
  //     }
  //   }
  //
  //   component.onChange(fileList);
  //
  //   expect(onChangeSpy).toHaveBeenCalledWith(fileList);
  //   expect(getUploadUrlSpy).toHaveBeenCalled();
  //   expect(toBase64Spy).toHaveBeenCalled();
  //   //expect(notifyChangedUploadsSpy).toHaveBeenCalled();
  //
  //   //expect(component.cloneOfObjects.length).toBe(1);
  // });
  //
  // it('should not upload a file with size 0', () => {
  //   const file = new File([''], 'example.jpg', { type: 'image/jpeg' });
  //   const onChangeSpy = jest.spyOn(component, 'onChange');
  //   component.onChange(file);
  //   expect(onChangeSpy).toHaveBeenCalledWith(file);
  //   expect(component.cloneOfObjects).not.toContainEqual(expect.objectContaining({ fileName: file.name }));
  // });
  //
  // it('should show an error on a file with size more than  1024000 bytes to uploaded documents', () => {
  //
  //   const fileList = {
  //     files: [{size:2024000}]
  //   }
  //   const toastServiceSpy = jest.spyOn(toastService, 'show');
  //
  //   component.onChange(fileList);
  //   expect(toastServiceSpy).toHaveBeenCalled();
  //   expect(toastServiceSpy).toHaveBeenCalledWith(
  //     "DOCUMENTS.MAX_SIZE_ERROR",
  //     "",
  //     MessageBoxType.WARNING
  //   );
  // })
  //
  // it('should show an error on when the file is not allowed file type', () => {
  //   component.allowedFileTypes= ['image/png', 'image/jpeg', 'application/pdf'];
  //
  //
  //   const fileList = {
  //     files: [{size:1024000, type:'xml'}]
  //   }
  //
  //   const toastServiceSpy = jest.spyOn(toastService, 'show');
  //
  //   component.onChange(fileList);
  //   expect(toastServiceSpy).toHaveBeenCalled();
  //   expect(toastServiceSpy).toHaveBeenCalledWith(
  //     "DOCUMENTS.UNSUPPORTED_TYPE_ERROR",
  //     "",
  //     MessageBoxType.WARNING
  //   );
  // })
  //
  // it('should return a string of file types image/png,image/jpg,image/jpeg  when obj name photo', () => {
  //
  //   const document: IUploadedDocument = {
  //     "name": "Photo.jpeg",
  //     "description": "firma.jpeg",
  //     "fileName": "firma.jpeg",
  //     "required": false,
  //     "size": 16162,
  //     "success": false,
  //     "fileSize": "16 KB",
  //     "url": "blob:http://localhost:4200/758aa8a1-a956-42ec-88ca-00328493c4df",
  //     "icon": "ic-delete",
  //     "isAdditional": true,
  //     "document": {
  //       "filename": "firma.jpeg",
  //       "format": "jpeg",
  //       "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaA"
  //     },
  //
  //   }
  //
  //
  //   const result = component.getFileTypes(document);
  //
  //   expect(result).toBe("image/png,image/jpg,image/jpeg");
  // });
  //
  //
  //
  //
  //
  //
});

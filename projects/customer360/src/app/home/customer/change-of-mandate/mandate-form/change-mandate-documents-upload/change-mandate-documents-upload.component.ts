import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgForOf, NgIf, NgClass, NgStyle } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { DragDropDocumentsDirective } from '@app/shared/directives/drag-drop-documents.directive';

@Component({
  selector: 'app-change-mandate-documents-upload',
  templateUrl: './change-mandate-documents-upload.component.html',
  styleUrls: ['./change-mandate-documents-upload.component.scss'],
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    NgStyle,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    TranslatePipe,
    DragDropDocumentsDirective,
  ],
})
export class ChangeMandateDocumentsUploadComponent implements OnInit {
  @Output() cloneOfObjectsEmitter: EventEmitter<any> = new EventEmitter();
  @Output() defaultDocumentsEmitter: EventEmitter<any> = new EventEmitter();

  @ViewChild('attachments') attachment: any;
  size: any;
  unit: any;
  _truncatedSize: any;
  supportDocumentBackground =
    '../../../../../../../assets/images/Illustration-background.svg';

  UploadList: File[] = [];
  cloneOfObjects: Array<any> = [];

  customerSigFormObj?: any = {
    icon: 'ic-upload',
  };
  newSignatureObj?: any = {
    icon: 'ic-upload',
  };
  profilePhotoObj?: any = {
    icon: 'ic-upload',
  };

  profilePhotoObj1?: any = {
    icon: 'ic-upload',
  };

  isChecked = false;
  private arrayDocsBae64: FileData[] = [];

  constructor(
    public dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {}

  fileSizeUnit(size: number) {
    if (size < 1000) {
      this.size = size;
      this.unit = 'bytes';
    } else if (size < 1000 * 1000) {
      this.size = size / 1000;
      this.unit = 'kb';
    } else if (size < 1000 * 1000 * 1000) {
      this.size = size / 1000 / 1000;
      this.unit = 'mb';
    } else {
      this.size = size / 1000 / 1000 / 1000;
      this.unit = 'gb';
    }

    this._truncatedSize = Math.trunc(this.size);
    return this._truncatedSize + ' ' + this.unit;
  }

  toBase64 = (file: any) =>
    new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      /*reader.onload = () => resolve(reader.result?.toString());
            reader.onerror = error => reject(error);*/
      reader.onload = () => {
        let encoded = reader.result?.toString().replace(/^data:(.*,)?/, '');
        if (encoded && encoded.length % 4 > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });

  getUploadUrl = (file: any) => {
    return URL.createObjectURL(file);
  };

  onDefaultFileChange(file: HTMLInputElement, name: string) {
    const files = (file && file.files && file.files) || [];
    if (files.length == 0) {
      return;
    }

    if (files[0].size > 1024000) {
      this.toastService.show(
        'documents uploads',
        'Document too large',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
      return;
    }

    const url = this.getUploadUrl(files[0]);
    const obj = {
      uploadedFile: files[0],
      name: files[0].name,
      fileSize: this.fileSizeUnit(files[0].size),
      Url: url,
      icon: 'ic-delete',
      additionalDocument: true,
      type: this.getFileType(files[0].type),
    };

    this.toBase64(obj.uploadedFile).then(base64File => {
      const objDoc = { filename: '', format: '', data: '' };
      objDoc.format = obj.type;
      objDoc.filename = name ? name : obj.name;
      objDoc.data = base64File;

      if (name === 'customerSigFormObj') {
        this.customerSigFormObj = obj;
        //this.customerSigFormEmitter.emit(objDoc);
      }
      if (name === 'newSignatureObj') {
        this.newSignatureObj = obj;
        //this.newSignatureFileEmitter.emit(objDoc);
      }
      if (name === 'profilePhotoObj') {
        this.profilePhotoObj = obj;
        //this.profilePhotoFileEmitter.emit(objDoc);
      }
      if (name === 'profilePhotoObj1') {
        this.profilePhotoObj1 = obj;
        //this.profilePhotoFileEmitter.emit(objDoc);
      }

      this.arrayDocsBae64.push(objDoc);

      this.defaultDocumentsEmitter.emit(this.arrayDocsBae64);
    });
  }

  deleteDefaultFileUpload(object: any, name: string) {
    object.uploadedFile = null;
    object.fileName = null;
    object.fileSize = null;
    (object.Url = null), (object.icon = 'ic-upload');
    if (name === 'customerSigFormObj') {
      this.customerSigFormObj = object;
      //this.customerSigFormEmitter.emit(undefined);
    }
    if (name === 'newSignatureObj') {
      this.newSignatureObj = object;
      //this.newSignatureFileEmitter.emit(undefined);
    }
    if (name === 'profilePhotoObj') {
      this.profilePhotoObj = object;
      //this.profilePhotoFileEmitter.emit(undefined);
    }

    if (name === 'profilePhotoObj1') {
      this.profilePhotoObj1 = object;
      //this.profilePhotoFileEmitter.emit(undefined);
    }

    const index = this.arrayDocsBae64
      .map(obj => obj.filename === name)
      .indexOf(object);
    this.arrayDocsBae64.splice(index, 1);
    this.defaultDocumentsEmitter.emit(this.arrayDocsBae64);
  }

  onChange(file: any, object?: any) {
    if (file.files.length == 0) {
      return;
    }

    if (file.files[0].size > 1024000) {
      this.toastService.show(
        'documents uploads',
        'Document too large',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
      return;
    }

    if (object) {
      object.uploadedFile = file.files[0];
      object.fileName = file.files[0].name;
      const fileSize = file.files[0].size;
      object.fileSize = this.fileSizeUnit(fileSize);
      object.Url = this.getUploadUrl(file.files[0]);
      object.icon = 'ic-delete';
      if (this.attachment && this.attachment.nativeElement) {
        this.attachment.nativeElement.value = '';
      }
    } else {
      const url = this.getUploadUrl(file.files[0]);
      this.cloneOfObjects.push({
        uploadedFile: file.files[0],
        name: file.files[0].name,
        fileSize: this.fileSizeUnit(file.files[0].size),
        Url: url,
        icon: 'ic-delete',
        additionalDocument: true,
        type: this.getFileType(file.files[0].type),
      });

      const arrayDocsBae64: FileData[] = [];
      this.cloneOfObjects.forEach(file => {
        this.toBase64(file.uploadedFile).then(base64File => {
          const objDoc = { filename: '', format: '', data: '' };
          objDoc.format = file.type;
          objDoc.filename = file.name;
          objDoc.data = base64File;
          arrayDocsBae64.push(objDoc);

          this.cloneOfObjectsEmitter.emit(arrayDocsBae64);
        });
      });

      if (this.attachment && this.attachment.nativeElement) {
        this.attachment.nativeElement.value = '';
      }
    }
  }

  deleteUpload(object: any) {
    if (object.additionalDocument) {
      const index = this.cloneOfObjects.indexOf(object);
      this.cloneOfObjects.splice(index, 1);

      const arrayDocsBae64: FileData[] = [];
      this.cloneOfObjects.forEach(file => {
        this.toBase64(file.uploadedFile).then(base64File => {
          const objDoc = { filename: '', format: '', data: '' };
          objDoc.format = file.type;
          objDoc.filename = file.name;
          objDoc.data = base64File;
          arrayDocsBae64.push(objDoc);

          this.cloneOfObjectsEmitter.emit(arrayDocsBae64);
        });
      });
    } else {
      object.uploadedFile = null;
      object.fileName = null;
      object.fileSize = null;
      (object.Url = null), (object.icon = 'ic-upload');

      this.cloneOfObjectsEmitter.emit([]);
    }
  }

  openUploadedDocsDialog() {
    this.isChecked = true;
  }

  filesDropped(files: any) {
    if (files[0].size > 1024000) {
      return;
    }
    const url = this.getUploadUrl(files[0]);
    this.cloneOfObjects.push({
      uploadedFile: files[0],
      name: files[0].name,
      fileSize: this.fileSizeUnit(files[0].size),
      Url: url,
      icon: 'ic-delete',
      additionalDocument: true,
    });
    this.attachment.nativeElement.value = '';
  }

  private getFileType(type: string): string {
    if (type === 'image/svg+xml') {
      return 'svg';
    } else if (type === 'image/png') {
      return 'png';
    } else if (type === 'image/jpeg') {
      return 'jpg';
    } else if (type === 'application/pdf') {
      return 'pdf';
    } else {
      return '';
    }
  }
}

export interface FileData {
  filename: string;
  format: string;
  data: string;
}

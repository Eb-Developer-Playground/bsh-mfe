import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { DragDropDocumentsDirective } from '@shared/modules/upload-docs';

@Component({
  selector: 'app-supporting-documents',
  templateUrl: './supporting-documents.component.html',
  styleUrls: ['./supporting-documents.component.scss'],
  imports: [
    TranslatePipe,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    DragDropDocumentsDirective,
  ],
})
export class SupportingDocumentsComponent implements OnInit {
  @Output() cloneOfObjectsEmitter: EventEmitter<any> = new EventEmitter();
  @ViewChild('attachments') attachment: any;
  size: any;
  unit: any;
  _truncatedSize: any;
  supportDocumentBackground =
    '../../../../../../../assets/images/Illustration-background.svg';

  UploadList: File[] = [];
  cloneOfObjects: Array<any> = [];
  isChecked = false;
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

  onChange(file: any, object?: any) {
    if (file.files.length == 0) {
      return;
    }

        if (file.files[0].size > 1024000) {
            this.toastService.show(
                'documents uploads',
                'Document too large',
                MessageBoxType.DANGER,
                5000, undefined, undefined, false
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

      const arrayDocsBae64: any = [];
      this.cloneOfObjects.forEach(file => {
        this.toBase64(file.uploadedFile).then(base64File => {
          const objDoc = { Filename: '', Format: '', data: '' };

          objDoc.Format = file.type;
          objDoc.Filename = file.name;
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
    } else {
      object.uploadedFile = null;
      object.fileName = null;
      object.fileSize = null;
      (object.Url = null), (object.icon = 'ic-upload');
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

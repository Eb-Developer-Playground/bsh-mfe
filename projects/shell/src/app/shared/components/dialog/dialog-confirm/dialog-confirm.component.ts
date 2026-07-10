import { Component, Inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
import { UIService } from 'src/app/shared/services';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { IUploadedDocument } from '@app/shared/modules/upload-docs';
import { DocumentsUploadDrcComponent } from '../../../modules/upload-docs/documents-upload-drc/documents-upload-drc.component';
import {
  ISubsidiary,
  SessionService,
} from '@app/shared/services/session/session.service';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss'],
  imports: [COMPAT_IMPORTS, DocumentsUploadDrcComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DialogConfirmComponent implements OnInit {
  title!: string;
  subtitle!: string;
  bodyDescription!: string;
  cancelButtonLabel = 'COMMON.QUIT';
  confirmButtonLabel = 'COMMON.CONFIRM';
  dataObject: { code: string; title: string; value: string }[] = [];
  cloneOfObjects: Array<any> = [];
  size: any;
  unit: any;
  _truncatedSize: any;
  showDocumentUpload = false;
  customerNotPresent = false;
  allowedFileTypes = ['image/png', 'image/jpeg', 'application/pdf'];
  showCloseIcon = true;
  showConfirmButton = true;
  showCancelButton = true;
  public uploadedDocs: IUploadedDocument[] = [];
  public uploadedDocsAreValid = false;
  subsidiary: ISubsidiary;
  countryCode: string = '';

  constructor(
    private toastService: ToastService,
    private uIservice: UIService,
    private session: SessionService,
    public dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.subsidiary = this.session.subsidiary;
    this.title = data.title;
    this.showDocumentUpload = data?.showDocumentUpload;
    this.customerNotPresent = data?.customerNotPresent;
    this.bodyDescription = data.bodyDescription;
    this.dataObject = data?.dataObject;
    this.cancelButtonLabel = data?.cancelButtonLabel
      ? data.cancelButtonLabel
      : this.cancelButtonLabel;
    this.confirmButtonLabel = data?.confirmButtonLabel
      ? data.confirmButtonLabel
      : this.confirmButtonLabel;

    this.showCloseIcon = data?.showCloseIcon;

    if (data.showConfirmButton === false) {
      this.showConfirmButton = false;
    }
    if (data.showCancelButton === false) {
      this.showCancelButton = false;
    }
  }

  async filesDropped(files: any) {
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
    const base64 = await this.uIservice.toBase64(files[0]);

    this.cloneOfObjects.push({
      documentName: files[0].name,
      documentDescription: files[0].name,
      documentFileName: files[0].name,
      mandatory: false,
      name: '',
      size: '',
      success: false,
      uploadedFile: files[0],
      fileSize: this.fileSizeUnit(files[0].size),
      icon: 'ic-delete',
      additionalDocument: true,
      document: {
        filename: `knowAgent_${files[0].name}`,
        format: files[0].type.split('/')[1],
        data: base64,
      },
    });
    // this.attachment.nativeElement.value = '';
  }

  deleteUpload(object: any) {
    const index = this.cloneOfObjects.indexOf(object);
    this.cloneOfObjects.splice(index, 1);
  }

  ngOnInit(): void {
    this.countryCode = this.session.subsidiary.countryCode;
  }

  closeDialog(confirm = false): void {
    if (this.session.subsidiary.countryCode === 'CD') {
      this.dialogRef.close({
        confirm,
        documents: this.uploadedDocs,
      });
    } else {
      this.dialogRef.close({ confirm, documents: this.cloneOfObjects });
    }
  }

  onDialogClose(result: any): void {
    if (result?.confirmed && result?.documents) {
      const documents = result.documents;
    }
  }

  getDocuments(documents: IUploadedDocument[]) {
    if (this.session.subsidiary.countryCode === 'CD') {
      // For CD documents
      this.uploadedDocsAreValid = documents
        .filter(doc => doc.required)
        .every(doc => doc.fileName && doc.docCode);
    } else {
      // For non-CD documents
      this.uploadedDocsAreValid = documents
        .filter(doc => doc.required)
        .every(doc => doc.fileName);
    }

    if (this.uploadedDocsAreValid) {
      this.cloneOfObjects = documents;
    }
  }

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

  async onChange(file: any) {
    let _file: any;
    if (file && file?.files) {
      _file = file?.files[0];
    }
    //DragDrop
    if (file && file[0]) {
      _file = file[0];
    }
    if (!_file) {
      return;
    }
    if (_file.size > 1024000) {
      this.toastService.show(
        null,
        'DOCUMENTS.MAX_SIZE_ERROR',
        MessageBoxType.WARNING,
        5000,
        undefined,
        undefined,
        true
      );
      return;
    }

    if (this.allowedFileTypes) {
      if (!this.allowedFileTypes.includes(_file.type)) {
        this.toastService.show(
          null,
          'DOCUMENTS.UNSUPPORTED_TYPE_ERROR',
          MessageBoxType.WARNING,
          5000,
          undefined,
          undefined,
          true
        );
        return;
      }
    }

    const base64 = await this.uIservice.toBase64(file.files[0]);

    //const prefixDocument = this.reasonForm.controls.action.value;
    this.cloneOfObjects.push({
      documentName: file.files[0].name,
      documentDescription: file.files[0].name,
      documentFileName: file.files[0].name,
      mandatory: false,
      name: '',
      size: '',
      success: false,
      fileSize: this.fileSizeUnit(file.files[0].size),
      additionalDocument: true,
      document: {
        filename: `knowAgent__${file.files[0].name}`,
        format: file.files[0].type.split('/')[1],
        data: base64,
      },
      uploadedFile: file.files[0],
    });
  }
}

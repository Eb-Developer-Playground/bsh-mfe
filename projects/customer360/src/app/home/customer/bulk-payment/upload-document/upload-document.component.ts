import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgIf, NgFor, NgClass, NgStyle } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { Subject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  ContextManager,
  OnActive,
  OnSave,
  StepperChildComponent,
} from '@app/shared/modules/stepper';
import { DocumentsService } from '@app/shared/services/document/document.service';
import { BulkPaymentService } from '@app/core/services/bulk-payment/bulk-payment.service';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { NotificationsComponent } from '@app/shared/modules/notifications';
import { DragDropDocumentsDirective } from '@app/shared/modules/upload-docs/drag-drop-documents.directive';

@Component({
  selector: 'app-upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.scss'],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    NgStyle,
    TranslatePipe,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    NotificationsComponent,
    DragDropDocumentsDirective,
  ],
})
export class UploadDocumentComponent
  extends StepperChildComponent
  implements OnInit, OnActive, OnSave
{
  @Output() cloneOfObjectsEmitter: EventEmitter<any> = new EventEmitter();
  @Output() documentUploaded = new EventEmitter();
  @ViewChild('attachments') attachment: any;
  size: any;
  unit: any;
  files: Array<any> = [];
  _truncatedSize: any;
  supportDocumentBackground =
    '../../../../../../../assets/images/Illustration-background.svg';
  UploadList: File[] = [];
  getUploads = {};
  cloneOfObjects: Array<any> = [];
  isChecked = false;
  destroy$: Subject<any> = new Subject<any>();
  customerCifData = JSON.parse(<string>localStorage.getItem('customerCifData'));
  accountNumbers = JSON.parse(<string>localStorage.getItem('accounts'));
  docsBae64: any = [];
  subscriptions$: Subscription[] = [];

  constructor(
    private bulkPaymentService: BulkPaymentService,
    private documentsService: DocumentsService,
    private ctxManager: ContextManager,
    private toastService: ToastService,
    public translateService: TranslateService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {}

  onActive() {}

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

  async onChange(file: any, object?: any) {
    if (file.files.length == 0) {
      return;
    }


        if (file.files[0].size > 1024000) {
            this.toastService.show(
                this.translateService.instant('BULK-TRANFER.DOCUMENTS-UPLOADS'),
                this.translateService.instant('BULK-TRANFER.TOO-LARGE'),
                MessageBoxType.DANGER,
                5000, undefined, undefined, true
            );
            return;
        }

    if (object) {
      object.uploadedFile = file.files[0];
      object.fileName = file.files[0].name;
      let fileSize = file.files[0].size;
      object.fileSize = this.fileSizeUnit(fileSize);
      object.Url = this.getUploadUrl(file.files[0]);
      object.icon = 'ic-delete';
      if (this.attachment && this.attachment.nativeElement) {
        this.attachment.nativeElement.value = '';
      }
    } else {
      const url = this.getUploadUrl(file.files[0]);
      const base64 = await this.toBase64(file.files[0]);

      this.files.push(file.files);

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
      this.docsBae64 = [];

      this.cloneOfObjects.forEach(file => {
        this.toBase64(file.uploadedFile).then(base64File => {
          const objDoc = { Filename: '', Format: '', data: '' };

          objDoc.Format = file.type;
          objDoc.Filename = file.name.replace('.pdf', '');
          objDoc.data = base64File;

          arrayDocsBae64.push(objDoc);
        });
      });

      this.docsBae64 = arrayDocsBae64;

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

  async filesDropped(files: any) {
    if (files[0].size > 1024000) {
      return;
    }
    const base64 = await this.toBase64(files[0]);

    let url = this.getUploadUrl(files[0]);
    this.cloneOfObjects.push({
      uploadedFile: files[0],
      name: files[0],
      fileSize: this.fileSizeUnit(files[0].size),
      Url: url,
      icon: 'ic-delete',
      additionalDocument: true,
    });
    // this.attachment.nativeElement.value = '';

    const arrayDocsBae64: any = [];
    this.cloneOfObjects.forEach(file => {
      this.toBase64(file.uploadedFile).then(base64File => {
        const objDoc = { Filename: '', Format: '', data: '' };

        objDoc.Format = file.type;
        objDoc.Filename = file.name.replace('.pdf', '');
        objDoc.data = base64File;

        arrayDocsBae64.push(objDoc);
      });
    });
  }

  onSave(): void {
    let ticketId = this.ctxManager.currentContextData.ticket.id;

    let uploadObj = {
      CIF: this.accountNumbers[0].cif, // pass customers cif
      AccountNumber: this.accountNumbers[0].accountNumber,
      Country: this.customerCifData.personalDetails.nationality,
      ticketNumber: ticketId.toString(), // pass ticket id
      idType: this.customerCifData.personalDetails.idType || '', // pass id type
      idNumber: this.customerCifData.personalDetails.idNumber || '', // pass id number
      Service: 'NewGen',
      documents: this.docsBae64,
    };

    this.uploadFileService(uploadObj);
  }

  uploadFileService = (uploadObj: any) => {
    let flagFalseRes: boolean;
    let flagDocName: any;
    // let docs = this.docsArray.map(doc => doc.document).filter(doc => doc.filename !== '' && doc.filename !== 'Photo' && doc.filename !== 'SigPhoto');

        const documentsServiceUploadSub$ = this.documentsService.upload(uploadObj).pipe(take(1)).subscribe(
            (v) => {

                const results = v.map(
                    (upRes: { responseObject: any }) => upRes.responseObject
                );
                let uploadedDocuments: any[] = [];
                for (let i = 0; i < results.length; i++)
                    uploadedDocuments = uploadedDocuments.concat(results[i]);
                // check for each document if successful
                this.cloneOfObjects.forEach((doc) => {
                    uploadedDocuments.forEach((v) => {
                        // add green tick to other documents
                        if (!v.success) {
                            if (v.filename === doc.name) {
                                doc.success = v.success;
                                // this.flagFail = true;
                                this.toastService.show(
                                    v.filename + this.translateService.instant('BULK-TRANFER.DOCUMENT-FAILED'),
                                    '',
                                    MessageBoxType.DANGER,
                                    5000, undefined, undefined, false
                                );
                                flagFalseRes = true;
                            }

              return;
            }

            if (v.success) {
              if (v.filename === doc.name) {
                flagDocName = v.filename;
                doc.success = v.success;

                flagFalseRes = false;
              }
            }

                        this.bulkPaymentService.submitSupportingDoc(uploadObj.ticketNumber).subscribe(res => {
                            if (res.successful) {
                                this.toastService.show(
                                    res.statusMessage,
                                    '',
                                    MessageBoxType.SUCCESS,
                                    5000, undefined, undefined, false
                                );
                                this.documentUploaded.emit(true)
                            }
                        });
                    });
                });


            }
        );

    this.subscriptions$.push(documentsServiceUploadSub$);
  };

  ngOnDestroy(): void {
    this.subscriptions$.forEach(subscription => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });

    this.destroy$.next(true);
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
